import { AddToCartRequest, AddToCartResponse, GetCartResponse } from "@/types/cart";
import { BASE_URL } from "../../../constants/constants";

/**
 * Add item to cart
 * Requires authentication token
 */
export async function addToCart(
    data: AddToCartRequest,
    token: string
): Promise<AddToCartResponse> {
    const res = await fetch(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add item to cart");
    }

    return res.json();
}

/**
 * Get user's cart
 * Requires authentication token
 */
export async function getCart(token: string): Promise<GetCartResponse> {
    const url = `${BASE_URL}/api/cart`;
    console.log('[Cart API] Fetching cart from:', url);
    console.log('[Cart API] Token:', token ? 'Present' : 'Missing');

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            cache: "no-store",
        });

        console.log('[Cart API] Response status:', res.status);

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to fetch cart");
        }

        return res.json();
    } catch (error) {
        console.error('[Cart API] Fetch error:', error);
        throw error;
    }
}

/**
 * Update cart item quantity
 * Requires authentication token
 */
export async function updateCartItemQuantity(
    productId: string,
    quantity: number,
    token: string
): Promise<AddToCartResponse> {
    const res = await fetch(`${BASE_URL}/api/cart/update/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update cart item");
    }

    return res.json();
}

/**
 * Remove item from cart
 * Requires authentication token
 */
export async function removeCartItem(
    productId: string,
    token: string
): Promise<AddToCartResponse> {
    const res = await fetch(`${BASE_URL}/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove item from cart");
    }

    return res.json();
}

/**
 * Clear entire cart
 * Requires authentication token
 */
export async function clearCart(token: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${BASE_URL}/api/cart/clear`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to clear cart");
    }

    return res.json();
}
