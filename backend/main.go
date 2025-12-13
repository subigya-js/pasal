package main

import (
	"backend/database"
	"backend/routes"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("./.env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	database.ConnectDB()

	router := gin.Default()

	// Add CORS middleware BEFORE your routes
	router.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			// Allow any localhost origin during development
			return strings.HasPrefix(origin, "http://localhost:") ||
				strings.HasPrefix(origin, "http://127.0.0.1:")
		},
		AllowMethods: []string{
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS",
		},
		AllowHeaders: []string{
			"Origin", "Content-Type", "Authorization",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.AuthRoutes(router)
	routes.ProductRoutes(router)
	routes.CartRoutes(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
		log.Println("Using default port: 3001")
	}

	log.Println("Server is running on port " + port)
	router.Run(":" + port)
}
