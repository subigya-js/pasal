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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-900 mx-auto"></div>
                    <p className="mt-6 text-gray-600 font-medium">Loading your cart...</p>
                </div>
            </div>
        );
    }

    const isEmpty = !cart || cart.items.length === 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Shopping Cart</h1>
                    <p className="text-lg text-gray-600">
                        {isEmpty ? 'Your cart is empty' : `${cart.cart_quantity} item${cart.cart_quantity !== 1 ? 's' : ''} in your cart`}
                    </p>
                </div>

                {isEmpty ? (
                    /* Empty Cart State */
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                <svg
                                    className="h-16 w-16 text-gray-400"
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
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
                            <p className="text-gray-600 mb-8 text-lg">
                                Start shopping to add items to your cart
                            </p>
                            <Button asChild className="h-12 px-8 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
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
                                        className={`bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg ${isRemoving ? 'opacity-50 scale-95' : 'opacity-100'
                                            }`}
                                    >
                                        <div className="flex gap-6">
                                            {/* Product Image */}
                                            <Link href={`/${item.product_id}`} className="flex-shrink-0">
                                                <div className="relative w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-300">
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
                                                    <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors mb-1">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-gray-600 mb-2">Season {product.season}</p>

                                                {/* Stock Warning */}
                                                {product.stock <= 5 && product.stock > 0 && (
                                                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded-md">
                                                        <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-xs font-medium text-orange-700">
                                                            Only {product.stock} left!
                                                        </span>
                                                    </div>
                                                )}
                                                {product.stock === 0 && (
                                                    <p className="text-xs font-semibold text-red-600 bg-red-50 inline-block px-2 py-1 rounded">Out of stock</p>
                                                )}
                                            </div>

                                            {/* Price and Actions */}
                                            <div className="flex flex-col items-end justify-between">
                                                <div className="text-right mb-4">
                                                    <p className="font-bold text-2xl text-gray-900">
                                                        Rs. {(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Rs. {item.price} each
                                                    </p>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3 mb-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                                        disabled={isUpdating || item.quantity <= 1}
                                                        className="h-8 w-8 p-0 hover:bg-gray-200 rounded-md"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        </svg>
                                                    </Button>
                                                    <span className="w-12 text-center font-bold text-gray-900">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                                        disabled={isUpdating || item.quantity >= product.stock}
                                                        className="h-8 w-8 p-0 hover:bg-gray-200 rounded-md"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </Button>
                                                </div>

                                                {/* Remove Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(item.product_id)}
                                                    disabled={isRemoving}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
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
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 font-medium rounded-xl"
                                >
                                    Clear Cart
                                </Button>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-4">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Subtotal ({cart.cart_quantity} items)</span>
                                        <span className="font-semibold">Rs. {cart.total_price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Shipping</span>
                                        <span className="font-semibold text-green-600">Free</span>
                                    </div>
                                    <div className="border-t-2 border-gray-200 pt-4 flex justify-between text-xl font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>Rs. {cart.total_price.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button className="w-full h-14 mb-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700" size="lg">
                                    Proceed to Checkout
                                </Button>

                                <Button asChild variant="outline" className="w-full h-12 rounded-xl border-2 hover:bg-gray-50 font-medium">
                                    <Link href="/">Continue Shopping</Link>
                                </Button>

                                {/* Additional Info */}
                                <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-700">Shipping Charges applies on all orders</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-700">Secure checkout</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-700">Easy returns within 30 days for non-personalized items</span>
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
