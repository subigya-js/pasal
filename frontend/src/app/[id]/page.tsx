import { Button } from '@/components/ui/button';
import { getProductById } from '@/lib/api/products';
import Image from 'next/image';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const res = await getProductById(id);
    const product = res.product;

    if (!product) {
        return (
            <div className="text-center w-full h-[90vh] flex justify-center items-center py-10 text-xl font-semibold">
                Product not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 py-8 font-sans">
                {/* Breadcrumb */}
                <div className="mb-6 text-sm text-gray-600">
                    <span className="hover:text-gray-900 cursor-pointer">Home</span>
                    <span className="mx-2">/</span>
                    <span className="hover:text-gray-900 cursor-pointer">Products</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">{product.name}</span>
                </div>

                {/* Main Product Section */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="lg:w-[58%]">
                        <div className="grid grid-cols-2 gap-4">
                            {product.images.map((url, index) => (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 shadow-md hover:shadow-2xl transition-all duration-500"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 z-10"></div>
                                    <Image
                                        src={url}
                                        alt={`${product.name} - Image ${index + 1}`}
                                        width={600}
                                        height={600}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        View
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info Card */}
                    <div className="lg:w-[42%]">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-4">
                            <div className="flex flex-col gap-8">
                                {/* Title & Season */}
                                <div className="space-y-2">
                                    <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full mb-2">
                                        Season {product.season}
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                        {product.name}
                                    </h1>
                                </div>

                                {/* Price Section */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-xl font-bold text-gray-900">
                                            Rs. {product.price}
                                        </span>
                                        <div className="">
                                            <span className="text-md text-gray-500 line-through">
                                                Rs. {product.mrp}
                                            </span>
                                            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                {product.off_percentage}% OFF
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Size Selection */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                        Select Size
                                    </p>
                                    {product.sizes && product.sizes.length > 0 ? (
                                        <div className="grid grid-cols-5 gap-3">
                                            {product.sizes.map((size, index) => (
                                                <button
                                                    key={index}
                                                    className="border-2 border-gray-300 py-3 rounded-lg cursor-pointer hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-center font-medium text-sm active:scale-95"
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">Size not available for this product.</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <Button className="flex-1 h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700">
                                        Add to Cart
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 text-base font-semibold rounded-xl border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300"
                                    >
                                        Buy Now
                                    </Button>
                                </div>

                                {/* Trust Badges */}
                                <div className="flex justify-around items-center py-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex flex-col items-center gap-2">
                                        <Image
                                            src="https://dukaan.b-cdn.net/original/dukaan-media/plugins/trusted_badges_v2/free-shipping.svg"
                                            alt="Free Shipping"
                                            width={60}
                                            height={60}
                                        />
                                        <span className="text-xs text-gray-600 font-medium">Free Shipping</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Image
                                            src="https://dukaan.b-cdn.net/original/dukaan-media/plugins/trusted_badges_v2/premium-quality.svg"
                                            alt="Premium Quality"
                                            width={60}
                                            height={60}
                                        />
                                        <span className="text-xs text-gray-600 font-medium">Premium Quality</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Image
                                            src="https://dms.mydukaan.io/original/dukaan-media/plugins/trusted_badges_v2/cod-available.svg"
                                            alt="COD Available"
                                            width={60}
                                            height={60}
                                        />
                                        <span className="text-xs text-gray-600 font-medium">COD Available</span>
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className="border-t border-gray-200 pt-6 space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Product Details</h3>

                                    {product.type === 'fan' && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm font-semibold text-blue-900 mb-2">
                                                Authentic Quality Fan Edition Jersey
                                            </p>
                                            <p className="text-xs text-gray-700 leading-relaxed">
                                                This fan edition jersey pairs official design details with sweat-wicking technology to give you a game-ready or casual wear look inspired by your favourite team.
                                                <br /><br />
                                                Super comfortable fabric with Drifit Technology makes it lightweight and moves sweat away from your skin for quicker evaporation, helping you stay dry and comfortable yet keeping you look cool & classy.
                                                <br /><br />
                                                <span className="font-bold">Authenticity</span> - Official design is modelled on what the pros wear on the pitch and what supporters wear. Each jersey comes with all the official tags as well.
                                                <br /><br />
                                                <span className="font-bold">Material</span> - Made from 100% recycled polyester to create high quality products like this jersey, specially designed to deliver peak performance with a lower impact on environment.
                                                <br /><br />
                                                <span className="font-bold">Fitting</span> - Regular/Parallel Fit
                                            </p>
                                        </div>
                                    )}

                                    {product.type === 'player' && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <p className="text-sm font-semibold text-purple-900 mb-2">
                                                Authentic Quality Player Edition Jersey
                                            </p>
                                            <p className="text-xs text-gray-700 leading-relaxed">
                                                This one pairs authentic design details with lightweight, quick-drying fabric to help keep the world&apos;s biggest football stars cool and comfortable on the pitch. This product is made from 100% recycled polyester fibers. Advance Fabric technology combines moisture-wicking fabric with advanced engineering and features to help you stay dry and comfortable. Provides additional lightweight & breathability to boost your comfort and performance level. This Authentic jersey are same ones worn by your favorite players on the pitch. Yes, you read it right!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
