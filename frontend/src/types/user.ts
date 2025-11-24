export interface User {
    id: string;
    name: string;
    email: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export interface SignupResponse {
    message: string;
}

export interface UserProfileResponse {
    id: string;
    email: string;
    name: string;
}
