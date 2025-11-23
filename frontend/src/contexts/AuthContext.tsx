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
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load token from localStorage on mount
    useEffect(() => {
        const loadAuth = async () => {
            try {
                // Ensure we're in the browser
                if (typeof window === 'undefined') {
                    setIsLoading(false);
                    return;
                }

                const storedToken = localStorage.getItem('auth_token');
                console.log('[AuthContext] Loading auth, token exists:', !!storedToken);

                if (storedToken) {
                    // Validate token by fetching user profile
                    const profile = await getUserProfile(storedToken);
                    console.log('[AuthContext] Profile loaded successfully:', profile);
                    setToken(storedToken);
                    setUser({
                        id: profile.userID,
                        name: profile.name,
                        email: profile.email,
                    });
                }
            } catch (error: unknown) {
                console.error('[AuthContext] Error loading auth:', error);
                // Only clear token if it's an authentication error (401)
                // Don't clear on network errors
                const errorMessage = error instanceof Error ? error.message : '';
                if (errorMessage.includes('Unable to connect to the server')) {
                    console.log('[AuthContext] Network error, keeping token for retry');
                    // Keep the token in localStorage for retry
                    const storedToken = localStorage.getItem('auth_token');
                    if (storedToken) {
                        setToken(storedToken);
                    }
                } else {
                    // Authentication error - clear the invalid token
                    console.log('[AuthContext] Clearing invalid token');
                    localStorage.removeItem('auth_token');
                    setToken(null);
                    setUser(null);
                }
            } finally {
                setIsLoading(false);
                console.log('[AuthContext] Auth loading complete');
            }
        };

        loadAuth();
    }, []);

    const login = async (data: LoginRequest) => {
        try {
            const response = await apiLogin(data);
            console.log("Login response:", response);
            const newToken = response.token;

            // Store token
            localStorage.setItem('auth_token', newToken);
            setToken(newToken);

            // Set user from login response (no need to fetch profile)
            if (response.user) {
                setUser({
                    id: response.user.userID,
                    name: response.user.name,
                    email: response.user.email,
                });
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
