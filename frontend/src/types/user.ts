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
        userID: string;
        name: string;
        email: string;
    };
}

export interface SignupResponse {
    message: string;
}

export interface UserProfileResponse {
    userID: string;
    email: string;
    name: string;
}
