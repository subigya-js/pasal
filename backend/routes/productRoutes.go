package routes

import (
	"backend/controllers"
	"backend/middleware"
	"github.com/gin-gonic/gin"
)

func ProductRoutes(r *gin.Engine){
	r.GET("/api/get-all-products", controllers.GetAllProducts)
	r.GET("/api/get-product/:id", controllers.GetProductByID)
	
	// Protected routes:
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/create-product", controllers.CreateProduct)
		protected.PUT("/update-product/:id", controllers.UpdateProduct)
		protected.DELETE("/delete-product/:id", controllers.DeleteProduct)
	}
}