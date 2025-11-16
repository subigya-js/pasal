package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get role from context (set by AuthMiddleware)
		role, exists := c.Get("role")

		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Access denied. Admin privileges required.",
			})
			c.Abort()
			return
		}

		// Check if user has admin role
		roleStr, ok := role.(string)
		if !ok || roleStr != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Access denied. Admin privileges required.",
			})
			c.Abort()
			return
		}
		// User is admin, proceed to next handler
		c.Next()
	}
}
