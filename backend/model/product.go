package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Product struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name          string             `json:"name" bson:"name" validate:"required,min=2"`
	Season        string             `json:"season,omitempty" bson:"season,omitempty"`
	Mrp           float64            `json:"mrp" bson:"mrp" validate:"required,gt=0"`
	Price         float64            `json:"price" bson:"price" validate:"required,gt=0"`
	OffPercentage int             `json:"off_percentage,omitempty" bson:"off_percentage,omitempty"`
	SKU           string             `json:"sku" bson:"sku" validate:"required"`
	CategoryID    string             `json:"category_id" bson:"category_id" validate:"required"`
	Rating        float64            `json:"rating,omitempty" bson:"rating,omitempty"`
	Type          string             `json:"type" bson:"type" validate:"required"`
	Sizes         []string           `json:"sizes" bson:"sizes" validate:"required,dive,required"`
	Stock         int                `json:"stock" bson:"stock" validate:"gte=0"`
	Images        []string           `json:"images,omitempty" bson:"images,omitempty"`
	IsActive      bool               `json:"is_active" bson:"is_active"`
	CreatedAt     time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at" bson:"updated_at"`
}

type Category struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name" validate:"required"`
	Description string             `json:"description,omitempty" bson:"description,omitempty"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updated_at"`
}
