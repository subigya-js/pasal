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
	productCollection := database.GetCollection("products")

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
			"error": "Invalid payment mode. Valid modes: Cash, Card, Online Payment, Wallet.",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
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

	if len(cart.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Cart is empty.",
		})
		return
	}

	// Validate stock availability and prepare order items
	var orderItems []model.OrderItem
	stockUpdates := []mongo.WriteModel{}

	for _, cartItem := range cart.Items {
		// Fetch current product details to verify stock and price
		var product model.Product
		err := productCollection.FindOne(ctx, bson.M{
			"_id":       cartItem.ProductID,
			"is_active": true,
		}).Decode(&product)

		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Product '%s' is no longer available.", cartItem.Product.Name),
			})
			return
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to verify product availability.",
			})
			log.Println("Failed to fetch product: ", err)
			return
		}

		// Check stock availability
		if product.Stock < cartItem.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Insufficient stock for '%s'. Only %d Available",
					product.Name, product.Stock),
			})
			return
		}

		// Create order item with current product price
		orderItem := model.OrderItem{
			ProductID:    cartItem.ProductID,
			Product:      &product,
			Quantity:     cartItem.Quantity,
			PricePerUnit: product.Price, // Use current price, not cart price
			TotalPrice:   float64(cartItem.Quantity) * product.Price,
		}
		orderItems = append(orderItems, orderItem)

		// Update Stock
		stockUpdate := mongo.NewUpdateOneModel().
			SetFilter(bson.M{"_id": cartItem.ProductID}).
			SetUpdate(bson.M{
				"$inc": bson.M{"stock": -cartItem.Quantity},
				"$set": bson.M{"updated_at": time.Now()},
			})
		stockUpdates = append(stockUpdates, stockUpdate)
	}

	// // Convert cart items to order items
	// var orderItems []model.OrderItem
	// for _, cartItem := range cart.Items {
	// 	orderItem := model.OrderItem{
	// 		ProductID:    cartItem.ProductID,
	// 		Product:      cartItem.Product,
	// 		Quantity:     cartItem.Quantity,
	// 		PricePerUnit: cartItem.Price,
	// 		TotalPrice:   float64(cartItem.Quantity) * cartItem.Price,
	// 	}
	// 	orderItems = append(orderItems, orderItem)
	// }

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

	// Start a MongoDB session for transaction
	session, err := database.Client.StartSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to start transaction.",
		})
		log.Println("Failed to start session: ", err)
		return
	}
	defer session.EndSession(ctx)

	// Execute transaction
	_, err = session.WithTransaction(ctx, func(sessCtx mongo.SessionContext) (interface{}, error) {
		// 1. Insert Order
		_, err = orderCollection.InsertOne(sessCtx, order)
		if err != nil {
			return nil, fmt.Errorf("Failed to insert order: %w", err)
		}

		// 2. Update product stock
		if len(stockUpdates) > 0 {
			_, err = productCollection.BulkWrite(sessCtx, stockUpdates)
			if err != nil {
				return nil, fmt.Errorf("Failed to update stock: %w", err)
			}
		}

		// 3. Clear user's cart
		_, err = cartCollection.UpdateOne(
			sessCtx,
			bson.M{"user_id": userId},
			bson.M{"$set": bson.M{
				"items":         []model.CartItem{},
				"cart_quantity": 0,
				"total_price":   0,
				"updated_at":    time.Now(),
			}},
		)
		if err != nil {
			return nil, fmt.Errorf("Failed to clear cart: %w", err)
		}

		return nil, nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to place order. Please try again.",
			"details": err.Error(),
		})
		log.Println("Transaction failed: ", err)
		return
	}

	// Success response
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Order placed successfully. You will receive a confirmation email shortly.",
		"order":   order,
	})

	// TODO: Send order confirmation email
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

	// Parse and validate page
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	// Parse and validate limit
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
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
	findOptions.SetSort(bson.D{{"created_at", -1}}) // Most recent first

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
		log.Println("Failed to fetch orders: ", err)
		return
	}

	// Return empty array instead of null
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

	// Find Order
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
// Cancel an order (only if status is Pending or Confirmed)
func CancelOrder(c *gin.Context) {
	orderCollection := database.GetCollection("orders")
	productCollection := database.GetCollection("products")
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

	// Convert string ID to ObjectID
	orderObjectID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid order ID.",
		})
		return
	}

	// Fetch order
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

	// Check if order can be cancelled
	if !order.OrderStatus.CanBeCancelled() {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Cannot cancel order with status '%s'", order.OrderStatus),
		})
		return
	}

	// Prepare stock restoration updates
	stockUpdates := []mongo.WriteModel{}
	for _, item := range order.Items {
		stockUpdate := mongo.NewUpdateOneModel().
			SetFilter(bson.M{"_id": item.ProductID}).
			SetUpdate(bson.M{
				"$inc": bson.M{"stock": item.Quantity},
				"$set": bson.M{"updated_at": time.Now()},
			})
		stockUpdates = append(stockUpdates, stockUpdate)
	}

	// Start transaction for cancellation
	session, err := database.Client.StartSession()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to start transaction.",
		})
		log.Println("Failed to start session: ", err)
		return
	}
	defer session.EndSession(ctx)

	_, err = session.WithTransaction(ctx, func(sessCtx mongo.SessionContext) (interface{}, error) {
		// 1. Update order status to cancelled
		_, err := orderCollection.UpdateOne(
			sessCtx,
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
			return nil, fmt.Errorf("Failed to cancel order: %w", err)
		}

		// 2. Restore product stock
		if len(stockUpdates) > 0 {
			_, err = productCollection.BulkWrite(sessCtx, stockUpdates)
			if err != nil {
				return nil, fmt.Errorf("Failed to restore stock: %w", err)
			}
		}
		return nil, nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to cancel order.",
			"details": err.Error(),
		})
		log.Println("Failed to cancel order: ", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Order cancelled successfully.",
	})

	// TODO: Send cancellation email
}

