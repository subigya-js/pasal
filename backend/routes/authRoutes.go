package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	r.POST("/signup", controllers.Signup)
	r.POST("/login", controllers.Login)

	protected := r.Group("/dashboard")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/", controllers.Dashboard)
	}
}
