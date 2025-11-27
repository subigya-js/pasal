import { Product } from "./product";

export interface CartItem {
    product_id: string;
    product: Product;
    quantity: number;
    price: number;
}

export interface Cart {
    id?: string;
    user_id: string;
    items: CartItem[];
    cart_quantity: number;
    total_price: number;
    created_at?: string;
    updated_at?: string;
}

export interface AddToCartRequest {
    product_id: string;
    quantity: number;
}

export interface AddToCartResponse {
    status: string;
    message: string;
    cart: Cart;
}

export interface GetCartResponse {
    status: string;
    message: string;
    cart: Cart;
}

export interface UpdateCartItemRequest {
    quantity: number;
}