// =========================
// ADMIN ORDER ENDPOINTS
// =========================

// GET /api/orders/admin/all
func GetAllOrders(c *gin.Context) {
	orderCollection := database.GetCollection("orders")

	// Get pagination and filtering parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "20")
	status := c.Query("status")
	userIdStr := c.Query("user_id")

	// Parse and validate page
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	// Parse and validate limit
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	skip := (page - 1) * limit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Build filter
	filter := bson.M{}

	// Filter by status
	if status != "" {
		orderStatus := model.OrderStatus(status)
		if orderStatus.IsValid() {
			filter["order_status"] = orderStatus
		}
	}

	// Filter by user ID
	if userIdStr != "" {
		userId, err := primitive.ObjectIDFromHex(userIdStr)
		if err == nil {
			filter["user_id"] = userId
		}
	}

	// Get total count
	total, err := orderCollection.CountDocuments(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Falied to count orders.",
		})
		log.Println("Failed to count orders: ", err)
		return
	}

	// Find orders
	findOptions := options.Find()
	findOptions.SetSkip(int64(skip))
	findOptions.SetLimit(int64(limit))
	findOptions.SetSort(bson.D{{"created_at", -1}}) // Most recent first

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
	if err := cursor.All(ctx, &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch orders.",
		})
		log.Println("Failed to fetch orders: ", err)
		return
	}

	// Return empty array instead of null
	if orders == nil {
		orders = []model.Order{}
	}

	// Calculate pagination metadata
	totalPages := (total + int64(limit) - 1) / int64(limit)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Orders fetched successfully.",
		"orders":  orders,
		"pagination": gin.H{
			"current_page": page,
			"total_pages":  totalPages,
			"total_items":  total,
			"limit":        limit,
			"has_next":     page < int(totalPages),
			"has_prev":     page > 1,
		},
	})
}

// PUT /api/orders/admin/:id/status
// Update order status and/or payment status (admin only)
func UpdateOrderStatus(c *gin.Context) {
	orderCollection := database.GetCollection("orders")
	orderID := c.Param("id")

	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Order ID is required.",
		})
		return
	}

	var input struct {
		OrderStatus   string `json:"order_status, omitempty"`
		PaymentStatus string `json:"payment_status, omitempty"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// At least one field must be provided
	if input.OrderStatus == "" && input.PaymentStatus == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "At least one of 'order_status' or 'payment_status' must be provided.",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Convert string ID to ObjectID
	orderObjectID, err := primitive.ObjectIDFromHex(orderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid order ID format.",
		})
		return
	}

	// Fetch current order to validate transitions
	var currentOrder model.Order
	err = orderCollection.FindOne(ctx, bson.M{"_id": orderObjectID}).Decode(&currentOrder)
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

	// Build update document
	updateDoc := bson.M{"updated_at": time.Now()}

	// Validate and update order status
	if input.OrderStatus != "" {
		newStatus := model.OrderStatus(input.OrderStatus)
		if !newStatus.IsValid() {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid order status.",
			})
			return
		}
		// Validate status transition
		if !currentOrder.OrderStatus.CanTransitionTo(newStatus) {
			availableTransitions := currentOrder.GetAvailableTransitions()
			c.JSON(http.StatusBadRequest, gin.H{
				"error":                 fmt.Sprintf("Cannot transition from '%s' to '%s'.", currentOrder.OrderStatus, newStatus),
				"current_status":        currentOrder.OrderStatus,
				"requested_status":      newStatus,
				"available_transitions": availableTransitions,
			})
		}
		updateDoc["order_status"] = newStatus
	}

	// Validate and update payment status
	if input.PaymentStatus != "" {
		paymentStatus := model.PaymentStatus(input.PaymentStatus)
		if !paymentStatus.IsValid() {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid Payment status.",
			})
			return
		}
		updateDoc["payment_status"] = paymentStatus
	}

	// Update the order
	result, err := orderCollection.UpdateOne(
		ctx,
		bson.M{"_id": orderObjectID},
		bson.M{"$set": updateDoc},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update order status.",
		})
		log.Println("Failed to update order: ", err)
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Order not found.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Order status updated successfully.",
		"updated": gin.H{
			"order_status":   input.OrderStatus,
			"payment_status": input.PaymentStatus,
		},
	})

	// TODO: Send status updated email
}

// HELPER FUNCTIONS (Optional - for statistics)
// GET /api/orders/admin/stats
// Get order statistics (admin only)
func GetOrderStats(c *gin.Context) {
	orderCollection := database.GetCollection("orders")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Count orders by status
	pipeline := []bson.M{
		{
			"$group": bson.M{
				"_id":   "$order_status",
				"count": bson.M{"$sum": 1},
				"total": bson.M{"$sum": "$total_price"},
			},
		},
	}

	cursor, err := orderCollection.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch order statistics.",
		})
		log.Println("Failed to fetch stats:", err)
		return
	}
	defer cursor.Close(ctx)

	var stats []bson.M
	if err = cursor.All(ctx, &stats); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to decode statistics.",
		})
		return
	}

	// Get total orders count
	totalOrders, _ := orderCollection.CountDocuments(ctx, bson.M{})

	c.JSON(http.StatusOK, gin.H{
		"status":       "success",
		"message":      "Order statistics fetched successfully.",
		"total_orders": totalOrders,
		"by_status":    stats,
	})
}
