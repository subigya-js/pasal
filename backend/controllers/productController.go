package controllers

import (
	"backend/database"
	"backend/model"
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateProduct(c *gin.Context) {
	productCollection := database.GetCollection("products")
	var product model.Product

	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Set default values
	product.ID = primitive.NewObjectID()
	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()
	product.IsActive = true

	if product.Stock < 0 {
		product.Stock = 0
	}

	res, err := productCollection.InsertOne(ctx, product)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to craete product.",
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

func GetAllProducts() {}

func GetProductByID() {}

func UpdateProduct() {}

func DeleteProduct() {}
