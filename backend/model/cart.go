package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Cart struct {
	ID         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	ProductID  primitive.ObjectID `json:"product_id" bson:"product_id"`
	UserID     primitive.ObjectID `json:"user_id" bson:"user_id"`
	Quantity   int                `json:"quantity" bson:"quantity"`
	TotalPrice int                `json:"total_price" bson:"total_price"`
}
