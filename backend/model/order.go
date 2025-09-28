package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Order struct {
	ID              primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	OrderNumber     string             `json:"order_number" bson:"order_number"`
	UserID          primitive.ObjectID `json:"user_id" bson:"user_id"`
	Items           []OrderItem        `json:"items" bson:"items"`
	TotalQuantity   int                `json:"total_quantity" bson:"total_quantity"`
	TotalPrice      float64            `json:"total_price" bson:"total_price"`
	ShippingAddress ShippingAddress    `json:"shipping_address" bson:"shipping_address"`
	OrderStatus     string             `json:"order_status" bson:"order_status"`
	PaymentStatus   string             `json:"payment_status" bson:"payment_status"`
	PaymentMode     string             `json:"payment_mode" bson:"payment_mode"`
	Notes           string             `json:"notes" bson:"notes"`
	CreatedAt       time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at" bson:"updated_at"`
}

type OrderItem struct {
	ProductID    primitive.ObjectID `json:"product_id" bson:"product_id"`
	Product      *Product           `json:"product" bson:"product"`
	Quantity     int                `json:"quantity" bson:"quantity"`
	PricePerUnit float64            `json:"price_per_unit" bson:"price_per_unit"`
	TotalPrice   float64            `json:"total_price" bson:"total_price"`
}

type ShippingAddress struct {
	FullName     string `json:"full_name" bson:"full_name"`
	Phone        string `json:"phone" bson:"phone"`
	AddressLine1 string `json:"address_line1" bson:"address_line1"`
	AddressLine2 string `json:"address_line2" bson:"address_line2"`
	City         string `json:"city" bson:"city"`
	State        string `json:"state" bson:"state"`
	PostalCode   string `json:"postal_code" bson:"postal_code"`
	Country      string `json:"country" bson:"country"`
}
