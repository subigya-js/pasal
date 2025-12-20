'use client';

import { AuthActionResult } from '@/actions/auth';
import { LoginRequest } from '@/types/user';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface LoginFormProps {
    loginAction: (data: LoginRequest) => Promise<AuthActionResult>;
}

export function LoginForm({ loginAction }: LoginFormProps) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        startTransition(async () => {
            try {
                const result = await loginAction({ email, password });

                if (result.success) {
                    router.push('/');
                } else {
                    setError(result.error || 'Failed to log in. Please try again.');
                }
            } catch {
                setError('An unexpected error occurred. Please try again.');
            }
        });
    }

    return (
        <>
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        disabled={isPending}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="you@example.com"
                    />
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        disabled={isPending}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="••••••••"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
        </>
    );
}
