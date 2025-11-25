"use client";

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FiMail, FiUser } from 'react-icons/fi';

export default function ProfilePage() {
    const { user, isLoggedIn, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push('/login');
        }
    }, [isLoggedIn, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Cover Image */}
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                    {/* Profile Content */}
                    <div className="px-6 pb-6">
                        {/* Avatar */}
                        <div className="relative -mt-16 mb-4">
                            <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-gray-500 mt-1">Member since {new Date().getFullYear()}</p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                {/* Name Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-blue-500 rounded-lg">
                                            <FiUser className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-600">Full Name</p>
                                            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Card */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-purple-500 rounded-lg">
                                            <FiMail className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-purple-600">Email Address</p>
                                            <p className="text-lg font-semibold text-gray-900 break-all">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                                <Button
                                    onClick={() => router.push('/')}
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                >
                                    Back to Home
                                </Button>
                                <Button
                                    onClick={() => {
                                        logout();
                                        router.push('/');
                                    }}
                                    variant="destructive"
                                    size="lg"
                                    className="flex-1"
                                >
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info Section */}
                <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Information</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600">Account Status</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600">Account Type</span>
                            <span className="text-gray-900 font-medium">Standard User</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600">Last Login</span>
                            <span className="text-gray-900 font-medium">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
