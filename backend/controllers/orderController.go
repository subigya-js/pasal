package controllers

import (
	"backend/database"
	"backend/helper"
	"backend/model"
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// POST /api/orders/place
func PlaceOrder(c *gin.Context) {
	orderCollection := database.GetCollection("orders")
	cartCollection := database.GetCollection("carts")

	// Get user ID from JWT token
	userId, success := helper.GetUserID(c)
	if !success {
		return
	}

	// Input validation
	var input struct {
		ShippingAddress model.ShippingAddress `json:"shipping_address" binding:"required"`
		PaymentMode     model.PaymentMode     `json:"payment_mode" binding:"required"`
		Notes           string                `json:"notes,omitempty"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Validate payment mode
	paymentMode := model.PaymentMode(input.PaymentMode)
	if !paymentMode.IsValid() {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid payment mode.",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get user's cart
	var cart model.Cart
	err := cartCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&cart)

	if err == mongo.ErrNoDocuments {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Cart not found.",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch cart.",
		})
		log.Println("Failed to fetch cart: ", err)
		return
	}

	if len(cart.Items) >= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Cart is empty.",
		})
		return
	}

	// Convert cart items to order items
	var orderItems []model.OrderItem
	for _, cartItem := range cart.Items {
		orderItem := model.OrderItem{
			ProductID:    cartItem.ProductID,
			Product:      cartItem.Product,
			Quantity:     cartItem.Quantity,
			PricePerUnit: cartItem.Price,
			TotalPrice:   float64(cartItem.Quantity) * cartItem.Price,
		}
		orderItems = append(orderItems, orderItem)
	}

	// Generate unique order number
	orderNumber := fmt.Sprintf("ORD-%d-%s", time.Now().Unix(), userId.Hex()[:6])

	// Create order
	order := model.Order{
		ID:              primitive.NewObjectID(),
		OrderNumber:     orderNumber,
		UserID:          userId,
		Items:           orderItems,
		ShippingAddress: input.ShippingAddress,
		OrderStatus:     model.OrderStatusPending,
		PaymentStatus:   model.PaymentStatusPending,
		PaymentMode:     paymentMode,
		Notes:           input.Notes,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Calculate totals
	order.CalculateTotals()

	// Validate order
	if validationErrors := order.Validate(); len(validationErrors) > 0 {
		errorMessages := make([]string, len(validationErrors))
		for i, err := range validationErrors {
			errorMessages[i] = err.Error()
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Order validation failed",
			"details": errorMessages,
		})
		return
	}

	// Insert order
	_, err = orderCollection.InsertOne(ctx, order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to place order.",
		})
		log.Println("Failed to create order: ", err)
		return
	}

	// Clear user's cart
	_, err = cartCollection.UpdateOne(
		ctx,
		bson.M{"user_id": userId},
		bson.M{"$set": bson.M{
			"items":         []model.CartItem{},
			"cart_quantity": 0,
			"total_price":   0,
			"updated_at":    time.Now(),
		}},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to clear cart.",
		})
		log.Println("Failed to clear cart: ", err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Order placed successfully.",
		"order":   order,
	})
}
