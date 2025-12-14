"use client";

import { getAllProducts } from "@/lib/api/products";
import { Product } from "@/types/product";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TeamInfo {
    name: string;
    count: number;
    logo?: string;
}

export default function TeamsSection() {
    const [teams, setTeams] = useState<TeamInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await getAllProducts();
                const products = response.products;

                // Group products by team
                const teamMap = new Map<string, TeamInfo>();

                products.forEach((product: Product) => {
                    if (product.team) {
                        const existing = teamMap.get(product.team);
                        if (existing) {
                            existing.count++;
                        } else {
                            teamMap.set(product.team, {
                                name: product.team,
                                count: 1,
                                logo: product.images?.[0], // Use first product image as team logo
                            });
                        }
                    }
                });

                // Convert to array and sort by name
                const teamsArray = Array.from(teamMap.values()).sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

                setTeams(teamsArray);
            } catch (error) {
                console.error("Failed to fetch teams:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16" id="teams">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Shop by Team
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Find jerseys from your favorite football clubs
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl p-6 shadow-md animate-pulse"
                        >
                            <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (teams.length === 0) {
        return null;
    }

    return (
        <div className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4 py-16" id="teams">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Shop by Team
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Find jerseys from your favorite football clubs
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {teams.map((team, index) => (
                        <Link
                            key={team.name}
                            href={`/teams/${encodeURIComponent(team.name)}`}
                            className="group"
                        >
                            <div
                                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="aspect-square mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                                    {team.logo ? (
                                        <img
                                            src={team.logo}
                                            alt={team.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="text-4xl font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                                            {team.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                                        <span className="text-white text-sm font-semibold">
                                            View Jerseys
                                        </span>
                                    </div>
                                </div>

                                {/* Team Name */}
                                <h3 className="text-center font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-1 truncate">
                                    {team.name}
                                </h3>

                                {/* Jersey Count */}
                                <p className="text-center text-sm text-gray-500">
                                    {team.count} Jersey{team.count !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
