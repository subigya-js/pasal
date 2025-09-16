package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Cart struct {
	ID         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserID     primitive.ObjectID `json:"user_id" bson:"user_id"`
	Quantity   int                `json:"quantity" bson:"quantity"`
	TotalPrice float64            `json:"total_price" bson:"total_price"`
	CreatedAt  time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt  time.Time          `json:"updated_at" bson:"updated_at"`
}

type CartItem struct {
	ProductID primitive.ObjectID `json:"product_id" bson:"product_id"`
	Product   Product            `json:"product" bson:"product"`
	Quantity  int                `json:"quantity" bson:"quantity"`
	Price     float64            `json:"price" bson:"price"`
}
