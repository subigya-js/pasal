"use client";

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CartPage() {
    const { cart, isLoading, updateCartItem, removeFromCart, clearCart } = useCart();
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
    const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        }
    }, [isLoggedIn, router]);

    const handleQuantityChange = async (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        setUpdatingItems(prev => new Set(prev).add(productId));
        try {
            await updateCartItem(productId, newQuantity);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update quantity';
            alert(errorMessage);
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
        }
    };

    const handleRemoveItem = async (productId: string) => {
        setRemovingItems(prev => new Set(prev).add(productId));
        try {
            await removeFromCart(productId);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
            alert(errorMessage);
        } finally {
            setRemovingItems(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
            alert(errorMessage);
        }
    };

    if (!isLoggedIn) {
        return null; // Will redirect via useEffect
    }

    if (isLoading && !cart) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your cart...</p>
                </div>
            </div>
        );
    }

    const isEmpty = !cart || cart.items.length === 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-gray-600 mt-2">
                        {isEmpty ? 'Your cart is empty' : `${cart.cart_quantity} item${cart.cart_quantity !== 1 ? 's' : ''} in your cart`}
                    </p>
                </div>

                {isEmpty ? (
                    /* Empty Cart State */
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <svg
                                className="mx-auto h-24 w-24 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                            <h2 className="mt-6 text-2xl font-semibold text-gray-900">Your cart is empty</h2>
                            <p className="mt-2 text-gray-600">
                                Start shopping to add items to your cart
                            </p>
                            <Button asChild className="mt-6">
                                <Link href="/">Continue Shopping</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Cart with Items */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item) => {
                                const isUpdating = updatingItems.has(item.product_id);
                                const isRemoving = removingItems.has(item.product_id);
                                const product = item.product;

                                return (
                                    <div
                                        key={item.product_id}
                                        className={`bg-white rounded-lg shadow-sm p-4 transition-opacity ${isRemoving ? 'opacity-50' : 'opacity-100'
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <Link href={`/${item.product_id}`} className="flex-shrink-0">
                                                <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </Link>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/${item.product_id}`}>
                                                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-gray-600 mt-1">Season {product.season}</p>

                                                {/* Stock Warning */}
                                                {product.stock <= 5 && product.stock > 0 && (
                                                    <p className="text-xs text-orange-500 mt-1">
                                                        Only {product.stock} left in stock!
                                                    </p>
                                                )}
                                                {product.stock === 0 && (
                                                    <p className="text-xs text-red-500 mt-1">Out of stock</p>
                                                )}
                                            </div>

                                            {/* Price and Actions */}
                                            <div className="flex flex-col items-end justify-between">
                                                <div className="text-right">
                                                    <p className="font-bold text-lg text-gray-900">
                                                        Rs. {(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Rs. {item.price} each
                                                    </p>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                                        disabled={isUpdating || item.quantity <= 1}
                                                        className="h-8 w-8 p-0 cursor-pointer"
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="w-12 text-center font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                                        disabled={isUpdating || item.quantity >= product.stock}
                                                        className="h-8 w-8 p-0 cursor-pointer"
                                                    >
                                                        +
                                                    </Button>
                                                </div>

                                                {/* Remove Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(item.product_id)}
                                                    disabled={isRemoving}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-2 cursor-pointer"
                                                >
                                                    {isRemoving ? 'Removing...' : 'Remove'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Clear Cart Button */}
                            <div className="pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleClearCart}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                >
                                    Clear Cart
                                </Button>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cart.cart_quantity} items)</span>
                                        <span>Rs. {cart.total_price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-green-600">Free</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>Rs. {cart.total_price.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button className="w-full mb-3 cursor-pointer" size="lg">
                                    Proceed to Checkout
                                </Button>

                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/" className='cursor-pointer'>Continue Shopping</Link>
                                </Button>

                                {/* Additional Info */}
                                <div className="mt-6 pt-6 border-t text-sm text-gray-600 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Shipping Charges applies on all orders</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Secure checkout</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Easy returns within 30 days for non-personalized items</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
