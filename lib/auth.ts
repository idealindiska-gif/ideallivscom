import { WC_API_CONFIG } from './woocommerce/config';

export interface LoginCredentials {
    username: string;
    password?: string;
}

export interface RegisterData {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    password?: string;
}

export interface AuthResponse {
    token: string;
    user_email: string;
    user_nicename: string;
    user_display_name: string;
}

/**
 * Login user using JWT Authentication
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
    const baseUrl = WC_API_CONFIG.baseUrl;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Register a new customer
 */
export async function registerUser(data: RegisterData) {
    const baseUrl = WC_API_CONFIG.baseUrl;
    const consumerKey = process.env.NEXT_PUBLIC_WORDPRESS_CONSUMER_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WORDPRESS_CONSUMER_SECRET;

    try {
        const response = await fetch(`${baseUrl}/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Use basic auth for registration as it's a protected endpoint usually
                'Authorization': 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`),
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Registration failed');
        }

        return responseData;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

/**
 * Get current user details
 */
export async function getCurrentUser(token: string) {
    const baseUrl = WC_API_CONFIG.baseUrl;

    try {
        // First try to get WP user to get ID/Email
        const wpUserResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!wpUserResponse.ok) {
            throw new Error('Failed to fetch user');
        }

        const wpUser = await wpUserResponse.json();

        // Then try to get WC customer details using email
        // Note: This requires the consumer keys as customers endpoint is protected
        const consumerKey = process.env.NEXT_PUBLIC_WORDPRESS_CONSUMER_KEY;
        const consumerSecret = process.env.NEXT_PUBLIC_WORDPRESS_CONSUMER_SECRET;

        const customerResponse = await fetch(
            `${baseUrl}/customers?email=${wpUser.email}`,
            {
                headers: {
                    'Authorization': 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`),
                },
            }
        );

        if (customerResponse.ok) {
            const customers = await customerResponse.json();
            if (customers.length > 0) {
                return customers[0];
            }
        }

        // Fallback if WC customer fetch fails or returns empty
        return {
            id: wpUser.id,
            email: wpUser.email,
            first_name: wpUser.name.split(' ')[0],
            last_name: wpUser.name.split(' ').slice(1).join(' '),
            username: wpUser.slug,
            role: 'customer',
            avatar_url: wpUser.avatar_urls?.['96'],
            billing: {},
            shipping: {},
        };

    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
}
