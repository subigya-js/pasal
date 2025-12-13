package controllers

import (
	"backend/database"
	"backend/model"
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// POST /api/create-product
func CreateProduct(c *gin.Context) {
	productCollection := database.GetCollection("products")

	var input struct {
		Name          string   `json:"name" binding:"required,min=2"`
		Season        string   `json:"season"`
		Mrp           float64  `json:"mrp" binding:"required,gt=0"`
		Price         float64  `json:"price" binding:"required,gt=0"`
		OffPercentage int      `json:"off_percentage"`
		SKU           string   `json:"sku" binding:"required"`
		Category      string   `json:"category" binding:"required"`
		Type          string   `json:"type" binding:"required"`
		Team          string   `json:"team"`
		Sizes         []string `json:"sizes" binding:"required,dive,required"`
		Stock         int      `json:"stock" binding:"gte=0"`
		Images        []string `json:"images"`
		IsActive      bool     `json:"is_active" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if SKU already exists
	var existingProduct model.Product
	err := productCollection.FindOne(ctx, bson.M{"sku": input.SKU}).Decode(&existingProduct)
	if err == nil {
		log.Println("SKU already exists:", input.SKU)
		c.JSON(http.StatusConflict, gin.H{
			"error": "SKU already exists.",
		})
		return
	}

	// Create product
	product := model.Product{
		ID:            primitive.NewObjectID(),
		Name:          input.Name,
		Season:        input.Season,
		Mrp:           input.Mrp,
		Price:         input.Price,
		OffPercentage: input.OffPercentage,
		SKU:           input.SKU,
		CategoryID:    input.Category, // store category name
		Rating:        0.0,
		Type:          input.Type,
		Team:          input.Team,
		Sizes:         input.Sizes,
		Stock:         input.Stock,
		Images:        input.Images,
		IsActive:      input.IsActive,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	res, err := productCollection.InsertOne(ctx, product)
	if err != nil {
		log.Println("Failed to create product:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create product.",
		})
		log.Println("Failed to create product:", err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":     "success",
		"message":    "Product created successfully.",
		"product_id": res.InsertedID,
		"product":    product,
	})
}

// GET /api/get-all-products
func GetAllProducts(c *gin.Context) {
	productCollection := database.GetCollection("products")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Optional category filter
	category := c.Query("category")

	// Default filter: only active products
	filter := bson.M{"is_active": true}

	// If category_id is provided, add it to filter
	if category != "" {
		filter["category_id"] = category
	}

	// Fetch products
	cursor, err := productCollection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch products.",
		})
		return
	}
	defer cursor.Close(ctx)

	var products []model.Product
	if err := cursor.All(ctx, &products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch products.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   "success",
		"message":  "Products fetched successfully.",
		"products": products,
	})
}

// GET /api/get-product/:id
func GetProductByID(c *gin.Context) {
	productCollection := database.GetCollection("products")
	productID := c.Param("id")

	// Validate product ID is provided
	if productID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Product ID is required.",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Convert string ID to MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid product ID.",
		})
		return
	}

	// Find the product by ID and ensure it's active
	var product model.Product
	err = productCollection.FindOne(ctx, bson.M{
		"_id":       objectID,
		"is_active": true,
	}).Decode(&product)

	// Handle different error cases
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

	// Success response
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Product fetched successfully.",
		"product": product,
	})
}

// PUT /api/update-product/:id
func UpdateProduct(c *gin.Context) {
	productCollection := database.GetCollection("products")
	productID := c.Param("id")

	// Validate product ID
	if productID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Product ID is required.",
		})
		return
	}

	// Input struct for partial updates (all fields optional)
	var input struct {
		Name          string   `json:"name,omitempty" binding:"omitempty,min=2"`
		Season        string   `json:"season,omitempty"`
		Mrp           float64  `json:"mrp,omitempty" binding:"omitempty,gt=0"`
		Price         float64  `json:"price,omitempty" binding:"omitempty,gt=0"`
		OffPercentage *int     `json:"off_percentage,omitempty" binding:"omitempty,gte=0,lte=100"`
		SKU           string   `json:"sku,omitempty"`
		Category      string   `json:"category,omitempty"`
		Type          string   `json:"type,omitempty"`
		Team          string   `json:"team,omitempty"`
		Sizes         []string `json:"sizes,omitempty" binding:"omitempty,dive,required"`
		Stock         *int     `json:"stock,omitempty" binding:"omitempty,gte=0"`
		Images        []string `json:"images,omitempty"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Convert string ID to MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid product ID.",
		})
		return
	}

	// Check if SKU is being updated and if it already exists
	if input.SKU != "" {
		var existingProduct model.Product
		err := productCollection.FindOne(ctx, bson.M{
			"sku": input.SKU,
			"_id": bson.M{"$ne": objectID},
		}).Decode(&existingProduct)

		if err == nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "SKU already exists.",
			})
			return
		}
	}

	// Build update document dynamically
	updateDoc := bson.M{
		"updated_at": time.Now(),
	}

	if input.Name != "" {
		updateDoc["name"] = input.Name
	}

	if input.Season != "" {
		updateDoc["season"] = input.Season
	}

	if input.Mrp > 0 {
		updateDoc["mrp"] = input.Mrp
	}

	if input.Price > 0 {
		updateDoc["price"] = input.Price
	}

	if input.OffPercentage != nil {
		updateDoc["off_percentage"] = *input.OffPercentage
	}

	if input.SKU != "" {
		updateDoc["sku"] = input.SKU
	}

	if input.Category != "" {
		updateDoc["category_id"] = input.Category
	}

	if input.Type != "" {
		updateDoc["type"] = input.Type
	}

	if input.Team != "" {
		updateDoc["team"] = input.Team
	}

	if len(input.Sizes) > 0 {
		updateDoc["sizes"] = input.Sizes
	}

	if input.Stock != nil {
		updateDoc["stock"] = *input.Stock
	}

	if len(input.Images) > 0 {
		updateDoc["images"] = input.Images
	}

	// Update the product
	result, err := productCollection.UpdateOne(
		ctx, bson.M{"_id": objectID, "is_active": true},
		bson.M{"$set": updateDoc},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update product.",
		})
		log.Println("Failed to update product:", err)
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Product not found.",
		})
		return
	}

	// Success response
	c.JSON(http.StatusOK, gin.H{
		"status":          "success",
		"message":         "Product updated successfully.",
		"udpated_product": updateDoc,
	})
}

// DELETE /api/delete-product/:id
func DeleteProduct(c *gin.Context) {
	productCollection := database.GetCollection("products")
	productID := c.Param("id")

	// Validate product ID
	if productID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Product ID is required.",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Convert string ID to MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid product ID.",
		})
		return
	}

	// Check if product exists
	var product model.Product
	err = productCollection.FindOne(ctx, bson.M{"_id": objectID, "is_active": true}).Decode(&product)
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

	// Soft delete: set is_active to false instead of actually deleting
	result, err := productCollection.UpdateOne(
		ctx, bson.M{"_id": objectID, "is_active": true},
		bson.M{"$set": bson.M{"is_active": false, "updated_at": time.Now()}},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete product.",
		})
		log.Println("Failed to delete product:", err)
		return
	}

	if result.MatchedCount <= 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Product not found.",
		})
		return
	}

	// Success response
	c.JSON(http.StatusOK, gin.H{
		"status":          "success",
		"message":         "Product deleted successfully.",
		"deleted_product": product.Name,
	})
}
