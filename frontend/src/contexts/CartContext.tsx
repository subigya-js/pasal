"use client";

import { addToCart as apiAddToCart, clearCart as apiClearCart, getCart as apiGetCart, removeCartItem as apiRemoveCartItem, updateCartItemQuantity as apiUpdateCartItem } from '@/lib/api/cart';
import { Cart } from '@/types/cart';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface CartContextType {
    cart: Cart | null;
    isLoading: boolean;
    cartItemCount: number;
    addToCart: (productId: string, quantity: number) => Promise<void>;
    updateCartItem: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { token, isLoggedIn } = useAuth();

    // Calculate total item count
    const cartItemCount = cart?.cart_quantity || 0;

    const refreshCart = async () => {
        if (!token) return;

        try {
            setIsLoading(true);
            const response = await apiGetCart(token);
            setCart(response.cart);
        } catch (error) {
            console.error('[CartContext] Error fetching cart:', error);
            // Don't throw error, just log it
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch cart when user logs in
    useEffect(() => {
        if (isLoggedIn && token) {
            refreshCart();
        } else {
            // Clear cart when user logs out
            setCart(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, token]);

    const addToCart = async (productId: string, quantity: number) => {
        if (!token) {
            throw new Error('Please login to add items to cart');
        }

        try {
            setIsLoading(true);
            const response = await apiAddToCart({ product_id: productId, quantity }, token);
            setCart(response.cart);
        } catch (error) {
            console.error('[CartContext] Error adding to cart:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateCartItem = async (productId: string, quantity: number) => {
        if (!token) {
            throw new Error('Please login to update cart');
        }

        try {
            setIsLoading(true);
            const response = await apiUpdateCartItem(productId, quantity, token);
            setCart(response.cart);
        } catch (error) {
            console.error('[CartContext] Error updating cart item:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (productId: string) => {
        if (!token) {
            throw new Error('Please login to remove items from cart');
        }

        try {
            setIsLoading(true);
            const response = await apiRemoveCartItem(productId, token);
            setCart(response.cart);
        } catch (error) {
            console.error('[CartContext] Error removing from cart:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const clearCart = async () => {
        if (!token) {
            throw new Error('Please login to clear cart');
        }

        try {
            setIsLoading(true);
            await apiClearCart(token);
            setCart(null);
        } catch (error) {
            console.error('[CartContext] Error clearing cart:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value: CartContextType = {
        cart,
        isLoading,
        cartItemCount,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
