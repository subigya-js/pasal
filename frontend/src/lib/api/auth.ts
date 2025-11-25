import {
    AuthResponse,
    LoginRequest,
    SignupRequest,
    SignupResponse,
    UserProfileResponse
} from "@/types/user";
import { BASE_URL } from "../../../constants/constants";

// SIGNUP
export async function signup(data: SignupRequest): Promise<SignupResponse> {
    try {
        const res = await fetch(`${BASE_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            // This is an expected API error (e.g., email already exists)
            // Don't log to console as it's not a system error
            throw new Error(error.error || "Failed to sign up.");
        }

        return res.json();
    } catch (error: unknown) {
        // Only log unexpected errors (network errors, not API validation errors)
        if (error instanceof TypeError) {
            console.error("Network error during signup:", error);
            throw new Error("Unable to connect to the server. Please make sure the backend is running on " + BASE_URL);
        }
        // Re-throw API errors without logging (they're expected and handled in the UI)
        throw error;
    }
}

// LOGIN
export async function login(data: LoginRequest): Promise<AuthResponse> {
    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            // This is an expected API error (e.g., wrong credentials, user doesn't exist)
            // Don't log to console as it's not a system error
            throw new Error(error.error || "Failed to log in.");
        }

        return res.json();
    } catch (error: unknown) {
        // Only log unexpected errors (network errors, not API validation errors)
        if (error instanceof TypeError) {
            console.error("Network error during login:", error);
            throw new Error("Unable to connect to the server. Please make sure the backend is running on " + BASE_URL);
        }
        // Re-throw API errors without logging (they're expected and handled in the UI)
        throw error;
    }
}

// GET USER PROFILE
export async function getUserProfile(token: string): Promise<UserProfileResponse> {
    try {
        const res = await fetch(`${BASE_URL}/profile/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            if (res.status === 401) {
                throw new Error("Failed to fetch user profile.");
            }
            const error = await res.json();
            throw new Error(error.error || "Failed to fetch user profile.");
        }

        return res.json();
    } catch (error: unknown) {
        console.error("Get user profile error:", error);
        // Check if it's a network error (backend not running or CORS issue)
        if (error instanceof TypeError) {
            throw new Error("Unable to connect to the server. Please make sure the backend is running on " + BASE_URL);
        }
        throw error;
    }
}
