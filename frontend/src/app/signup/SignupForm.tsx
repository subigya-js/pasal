'use client';

import { AuthActionResult } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SignupRequest } from '@/types/user';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface SignupFormProps {
    signupAction: (data: SignupRequest) => Promise<AuthActionResult>;
}

export function SignupForm({ signupAction }: SignupFormProps) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPending, startTransition] = useTransition();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setSuccess('');

        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        startTransition(async () => {
            try {
                const result = await signupAction({ name, email, password });

                if (result.success) {
                    setSuccess('Account created successfully! Redirecting to login...');
                    setTimeout(() => {
                        router.push('/login');
                    }, 1500);
                } else {
                    setError(result.error || 'Failed to sign up. Please try again.');
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

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {success}
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                    </label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        disabled={isPending}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="John Doe"
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <Input
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
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        disabled={isPending}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Creating account...' : 'Sign Up'}
                </Button>
            </form>
        </>
    );
}
