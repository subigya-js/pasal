"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
    const { user, token, isLoggedIn, isLoading } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        setLocalStorageToken(localStorage.getItem('auth_token'));
    }, []);

    if (process.env.NODE_ENV !== 'development' || !mounted) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg text-xs max-w-sm z-50">
            <h3 className="font-bold mb-2">Auth Debug Info</h3>
            <div className="space-y-1">
                <div>
                    <span className="text-gray-400">isLoading:</span>{' '}
                    <span className={isLoading ? 'text-yellow-400' : 'text-green-400'}>
                        {isLoading ? 'true' : 'false'}
                    </span>
                </div>
                <div>
                    <span className="text-gray-400">isLoggedIn:</span>{' '}
                    <span className={isLoggedIn ? 'text-green-400' : 'text-red-400'}>
                        {isLoggedIn ? 'true' : 'false'}
                    </span>
                </div>
                <div>
                    <span className="text-gray-400">token:</span>{' '}
                    <span className="text-blue-400">
                        {token ? `${token.substring(0, 20)}...` : 'null'}
                    </span>
                </div>
                <div>
                    <span className="text-gray-400">user:</span>{' '}
                    <span className="text-purple-400">
                        {user ? user.email : 'null'}
                    </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700">
                    <span className="text-gray-400">localStorage token:</span>{' '}
                    <span className="text-blue-400">
                        {localStorageToken ? 'exists' : 'none'}
                    </span>
                </div>
            </div>
        </div>
    );
}
