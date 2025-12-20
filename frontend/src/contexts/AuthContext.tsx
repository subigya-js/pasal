"use client";

import { getSession, loginAction, logoutAction, signupAction } from '@/actions/auth';
import { LoginRequest, SignupRequest, User } from '@/types/user';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    signup: (data: SignupRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load session from server on mount
    useEffect(() => {
        const loadSession = async () => {
            try {
                const session = await getSession();
                setUser(session.user);
                setToken(session.token);
            } catch (error) {
                console.error('[AuthContext] Error loading session:', error);
                setUser(null);
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, []);

    const login = async (data: LoginRequest) => {
        try {
            const result = await loginAction(data);

            if (!result.success) {
                throw new Error(result.error || 'Failed to log in.');
            }

            if (result.user) {
                setUser(result.user);
                // Fetch the session to get the token
                const session = await getSession();
                setToken(session.token);
            }
        } catch (error) {
            throw error;
        }
    };

    const signup = async (data: SignupRequest) => {
        try {
            const result = await signupAction(data);

            if (!result.success) {
                throw new Error(result.error || 'Failed to sign up.');
            }
            // Don't auto-login after signup, let user login manually
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await logoutAction();
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('[AuthContext] Error during logout:', error);
            // Still clear local state even if server action fails
            setToken(null);
            setUser(null);
        }
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
