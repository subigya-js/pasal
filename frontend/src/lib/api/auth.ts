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
            throw new Error(error.error || "Failed to sign up.");
        }

        return res.json();
    } catch (error: any) {
        console.error("Signup error:", error);
        // Check if it's a network error (backend not running or CORS issue)
        if (error instanceof TypeError) {
            throw new Error("Unable to connect to the server. Please make sure the backend is running on " + BASE_URL);
        }
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
            throw new Error(error.error || "Failed to log in.");
        }

        return res.json();
    } catch (error: any) {
        console.error("Login error:", error);
        // Check if it's a network error (backend not running or CORS issue)
        if (error instanceof TypeError) {
            throw new Error("Unable to connect to the server. Please make sure the backend is running on " + BASE_URL);
        }
        throw error;
    }
}

// GET USER PROFILE
export async function getUserProfile(token: string): Promise<UserProfileResponse> {
    const res = await fetch(`${BASE_URL}/profile`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch user profile.");
    }

    return res.json();
}
