package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func CartRoutes(r *gin.Engine) {
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/cart/add", controllers.AddToCart)
		protected.GET("/cart", controllers.GetCart)
		protected.PUT("/cart/update/:product_id", controllers.UpdateCartItemQuantity)
		protected.DELETE("/cart/remove/:product_id", controllers.RemoveCartItem)
		protected.DELETE("/cart/clear", controllers.ClearCart)
	}
}
