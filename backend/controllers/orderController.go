package controllers

import (
	"backend/database"
	"backend/helper"
	"backend/model"
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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

// GET /api/orders
func GetOrders(c *gin.Context) {
	orderCollection := database.GetCollection("orders")

	// Get users ID from JWT token.
	userId, success := helper.GetUserID(c)
	if !success {
		return
	}

	// Get pagination and filtering
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	status := c.Query("status")

	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	skip := (page - 1) * limit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Build filter
	filter := bson.M{"user_id": userId}
	if status != "" {
		orderStatus := model.OrderStatus(status)
		if orderStatus.IsValid() {
			filter["order_status"] = orderStatus
		}
	}

	// Get total count
	total, err := orderCollection.CountDocuments(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to count orders.",
		})
		log.Println("Failed to count orders: ", err)
		return
	}

	// Find orders
	findOptions := options.Find()
	findOptions.SetSkip(int64(skip))
	findOptions.SetLimit(int64(limit))
	findOptions.SetSort(bson.D{{"created_at", -1}})

	cursor, err := orderCollection.Find(ctx, filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch orders.",
		})
		log.Println("Failed to fetch orders: ", err)
		return
	}
	defer cursor.Close(ctx)

	var orders []model.Order
	if err = cursor.All(ctx, &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch orders.",
		})
		return
	}

	if orders == nil {
		orders = []model.Order{}
	}

	totalPages := (total + int64(limit) - 1) / int64(limit)
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Orders fetched successfully.",
		"orders":  orders,
		"pagination": gin.H{
			"current_page": page,
			"total_pages":  totalPages,
			"total_items":  total,
			"has_next":     page < int(totalPages),
			"has_prev":     page > 1,
		},
	})
}

// GET /api/orders/:id
func GetOrderDetails(c *gin.Context) {
	orderCollection := database.GetCollection("orders")
	orderID := c.Param("id")

	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Order ID is required",
		})
		return
	}

	// Get users ID from JWT token.
	userId, success := helper.GetUserID(c)
	if !success {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	orderObjectID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid order ID.",
		})
		return
	}

	var order model.Order
	err = orderCollection.FindOne(ctx, bson.M{
		"_id":     orderObjectID,
		"user_id": userId,
	}).Decode(&order)

	if err == mongo.ErrNoDocuments {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Order not found.",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch order details.",
		})
		log.Println("Failed to fetch order: ", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Order details fetched successfully.",
		"order":   order,
	})
}

// PUT /api/orders/:id/cancel
func CancelOrder(c *gin.Context) {
	orderCollection := database.GetCollection("orders")
	orderID := c.Param("id")

	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Order ID is required",
		})
		return
	}

	// Get users ID from JWT token.
	userId, success := helper.GetUserID(c)
	if !success {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	orderObjectID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid order ID.",
		})
		return
	}

	var order model.Order
	err = orderCollection.FindOne(ctx, bson.M{
		"_id":     orderObjectID,
		"user_id": userId,
	}).Decode(&order)

	if err == mongo.ErrNoDocuments {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Order not found.",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch order.",
		})
		log.Println("Failed to fetch order: ", err)
		return
	}

	if !order.OrderStatus.CanBeCancelled() {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Cannot cancel order with status '%s'", order.OrderStatus),
		})
		return
	}

	_, err = orderCollection.UpdateOne(
		ctx,
		bson.M{
			"_id":     orderObjectID,
			"user_id": userId,
		},
		bson.M{"$set": bson.M{
			"order_status": model.OrderStatusCancelled,
			"updated_at":   time.Now(),
		}},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to cancel order.",
		})
		log.Println("Failed to cancel order: ", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Order cancelled successfully.",
	})
}
