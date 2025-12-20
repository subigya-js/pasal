'use server';

import { clearAuthCookies, getAuthToken, getAuthUser, setAuthCookies } from '@/lib/cookies';
import { LoginRequest, SignupRequest, User } from '@/types/user';
import { BASE_URL } from '../../constants/constants';

export interface AuthActionResult {
    success: boolean;
    error?: string;
    user?: User;
}

export interface SessionResult {
    user: User | null;
    token: string | null;
}

/**
 * Server action for user signup
 */
export async function signupAction(data: SignupRequest): Promise<AuthActionResult> {
    try {
        const res = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            return {
                success: false,
                error: error.error || 'Failed to sign up.',
            };
        }

        await res.json();
        return { success: true };
    } catch (error: unknown) {
        if (error instanceof TypeError) {
            return {
                success: false,
                error: `Unable to connect to the server. Please make sure the backend is running on ${BASE_URL}`,
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
        };
    }
}

/**
 * Server action for user login
 */
export async function loginAction(data: LoginRequest): Promise<AuthActionResult> {
    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            return {
                success: false,
                error: error.error || 'Failed to log in.',
            };
        }

        const response = await res.json();
        const { token, user } = response;

        if (!token || !user) {
            return {
                success: false,
                error: 'Invalid login response format. Please contact support.',
            };
        }

        // Set auth cookies
        await setAuthCookies(token, user);

        return {
            success: true,
            user,
        };
    } catch (error: unknown) {
        if (error instanceof TypeError) {
            return {
                success: false,
                error: `Unable to connect to the server. Please make sure the backend is running on ${BASE_URL}`,
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
        };
    }
}

/**
 * Server action for user logout
 */
export async function logoutAction(): Promise<void> {
    await clearAuthCookies();
}

/**
 * Server action to get current session
 */
export async function getSession(): Promise<SessionResult> {
    const token = await getAuthToken();

    if (!token) {
        return { user: null, token: null };
    }

    try {
        // Validate token by fetching user profile
        const res = await fetch(`${BASE_URL}/profile/`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            // Token is invalid, clear cookies
            await clearAuthCookies();
            return { user: null, token: null };
        }

        const user = await res.json();

        // Update user cookie with fresh data
        await setAuthCookies(token, user);

        return { user, token };
    } catch (error) {
        console.error('Error validating session:', error);

        // On network error, return cached user data if available
        if (error instanceof TypeError) {
            const cachedUser = await getAuthUser();
            if (cachedUser) {
                return { user: cachedUser, token };
            }
        }

        // Clear invalid session
        await clearAuthCookies();
        return { user: null, token: null };
    }
}

/**
 * Server action to refresh user profile
 */
export async function refreshUserProfile(): Promise<User | null> {
    const token = await getAuthToken();

    if (!token) {
        return null;
    }

    try {
        const res = await fetch(`${BASE_URL}/profile/`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            return null;
        }

        const user = await res.json();

        // Update user cookie
        await setAuthCookies(token, user);

        return user;
    } catch (error) {
        console.error('Error refreshing user profile:', error);
        return null;
    }
}
