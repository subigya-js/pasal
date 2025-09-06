package controllers

import (
	"backend/database"
	"backend/helper"
	"backend/model"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func Signup(c *gin.Context) {
	userCollection := database.GetCollection("users")
	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if user exists
	var existingUser model.User
	err := userCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "User already exists.",
		})
		return
	}

	if user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password is required.",
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to hash password." + err.Error(),
		})
		return
	}

	user.Password = string(hashedPassword)
	user.ID = primitive.NewObjectID()

	_, err = userCollection.InsertOne(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create user.",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully.",
	})
}

func Login(c *gin.Context) {
	userCollection := database.GetCollection("users")
	var req model.User
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if user exists
	var user model.User
	err := userCollection.FindOne(ctx, bson.M{
		"email": req.Email,
	}).Decode(&user)

	if err == mongo.ErrNoDocuments {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "The User does not exist.",
		})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid password.",
		})
		return
	}

	token, err := helper.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}

func Dashboard(c *gin.Context) {
	email, _ := c.Get("email")
	name, _ := c.Get("name")
	userID, _ := c.Get("userID")
	
	c.JSON(http.StatusOK, gin.H{
		"userID": userID,
		"email":  email,
		"name":   name,
	})
}
