import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/api/products";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TeamPageProps {
    params: {
        teamName: string;
    };
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { teamName } = params;

    // Decode the team name from URL
    const decodedTeamName = decodeURIComponent(teamName);

    // Fetch all products
    const res = await getAllProducts();
    const allProducts = res.products;

    // Filter products by team (case-insensitive)
    const teamProducts = allProducts.filter(
        (product) =>
            product.team &&
            product.team.toLowerCase() === decodedTeamName.toLowerCase()
    );

    // If no products found for this team, show 404
    if (teamProducts.length === 0) {
        notFound();
    }

    // Get the actual team name from the first product (for proper casing)
    const displayTeamName = teamProducts[0].team;

    return (
        <div className="font-sans min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg3djFoLTd6bTAgNWg3djFoLTd6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        {/* Breadcrumb */}
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-300 mb-4">
                            <Link href="/" className="hover:text-white transition-colors">
                                Home
                            </Link>
                            <span>/</span>
                            <Link href="/#teams" className="hover:text-white transition-colors">
                                Teams
                            </Link>
                            <span>/</span>
                            <span className="text-white">{displayTeamName}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
                            {displayTeamName} Jerseys
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 font-light">
                            Explore our collection of {displayTeamName} football jerseys
                        </p>
                        <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full inline-flex">
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">{teamProducts.length} Jersey{teamProducts.length !== 1 ? 's' : ''} Available</span>
                        </div>
                    </div>
                </div>

                {/* Wave separator */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(249, 250, 251)" />
                    </svg>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {teamProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
