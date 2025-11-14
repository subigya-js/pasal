package database

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	DB     *mongo.Database
	Client *mongo.Client
)

func ConnectDB() {
	mongoURL := os.Getenv("MONGO_URL")
	if mongoURL == "" {
		log.Fatal("MONGO_URL environment variable is not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var err error
	Client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURL))
	if err != nil {
		log.Fatal(err)
	}

	err = Client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	DB = Client.Database("PasalDB")
	log.Println("Database connected...")
}

func GetCollection(collectionName string) *mongo.Collection {
	return DB.Collection(collectionName)
}
