package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "seller" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Admin access only.",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
