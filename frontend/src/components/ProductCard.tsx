"use client";

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart, isLoading: cartLoading } = useCart();
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();

        // Check if user is logged in
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        // Check stock availability
        if (product.stock <= 0) {
            alert('This product is out of stock');
            return;
        }

        try {
            setIsAdding(true);
            await addToCart(product.id, 1); // Add 1 item by default

            // Show success feedback
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
            alert(errorMessage);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="rounded-xl overflow-hidden transition-shadow py-2">
            <Link href={`/${product.id}`}>
                <div className="bg-gray-100 cursor-pointer p-2 rounded-lg hover:shadow-md duration-300 transition-shadow">
                    <div className="relative overflow-hidden">
                        <Image
                            src={product.images[0]}
                            alt={`${product.name} image`}
                            className="w-full h-full object-cover rounded-xl"
                            width={300}
                            height={300}
                        />
                        {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                                <span className="text-white font-bold text-lg">Out of Stock</span>
                            </div>
                        )}
                        {product.off_percentage > 0 && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
                                {product.off_percentage}% OFF
                            </div>
                        )}
                    </div>
                    <div className="p-4 text-center">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-gray-600 text-sm">Season {product.season}</p>
                    </div>
                </div>
            </Link>

            <div className='flex flex-col gap-2 mt-2 px-2'>
                <div className="flex items-center justify-center gap-2">
                    <p className="font-bold text-blue-500 text-center">Rs. {product.price}</p>
                    {product.mrp > product.price && (
                        <p className="text-gray-400 line-through text-sm">Rs. {product.mrp}</p>
                    )}
                </div>
                <div className='flex justify-between'>
                    <Button
                        variant={showSuccess ? "default" : "outline"}
                        className={`w-full py-1 px-2 rounded cursor-pointer transition-all ${showSuccess ? 'bg-green-500 hover:bg-green-600 text-white' : 'text-black'
                            }`}
                        onClick={handleAddToCart}
                        disabled={isAdding || cartLoading || product.stock <= 0}
                    >
                        {isAdding ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                            </span>
                        ) : showSuccess ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Added!
                            </span>
                        ) : product.stock <= 0 ? (
                            'Out of Stock'
                        ) : (
                            'Add to Cart'
                        )}
                    </Button>
                </div>
                {product.stock > 0 && product.stock <= 5 && (
                    <p className="text-xs text-orange-500 text-center">Only {product.stock} left in stock!</p>
                )}
            </div>
        </div>
    );
}
