// backend/routes/orderRoutes.go
package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func OrderRoutes(router *gin.Engine) {
	// Order routes group
	orders := router.Group("/api/orders")
	orders.Use(middleware.AuthMiddleware()) // All order routes require authentication
	{
		// ============================================
		// USER ORDER ENDPOINTS
		// ============================================
		orders.POST("/place", controllers.PlaceOrder)      // Place new order from cart
		orders.GET("", controllers.GetOrders)              // Get user's orders (with pagination & filtering)
		orders.GET("/:id", controllers.GetOrderDetails)    // Get specific order details
		orders.PUT("/:id/cancel", controllers.CancelOrder) // Cancel order (only pending/confirmed)

		// ============================================
		// ADMIN ORDER ENDPOINTS
		// ============================================
		admin := orders.Group("/admin")
		// admin.Use(middleware.AdminMiddleware()) // Requires admin role
		{
			admin.GET("/all", controllers.GetAllOrders)             // Get all orders with filtering
			admin.PUT("/:id/status", controllers.UpdateOrderStatus) // Update order/payment status
			admin.GET("/stats", controllers.GetOrderStats)          // Get order statistics
		}
	}
}
