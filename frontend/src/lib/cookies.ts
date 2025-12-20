import { User } from '@/types/user';
import { cookies } from 'next/headers';

const TOKEN_COOKIE_NAME = 'auth_token';
const USER_COOKIE_NAME = 'auth_user';

// Cookie options
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
};

export async function setAuthCookies(token: string, user: User) {
    const cookieStore = await cookies();

    cookieStore.set(TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
    cookieStore.set(USER_COOKIE_NAME, JSON.stringify(user), {
        ...COOKIE_OPTIONS,
        httpOnly: false, // Allow client to read user data
    });
}

export async function getAuthToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(TOKEN_COOKIE_NAME)?.value;
}

export async function getAuthUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get(USER_COOKIE_NAME)?.value;

    if (!userCookie) return null;

    try {
        return JSON.parse(userCookie) as User;
    } catch {
        return null;
    }
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();

    cookieStore.delete(TOKEN_COOKIE_NAME);
    cookieStore.delete(USER_COOKIE_NAME);
}
