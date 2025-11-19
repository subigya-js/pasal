import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { sampleItems } from "../../../constants/sample";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = sampleItems.find(item => item.id === Number(id));

    if (!product) {
        return (
            <div className="text-center w-full h-[90vh] flex justify-center items-center py-10 text-xl font-semibold">
                Product not found
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 py-6 font-sans w-full ">
            {/* Product Title */}
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {/* 2x2 Image Grid */}
            <div className="flex justify-between gap-10">
                <div className="grid grid-cols-2 gap-4 mb-6 w-[60%] ">
                    {product.images.map((img, index) => (
                        <div key={index} className="relative overflow-hidden rounded bg-gray-100 border border-gray-400 hover:scale-105 duration-300 transition-transform">
                            <Image
                                src={img.url}
                                alt={img.alt}
                                width={500}
                                height={500}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                {/* Product Info */}
                <div className="flex flex-col w-[40%] border px-6 py-2 border-gray-200">
                    <div className="flex flex-col gap-10">
                        <div>
                            <p className="text-gray-700 text-3xl font-bold">{product.name}</p>
                            <p className="text-gray-600 mt-1 text-md">Season {product.season}</p>

                            <p className="text-gray-600 font-bold flex gap-10 items-center text-2xl mt-3">
                                {product.price} <span className="text-gray-500 font-normal text-lg"><span className="line-through">{product.mrp}</span> <span className="text-green-600">({product.off_percentage}% OFF)</span></span>
                            </p>
                        </div>

                        {/* Size */}
                        <div>
                            <p className="text-gray-600 font-bold">Select size</p>
                            {
                                product.sizes && product.sizes.length > 0 ? (
                                    <div className="grid grid-cols-5 gap-4 mt-2 w-full">
                                        {product.sizes.map((size, index) => (
                                            <div
                                                key={index}
                                                className="border text-xs border-gray-400 p-2 rounded cursor-pointer hover:border-gray-500 hover:bg-gray-300 hover:text-gray-800 duration-300 text-center"
                                            >
                                                {size}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 mt-2">Size not available for this product.</p>
                                )
                            }
                        </div>

                        <div className="flex gap-4 w-full">
                            <Button className='cursor-pointer w-[50%] rounded-none'>Add to Cart</Button>
                            <Button variant="outline" className='cursor-pointer w-[50%] rounded-none'>Buy Now</Button>
                        </div>

                        <div className='flex gap-8'>
                            <Image src="https://dukaan.b-cdn.net/original/dukaan-media/plugins/trusted_badges_v2/free-shipping.svg" alt="Trust Seal" width={80} height={80} />

                            <Image src="https://dukaan.b-cdn.net/original/dukaan-media/plugins/trusted_badges_v2/premium-quality.svg" alt="Trust Seal" width={80} height={80} />

                            <Image src="https://dms.mydukaan.io/original/dukaan-media/plugins/trusted_badges_v2/cod-available.svg" alt="Trust Seal" width={80} height={80} />
                        </div>

                        <div className='flex flex-col gap-2'>
                            <p>Product Details:</p>
                            {
                                product.type === 'fan' && (
                                    <p className='text-sm'>Authentic Quality Fan Edition Jersey</p>
                                )
                            }

                            {product.type === 'player' && (
                                <p className='text-sm'>Authentic Quality Player Edition Jersey</p>
                            )}

                            {
                                product.type === "fan" && (
                                    <p className='text-justify text-xs'>
                                        This fan edition jersey pairs official design details with sweat-wicking technology to give you a game-ready or casual wear look inspired by your favourite team. <br /> <br />

                                        Super comfortable fabric with Drifit Technology makes it lightweight and moves sweat away from your skin for quicker evaporation, helping you stay dry and comfortable yet keeping you look cool & classy. <br /> <br />

                                        <span className='font-bold'>Authenticity</span> - Official design is modelled on what the pros wear on the pitch and what supporters wear. Each jersey comes with all the official tags as well. <br /> <br />

                                        <span className='font-bold'>Material</span> - Made from 100% recycled polyester to create high quality products like this jersey, specially designed to deliver peak performance with a lower impact on environment. <br /> <br />

                                        <span className='font-bold'>Fitting</span> - Regular/Parallel Fit
                                    </p>
                                )
                            }

                            {
                                product.type === "player" && (
                                    <p className='text-justify text-xs'>
                                        This one pairs authentic design details with lightweight, quick-drying fabric to help keep the world&apos;s biggest football stars cool and comfortable on the pitch. This product is made from 100% recycled polyester fibers. Advance Fabric technology combines moisture-wicking fabric with advanced engineering and features to help you stay dry and comfortable. Provides additional lightweight & breathability to boost your comfort and performance level. This Authentic jersey are same ones worn by your favorite players on the pitch. Yes, you read it right!
                                    </p>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
