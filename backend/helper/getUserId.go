package helper

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetUserID extracts the user ID from the Gin context
// Returns the user ID and a boolean indicating success
func GetUserID(c *gin.Context) (primitive.ObjectID, bool) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated.",
		})
		return primitive.NilObjectID, false
	}

	userId := userIDValue.(primitive.ObjectID)
	return userId, true
}