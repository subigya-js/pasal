package main

import (
	"backend/database"
	"backend/routes"
	"log"
	"os"

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
