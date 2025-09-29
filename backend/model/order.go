package model

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusConfirmed  OrderStatus = "confirmed"
	OrderStatusShipped    OrderStatus = "shipped"
	OrderStatusDelivering OrderStatus = "delivering"
	OrderStatusDelivered  OrderStatus = "delivered"
	OrderStatusCancelled  OrderStatus = "cancelled"
	OrderStatusReturned   OrderStatus = "returned"
	OrderStatusRefunded   OrderStatus = "refunded"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusCompleted PaymentStatus = "completed"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusRefunded  PaymentStatus = "refunded"
)

type PaymentMode string

const (
	PaymentModeCash          PaymentMode = "cash"
	PaymentModeCard          PaymentMode = "card"
	PaymentModeOnlinePayment PaymentMode = "online_payment"
	PaymentModeWallet        PaymentMode = "wallet"
)

// IsValid checks if the OrderStatus is valid
func (os OrderStatus) IsValid() bool {
	switch os {
	case OrderStatusPending, OrderStatusProcessing, OrderStatusConfirmed,
		OrderStatusShipped, OrderStatusDelivering, OrderStatusDelivered,
		OrderStatusCancelled, OrderStatusReturned, OrderStatusRefunded:
		return true
	}
	return false
}

// IsValid checks if the PaymentStatus is valid
func (ps PaymentStatus) IsValid() bool {
	switch ps {
	case PaymentStatusPending, PaymentStatusCompleted, PaymentStatusFailed, PaymentStatusRefunded:
		return true
	}
	return false
}

// IsValid checks if the PaymentMode is valid
func (pm PaymentMode) IsValid() bool {
	switch pm {
	case PaymentModeCash, PaymentModeCard, PaymentModeOnlinePayment, PaymentModeWallet:
		return true
	}
	return false
}

// String returns the string representation of OrderStatus
func (os OrderStatus) String() string {
	return string(os)
}

// String returns the string representation of PaymentStatus
func (ps PaymentStatus) String() string {
	return string(ps)
}

// String returns the string representation of PaymentMode
func (pm PaymentMode) String() string {
	return string(pm)
}

// CanTransitionTo checks if the order status can transition to the target status
func (os OrderStatus) CanTransitionTo(target OrderStatus) bool {
	validTransitions := map[OrderStatus][]OrderStatus{
		OrderStatusPending:    {OrderStatusProcessing, OrderStatusConfirmed, OrderStatusCancelled},
		OrderStatusProcessing: {OrderStatusConfirmed, OrderStatusCancelled},
		OrderStatusConfirmed:  {OrderStatusShipped, OrderStatusCancelled},
		OrderStatusShipped:    {OrderStatusDelivering, OrderStatusDelivered},
		OrderStatusDelivering: {OrderStatusDelivered, OrderStatusReturned},
		OrderStatusDelivered:  {OrderStatusReturned},
		OrderStatusCancelled:  {OrderStatusRefunded},
		OrderStatusReturned:   {OrderStatusRefunded},
		OrderStatusRefunded:   {}, // Final state
	}

	allowedTransitions, exists := validTransitions[os]
	if !exists {
		return false
	}

	for _, allowed := range allowedTransitions {
		if allowed == target {
			return true
		}
	}

	return false
}

// CanBeCancelled checks if order can be cancelled by customer
func (os OrderStatus) CanBeCancelled() bool {
	return os == OrderStatusPending || os == OrderStatusConfirmed
}

type Order struct {
	ID              primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	OrderNumber     string             `json:"order_number" bson:"order_number"`
	UserID          primitive.ObjectID `json:"user_id" bson:"user_id"`
	Items           []OrderItem        `json:"items" bson:"items"`
	TotalQuantity   int                `json:"total_quantity" bson:"total_quantity"`
	TotalPrice      float64            `json:"total_price" bson:"total_price"`
	ShippingAddress ShippingAddress    `json:"shipping_address" bson:"shipping_address"`
	OrderStatus     OrderStatus        `json:"order_status" bson:"order_status"`
	PaymentStatus   PaymentStatus      `json:"payment_status" bson:"payment_status"`
	PaymentMode     PaymentMode        `json:"payment_mode" bson:"payment_mode"`
	Notes           string             `json:"notes,omitempty" bson:"notes,omitempty"`
	CreatedAt       time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at" bson:"updated_at"`
}

type OrderItem struct {
	ProductID    primitive.ObjectID `json:"product_id" bson:"product_id"`
	Product      *Product           `json:"product,omitempty" bson:"product,omitempty"`
	Quantity     int                `json:"quantity" bson:"quantity"`
	PricePerUnit float64            `json:"price_per_unit" bson:"price_per_unit"`
	TotalPrice   float64            `json:"total_price" bson:"total_price"`
}

