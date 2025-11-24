"use client";

import { login as apiLogin, signup as apiSignup, getUserProfile } from '@/lib/api/auth';
import { LoginRequest, SignupRequest, User } from '@/types/user';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    signup: (data: SignupRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Start with null state to match SSR
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydrate from localStorage immediately after mount (before async validation)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Load cached data synchronously
        const storedToken = localStorage.getItem('auth_token');
        const cachedUser = localStorage.getItem('auth_user');

        if (storedToken && cachedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(cachedUser));
            } catch (error) {
                console.error('[AuthContext] Error parsing cached user:', error);
            }
        }

        setIsHydrated(true);
    }, []);

    // Validate token after hydration
    useEffect(() => {
        if (!isHydrated) return;

        const loadAuth = async () => {
            try {
                // Use the token from state, which was hydrated from localStorage
                if (token) {
                    // Validate token by fetching user profile
                    const profile = await getUserProfile(token);
                    // If profile is successfully fetched, user and token are valid
                    // No need to set token again, it's already in state
                    setUser(profile);
                    // Cache user data for optimistic loading
                    localStorage.setItem('auth_user', JSON.stringify(profile));
                } else {
                    // No token in state, so no need to validate
                    setUser(null);
                }
            } catch (error: unknown) {
                console.error('[AuthContext] Error loading auth:', error);
                // Only clear token if it's an authentication error (401)
                // Don't clear on network errors
                const errorMessage = error instanceof Error ? error.message : '';
                if (errorMessage.includes('Unable to connect to the server')) {
                    // Keep the token in localStorage for retry
                    // The token state is already set from hydration, so no change needed
                } else {
                    // Authentication error - clear the invalid token and cached user
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    setToken(null);
                    setUser(null);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadAuth();
    }, [isHydrated]); // Only run once after hydration

    const login = async (data: LoginRequest) => {
        try {
            const response = await apiLogin(data);
            const newToken = response.token;

            // Store token
            localStorage.setItem('auth_token', newToken);
            setToken(newToken);

            // Set user from login response (no need to fetch profile)
            if (response.user) {
                setUser(response.user);
                // Cache user data for optimistic loading on reload
                localStorage.setItem('auth_user', JSON.stringify(response.user));
            } else {
                console.error("User data not found in login response. Backend may need to be restarted.");
                throw new Error("Invalid login response format. Please contact support.");
            }
        } catch (error) {
            throw error;
        }
    };

    const signup = async (data: SignupRequest) => {
        try {
            await apiSignup(data);
            // Don't auto-login after signup, let user login manually
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setToken(null);
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        token,
        isLoggedIn: !!token && !!user,
        isLoading,
        login,
        signup,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
