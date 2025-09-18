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
		Name        string   `json:"name" binding:"required,min=2"`
		Description string   `json:"description"`
		Price       float64  `json:"price" binding:"required,gt=0"`
		SKU         string   `json:"sku" binding:"required"`
		Category    string   `json:"category" binding:"required"`
		Stock       int      `json:"stock" binding:"gte=0"`
		Images      []string `json:"images"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
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
		c.JSON(http.StatusConflict, gin.H{
			"error": "SKU already exists.",
		})
		return
	}

	// Create product
	product := model.Product{
		ID:          primitive.NewObjectID(),
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		SKU:         input.SKU,
		CategoryID:  input.Category, // store category name
		Stock:       input.Stock,
		Images:      input.Images,
		Rating:      0.0,
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	res, err := productCollection.InsertOne(ctx, product)
	if err != nil {
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

func UpdateProduct() {}

func DeleteProduct() {}
