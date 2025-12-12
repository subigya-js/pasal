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
		admin.POST("/api/create-product", controllers.CreateProduct)
		admin.PUT("/api/update-product/:id", controllers.UpdateProduct)
		admin.DELETE("/api/delete-product/:id", controllers.DeleteProduct)
	}
}