type ShippingAddress struct {
	FullName     string `json:"full_name" bson:"full_name" validate:"required"`
	Phone        string `json:"phone" bson:"phone" validate:"required"`
	AddressLine1 string `json:"address_line1" bson:"address_line1" validate:"required"`
	AddressLine2 string `json:"address_line2,omitempty" bson:"address_line2,omitempty"`
	City         string `json:"city" bson:"city" validate:"required"`
	State        string `json:"state" bson:"state" validate:"required"`
	PostalCode   string `json:"postal_code" bson:"postal_code" validate:"required"`
	Country      string `json:"country" bson:"country" validate:"required"`
}

// Validate validates the entire Order struct
func (o *Order) Validate() []error {
	var errors []error

	if !o.OrderStatus.IsValid() {
		errors = append(errors, fmt.Errorf("invalid order status: %s", o.OrderStatus))
	}

	if !o.PaymentStatus.IsValid() {
		errors = append(errors, fmt.Errorf("invalid payment status: %s", o.PaymentStatus))
	}

	if !o.PaymentMode.IsValid() {
		errors = append(errors, fmt.Errorf("invalid payment mode: %s", o.PaymentMode))
	}

	if o.OrderNumber == "" {
		errors = append(errors, fmt.Errorf("order number is required"))
	}

	if o.TotalQuantity <= 0 {
		errors = append(errors, fmt.Errorf("total quantity must be greater than 0"))
	}

	if o.TotalPrice <= 0 {
		errors = append(errors, fmt.Errorf("total price must be greater than 0"))
	}

	if len(o.Items) == 0 {
		errors = append(errors, fmt.Errorf("order items are required"))
	}

	// Validate shipping address
	if o.ShippingAddress.FullName == "" {
		errors = append(errors, fmt.Errorf("shipping address full name is required"))
	}

	if o.ShippingAddress.Phone == "" {
		errors = append(errors, fmt.Errorf("shipping address phone is required"))
	}

	if o.ShippingAddress.AddressLine1 == "" {
		errors = append(errors, fmt.Errorf("shipping address line 1 is required"))
	}

	if o.ShippingAddress.City == "" {
		errors = append(errors, fmt.Errorf("shipping address city is required"))
	}

	if o.ShippingAddress.State == "" {
		errors = append(errors, fmt.Errorf("shipping address state is required"))
	}

	if o.ShippingAddress.PostalCode == "" {
		errors = append(errors, fmt.Errorf("shipping address postal code is required"))
	}

	if o.ShippingAddress.Country == "" {
		errors = append(errors, fmt.Errorf("shipping address country is required"))
	}

	// Validate order items
	for i, item := range o.Items {
		if item.Quantity <= 0 {
			errors = append(errors, fmt.Errorf("order item %d: quantity must be greater than 0", i+1))
		}
		if item.PricePerUnit <= 0 {
			errors = append(errors, fmt.Errorf("order item %d: price per unit must be greater than 0", i+1))
		}
		if item.TotalPrice <= 0 {
			errors = append(errors, fmt.Errorf("order item %d: total price must be greater than 0", i+1))
		}
		if item.ProductID.IsZero() {
			errors = append(errors, fmt.Errorf("order item %d: product ID is required", i+1))
		}
	}

	return errors
}

// CalculateTotals recalculates the total quantity and price from items
func (o *Order) CalculateTotals() {
	o.TotalQuantity = 0
	o.TotalPrice = 0

	for _, item := range o.Items {
		o.TotalQuantity += item.Quantity
		o.TotalPrice += item.TotalPrice
	}
}

// GetAvailableTransitions returns all valid status transitions from current status
func (o *Order) GetAvailableTransitions() []OrderStatus {
	validTransitions := map[OrderStatus][]OrderStatus{
		OrderStatusPending:    {OrderStatusProcessing, OrderStatusConfirmed, OrderStatusCancelled},
		OrderStatusProcessing: {OrderStatusConfirmed, OrderStatusCancelled},
		OrderStatusConfirmed:  {OrderStatusShipped, OrderStatusCancelled},
		OrderStatusShipped:    {OrderStatusDelivering, OrderStatusDelivered},
		OrderStatusDelivering: {OrderStatusDelivered, OrderStatusReturned},
		OrderStatusDelivered:  {OrderStatusReturned},
		OrderStatusCancelled:  {OrderStatusRefunded},
		OrderStatusReturned:   {OrderStatusRefunded},
		OrderStatusRefunded:   {},
	}

	return validTransitions[o.OrderStatus]
}
