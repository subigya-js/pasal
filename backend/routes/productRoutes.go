package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func ProductRoutes(r *gin.Engine) {
	r.GET("/api/get-all-products", controllers.GetAllProducts)
	r.GET("/api/get-product/:id", controllers.GetProductByID)

	// Admin-Protected routes:
	admin := r.Group("/api")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminOnly())
	{
		admin.POST("/create-product", controllers.CreateProduct)
		admin.PUT("/update-product/:id", controllers.UpdateProduct)
		admin.DELETE("/delete-product/:id", controllers.DeleteProduct)
	}
}
