package main

import (
	"backend/database"
	"backend/routes"
	"log"
	"os"

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

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true, // Allow credentials (cookies, authorization headers)
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
