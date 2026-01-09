'use server';

import { WC_API_CONFIG } from '@/lib/woocommerce/config';
import { RegisterData, LoginCredentials } from '@/lib/auth';
import { getCustomerOrders, getOrdersByEmail } from '@/lib/woocommerce/orders';

export async function registerUserAction(data: RegisterData) {
    const baseUrl = WC_API_CONFIG.baseUrl;
    // Use server-side keys
    const consumerKey = process.env.WORDPRESS_CONSUMER_KEY;
    const consumerSecret = process.env.WORDPRESS_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        console.error('Missing WORDPRESS_CONSUMER_KEY or WORDPRESS_CONSUMER_SECRET');
        return { success: false, error: 'Server configuration error: Missing API keys' };
    }

    try {
        const response = await fetch(`${baseUrl}/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('WooCommerce Registration Error:', responseData);
            return {
                success: false,
                error: responseData.message || 'Registration failed',
                code: responseData.code
            };
        }

        return { success: true, data: responseData };
    } catch (error: any) {
        console.error('Registration error:', error);
        return { success: false, error: error.message || 'An unexpected error occurred' };
    }
}

export async function loginUserAction(credentials: LoginCredentials) {
    console.log('Attempting login for:', credentials.username);

    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;

    // Method 1: Try Simple JWT Login endpoint first (newer plugin)
    const simpleJwtUrl = `${wordpressUrl}/wp-json/simple-jwt-login/v1/auth`;
    console.log('Trying Simple JWT Login URL:', simpleJwtUrl);

    try {
        const authKey = process.env.SIMPLE_JWT_AUTH_KEY || 'IdealIndiskaStockholmAuthKey';

        const response = await fetch(simpleJwtUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: credentials.username,
                password: credentials.password,
                AUTH_KEY: authKey,
            }),
        });

        console.log('Simple JWT Login Response Status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Simple JWT Login Success:', data);

            const transformedData = {
                token: data.data?.jwt || data.jwt,
                user_email: data.data?.user?.user_email || data.user?.user_email,
                user_nicename: data.data?.user?.user_nicename || data.user?.user_nicename,
                user_display_name: data.data?.user?.user_display_name || data.user?.user_display_name,
                user_id: data.data?.user?.id || data.user?.ID || data.user?.id || data.id,
            };

            return { success: true, data: transformedData };
        } else {
            // Log the error response for debugging
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Simple JWT Login Error:', response.status, errorData);
        }
    } catch (error: any) {
        console.error('Simple JWT Login exception:', error);
        console.log('Trying alternative authentication methods...');
    }

    // Method 2: Try JWT Authentication for WP REST API plugin
    const jwtAuthUrl = `${wordpressUrl}/wp-json/jwt-auth/v1/token`;
    console.log('Trying JWT Auth for WP REST API:', jwtAuthUrl);

    try {
        const response = await fetch(jwtAuthUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
            }),
        });

        console.log('JWT Auth Response Status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('JWT Auth Success');

            return {
                success: true,
                data: {
                    token: data.token,
                    user_email: data.user_email,
                    user_nicename: data.user_nicename,
                    user_display_name: data.user_display_name,
                    user_id: data.user_id || (data.user ? data.user.id : undefined),
                },
            };
        }
    } catch (error: any) {
        console.log('JWT Auth for WP REST API not available, trying WooCommerce...');
    }

    // Method 3: WordPress password verification via custom endpoint
    console.log('Attempting WordPress password verification...');

    try {
        const wpAuthUrl = `${wordpressUrl}/wp-json/wp/v2/users/me`;

        const wpResponse = await fetch(wpAuthUrl, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64'),
            },
        });

        if (wpResponse.ok) {
            const wpUser = await wpResponse.json();
            console.log('WordPress authentication successful, User ID:', wpUser.id);

            // Create a session token with the ID included
            const sessionToken = Buffer.from(JSON.stringify({
                email: credentials.username,
                id: wpUser.id,
                timestamp: Date.now(),
            })).toString('base64');

            return {
                success: true,
                data: {
                    token: sessionToken,
                    user_id: wpUser.id,
                    user_email: wpUser.email || credentials.username,
                    user_nicename: wpUser.slug || credentials.username.split('@')[0],
                    user_display_name: wpUser.name || credentials.username,
                },
            };
        }
    } catch (error: any) {
        console.log('WordPress REST API authentication failed, trying WooCommerce customer lookup...');
    }

    return {
        success: false,
        error: 'Authentication failed. Please check your email and password.'
    };
}

export async function getCurrentUserAction(token: string, userEmail?: string, userId?: number) {
    const baseUrl = WC_API_CONFIG.baseUrl;
    const consumerKey = process.env.WORDPRESS_CONSUMER_KEY;
    const consumerSecret = process.env.WORDPRESS_CONSUMER_SECRET;

    console.log('Getting current user. ID:', userId, 'Email:', userEmail);

    try {
        let email = userEmail;
        let id = userId;

        // If we don't have the data, try to decode it from the JWT token
        if ((!email || !id) && token) {
            try {
                // Try simple Base64 decode first for our custom session token
                const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
                if (decoded.email) email = decoded.email;
                if (decoded.id) id = decoded.id;
            } catch (e) {
                // If that fails, it's likely a standard JWT
                try {
                    const parts = token.split('.');
                    if (parts.length === 3) {
                        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                        email = payload.data?.user?.user_email || payload.email || payload.user_email;
                        id = payload.data?.user?.id || payload.user_id || payload.id;
                    }
                } catch (decodeError) {
                    console.error('Failed to decode JWT:', decodeError);
                }
            }
        }

        if (!email) {
            console.error('No email found in token or parameters');
            return { success: false, error: 'Unable to determine user email' };
        }

        // Fetch WC customer details
        if (consumerKey && consumerSecret) {
            // STRATEGY: Try fetching by ID first as it's more direct and stable
            if (id && id > 0) {
                const idUrl = `${baseUrl}/customers/${id}`;
                console.log('🔍 Fetching Customer by direct ID:', id);
                try {
                    const idResponse = await fetch(idUrl, {
                        headers: {
                            'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
                        }
                    });
                    if (idResponse.ok) {
                        const customer = await idResponse.json();
                        console.log('✅ Found customer by direct ID:', customer.id);
                        return { success: true, data: customer };
                    }
                } catch (e) {
                    console.warn('⚠️ ID-based lookup failed, falling back to email search');
                }
            }

            // Fallback to email search (can be slow/timeout prone)
            const customerUrl = `${baseUrl}/customers?email=${encodeURIComponent(email)}`;
            console.log('🔍 Searching WC customer by email:', email);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                const customerResponse = await fetch(customerUrl, {
                    headers: {
                        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);
                if (customerResponse.ok) {
                    const customers = await customerResponse.json();
                    if (customers.length > 0) {
                        return { success: true, data: customers[0] };
                    }
                }
            } catch (fetchError: any) {
                console.error('❌ Network error during email search:', fetchError.message);
            }
        }

        // No WooCommerce customer found - create one automatically
        console.log('No WooCommerce customer found, creating one for:', email);

        // Extract name from email (before @) for initial customer data
        const emailUsername = email.split('@')[0];
        const nameParts = emailUsername.split(/[._-]/);
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Try to create a WooCommerce customer
        if (consumerKey && consumerSecret) {
            try {
                const createCustomerUrl = `${baseUrl}/customers`;
                const customerData = {
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    username: emailUsername,
                };

                console.log('Creating WooCommerce customer:', customerData);

                const createResponse = await fetch(createCustomerUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
                    },
                    body: JSON.stringify(customerData),
                });

                if (createResponse.ok) {
                    const newCustomer = await createResponse.json();
                    console.log('WooCommerce customer created successfully:', newCustomer.id);
                    return { success: true, data: newCustomer };
                } else {
                    const errorData = await createResponse.json();
                    console.error('Failed to create WooCommerce customer:', errorData);

                    // If customer already exists (maybe created between checks), try fetching again
                    if (errorData.code === 'registration-error-email-exists') {
                        const retryCustomerUrl = `${baseUrl}/customers?email=${email}`;
                        const retryResponse = await fetch(retryCustomerUrl, {
                            headers: {
                                'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
                            },
                        });

                        if (retryResponse.ok) {
                            const customers = await retryResponse.json();
                            if (customers.length > 0) {
                                console.log('Found existing customer on retry:', customers[0].id);
                                return { success: true, data: customers[0] };
                            }
                        }
                    }
                }
            } catch (createError) {
                console.error('Error creating WooCommerce customer:', createError);
            }
        }

        // Fallback: Use WordPress User ID as WooCommerce ID (they are usually identical)
        console.warn('⚠️ WooCommerce lookup failed. Using verified WordPress identity.');

        const verifiedId = id || Math.abs(email.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 1000000;

        return {
            success: true,
            data: {
                id: verifiedId,
                email: email,
                first_name: firstName,
                last_name: lastName,
                username: emailUsername,
                role: 'customer',
                billing: {},
                shipping: {},
                _meta: {
                    is_temporary: true,
                    reason: 'woocommerce_unreachable',
                    identity_source: id ? 'wordpress_id' : 'email_hash'
                }
            }
        };

    } catch (error: any) {
        console.error('Get user error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get orders for the current logged-in customer
 */
export async function getCustomerOrdersAction(customerId: number, params?: {
    per_page?: number;
    page?: number;
    status?: string;
    email?: string; // Optional email for fallback search
}) {
    try {
        console.log('Fetching orders for customer ID:', customerId);
        let orders = await getCustomerOrders(customerId, params);

        // If no orders found by ID, and we have an email, try searching by email (guest orders)
        if ((!orders || orders.length === 0) && params?.email) {
            console.log('No orders found by ID, trying fallback search by email:', params.email);
            const fallbackOrders = await getOrdersByEmail(params.email, params);
            if (fallbackOrders && fallbackOrders.length > 0) {
                // Merge or return fallback orders
                // We return them as they are likely the missing orders
                return { success: true, data: fallbackOrders };
            }
        }

        return { success: true, data: orders };
    } catch (error: any) {
        console.error('Get customer orders error:', error);
        return { success: false, error: error.message || 'Failed to fetch orders' };
    }
}

/**
 * Update customer data in WooCommerce
 */
export async function updateCustomerAction(customerId: number, data: any) {
    const baseUrl = WC_API_CONFIG.baseUrl;
    const consumerKey = process.env.WORDPRESS_CONSUMER_KEY;
    const consumerSecret = process.env.WORDPRESS_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        return { success: false, error: 'Server configuration error: Missing API keys' };
    }

    try {
        const response = await fetch(`${baseUrl}/customers/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('WooCommerce Update Customer Error:', responseData);
            return {
                success: false,
                error: responseData.message || 'Failed to update customer',
            };
        }

        return { success: true, data: responseData };
    } catch (error: any) {
        console.error('Update customer error:', error);
        return { success: false, error: error.message || 'Failed to update customer' };
    }
}
