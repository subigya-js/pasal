package controllers

import (
	"backend/database"
	"backend/model"
	"context"
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

// POST /api/cart/add
func AddToCart(c *gin.Context) {
	cartCollection := database.GetCollection("carts")
	productCollection := database.GetCollection("products")

	// Get user ID from JWT token
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated.",
		})
		return
	}

	userID := userIDValue.(primitive.ObjectID)

	var input struct {
		ProductID string `json:"product_id" binding:"required"`
		Quantity  int    `json:"quantity" binding:"required,gt=0"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Convert product ID to ObjectID
	productObjectID, err := primitive.ObjectIDFromHex(input.ProductID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid product ID.",
		})
		return
	}

	// Fetch product details (Check if product exists and is active)
	var product model.Product
	err = productCollection.FindOne(ctx, bson.M{
		"_id":       productObjectID,
		"is_active": true,
	}).Decode(&product)

	if err == mongo.ErrNoDocuments {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Product not found.",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch product.",
		})
		log.Println("Failed to fetch product:", err)
		return
	}

	// Check stock availability
	if product.Stock < input.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Not enough stock available. Available: " + strconv.Itoa(product.Stock),
		})
		return
	}

	// Find existing cart or create new one
	var cart model.Cart
	err = cartCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&cart)

	if err == mongo.ErrNoDocuments {
		// Create new cart
		cart = model.Cart{
			ID:         primitive.NewObjectID(),
			UserID:     userID,
			Items:      []model.CartItem{},
			Quantity:   0,
			TotalPrice: 0,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch cart.",
		})
		log.Println("Failed to fetch cart:", err)
		return
	}

	// Check if product already exists in cart
	itemExists := false
	for i := range cart.Items {
		if cart.Items[i].ProductID == productObjectID {
			// Update existing item
			newQuantity := cart.Items[i].Quantity + input.Quantity
			if newQuantity > product.Stock {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Total quantity exceeds available stock.",
				})
				return
			}
			cart.Items[i].Quantity = newQuantity
			itemExists = true
			break
		}
	}

	// Add new item if doesn't exist
	if !itemExists {
		newItem := model.CartItem{
			ProductID: productObjectID,
			Product:   &product,
			Quantity:  input.Quantity,
			Price:     product.Price,
		}
		cart.Items = append(cart.Items, newItem)
	}

	// Calculate cart totals
	cart.Quantity = 0
	cart.TotalPrice = 0
	for _, item := range cart.Items {
		cart.Quantity += item.Quantity
		cart.TotalPrice += float64(item.Quantity) * item.Price
	}
	cart.UpdatedAt = time.Now()

	// Save cart
	_, err = cartCollection.ReplaceOne(
		ctx,
		bson.M{"user_id": userID},
		cart,
		options.Replace().SetUpsert(true),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update cart.",
		})
		log.Println("Failed to update cart:", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Item added to cart successfully.",
		"cart":    cart,
	})
}

// GET /api/cart
func GetCart(c *gin.Context) {
	cartCollection := database.GetCollection("carts")

	// Get user ID from JWT token
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated.",
		})
		return
	}

	userID := userIDValue.(primitive.ObjectID)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var cart model.Cart
	err := cartCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&cart)

	if err == mongo.ErrNoDocuments {
		// Return empty cart
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Cart is empty.",
			"cart":    cart,
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch cart.",
		})
		log.Println("Failed to fetch cart:", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Cart fetched successfully.",
		"cart":    cart,
	})
}

// PUT /api/cart/update/:product_id
func UpdateCartItemQuantity(c *gin.Context) {
	cartCollection := database.GetCollection("carts")
	productID := c.Param("product_id")

	if productID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Product ID is required.",
		})
		return
	}

	// Get user ID from JWT token
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated.",
		})
		return
	}

	userID := userIDValue.(primitive.ObjectID)

	var input struct {
		Quantity int `json:"quantity" binding:"required,gt=0"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Convert product ID to ObjectID
	productObjectID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid product ID.",
		})
		return
	}

	// Find user's cart
	var cart model.Cart
	err = cartCollection.FindOne(ctx, bson.M{"user_id": userID}).Decode(&cart)

	if err == mongo.ErrNoDocuments {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Cart not found.",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch cart.",
		})
		log.Println("Failed to fetch cart:", err)
		return
	}

	// Find and update item
	itemFound := false
	for i := range cart.Items {
		if cart.Items[i].ProductID == productObjectID {
			cart.Items[i].Quantity = input.Quantity
			itemFound = true
			break
		}
	}
	// Instead of for loop, trigger the particular product id and do the same.

	if !itemFound {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Item not found in cart.",
		})
		return
	}

	// Recalculate total
	cart.Quantity = 0
	cart.TotalPrice = 0
	for _, item := range cart.Items {
		cart.Quantity += item.Quantity
		cart.TotalPrice += float64(item.Quantity) * item.Price
	}
	cart.UpdatedAt = time.Now()

	// Update Cart
	_, err = cartCollection.ReplaceOne(ctx, bson.M{"user_id": userID}, cart)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update cart.",
		})
		log.Println("Failed to update cart:", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Cart updated successfully.",
		"cart":    cart,
	})
}
