package middleware

import (
	"backend/database"
	"backend/helper"
	"backend/model"
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header missing",
			})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := helper.ValidateJWT(tokenString)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Fetch user data from database
		userCollection := database.GetCollection("users")
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		var user model.User
		err = userCollection.FindOne(ctx, bson.M{"email": claims.Email}).Decode(&user)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "User not found",
				})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to fetch user data",
				})
			}
			c.Abort()
			return
		}

		c.Set("email", claims.Email)
		c.Set("name", user.Name)
		c.Next()
	}
}
