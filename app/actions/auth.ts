'use server';

import { WC_API_CONFIG } from '@/lib/woocommerce/config';
import { RegisterData, LoginCredentials } from '@/lib/auth';
import { getCustomerOrders } from '@/lib/woocommerce/orders';

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
                },
            };
        }
    } catch (error: any) {
        console.log('JWT Auth for WP REST API not available, trying WooCommerce...');
    }

    // Method 3: WordPress password verification via custom endpoint
    // IMPORTANT: This requires a custom WordPress endpoint that verifies passwords
    // The previous method was insecure as it didn't verify passwords
    console.log('Attempting WordPress password verification...');

    try {
        // Try to verify password using WordPress REST API
        // This requires Application Passwords or a custom endpoint
        const wpAuthUrl = `${wordpressUrl}/wp-json/wp/v2/users/me`;

        const wpResponse = await fetch(wpAuthUrl, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64'),
            },
        });

        if (wpResponse.ok) {
            const wpUser = await wpResponse.json();
            console.log('WordPress authentication successful');

            // Create a session token
            const sessionToken = Buffer.from(JSON.stringify({
                email: credentials.username,
                id: wpUser.id,
                timestamp: Date.now(),
            })).toString('base64');

            return {
                success: true,
                data: {
                    token: sessionToken,
                    user_email: wpUser.email || credentials.username,
                    user_nicename: wpUser.slug || credentials.username.split('@')[0],
                    user_display_name: wpUser.name || credentials.username,
                },
            };
        }
    } catch (error: any) {
        console.log('WordPress REST API authentication failed, trying WooCommerce customer lookup...');
    }

    // SECURITY WARNING: The code below is DISABLED because it's insecure
    // It would log in users without password verification
    // To enable WooCommerce-only authentication, you MUST implement proper password verification
    console.error('All secure authentication methods failed. WooCommerce-only login requires JWT plugins.');
    return {
        success: false,
        error: 'Authentication failed. Please ensure JWT authentication plugins are installed on WordPress, or enable Application Passwords in WordPress settings.'
    };
}

export async function getCurrentUserAction(token: string, userEmail?: string) {
    const baseUrl = WC_API_CONFIG.baseUrl;
    const consumerKey = process.env.WORDPRESS_CONSUMER_KEY;
    const consumerSecret = process.env.WORDPRESS_CONSUMER_SECRET;

    console.log('Getting current user with token:', token ? 'Token exists' : 'No token');
    console.log('User email from JWT:', userEmail);

    try {
        // If we don't have the email, try to decode it from the JWT token
        let email = userEmail;

        if (!email && token) {
            // JWT tokens have 3 parts separated by dots: header.payload.signature
            // We can decode the payload (it's base64 encoded but not encrypted)
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    email = payload.data?.user?.user_email || payload.email;
                    console.log('Decoded email from JWT:', email);
                }
            } catch (decodeError) {
                console.error('Failed to decode JWT:', decodeError);
            }
        }

        if (!email) {
            console.error('No email found in token or parameters');
            return { success: false, error: 'Unable to determine user email' };
        }

        // Fetch WC customer details using email
        if (consumerKey && consumerSecret) {
            const customerUrl = `${baseUrl}/customers?email=${encodeURIComponent(email)}`;
            console.log('🔍 Fetching WC customer from:', customerUrl);

            try {
                // Add timeout to prevent hanging requests
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const customerResponse = await fetch(
                    customerUrl,
                    {
                        headers: {
                            'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
                        },
                        signal: controller.signal,
                    }
                );

                clearTimeout(timeoutId);
                console.log('✅ WC Customer Response Status:', customerResponse.status);

                if (customerResponse.ok) {
                    const customers = await customerResponse.json();
                    if (customers.length > 0) {
                        console.log('✅ WC Customer found:', customers[0].id, customers[0].email);
                        return { success: true, data: customers[0] };
                    } else {
                        console.log('⚠️ No WC customer found with email:', email);
                    }
                } else {
                    let errorDetails = 'Unknown error';
                    try {
                        const errorText = await customerResponse.text();
                        errorDetails = errorText;
                        console.error('❌ Failed to fetch WC customer. Status:', customerResponse.status);
                        console.error('❌ Error details:', errorText.substring(0, 500));
                    } catch (e) {
                        console.error('❌ Failed to fetch WC customer. Status:', customerResponse.status);
                        console.error('❌ Could not read error response');
                    }
                }
            } catch (fetchError: any) {
                // Catch network errors, timeouts, socket closures, etc.
                console.error('❌ NETWORK ERROR fetching WC customer:', fetchError.message);
                console.error('❌ Error type:', fetchError.name);
                if (fetchError.cause) {
                    console.error('❌ Error cause:', fetchError.cause);
                }

                // Don't continue to create - the customer likely exists but we can't reach WC
                console.warn('⚠️ WooCommerce API unreachable. Will use fallback profile.');
            }
        } else {
            console.warn('Missing Consumer Key/Secret, skipping WC customer fetch');
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

        // Fallback: If we reach here, customer exists but we can't fetch it from WooCommerce
        // This can happen due to API issues, permissions, or sync problems
        // Allow login to succeed with basic user data so user isn't locked out
        console.warn('⚠️ Could not fetch WooCommerce customer for:', email);
        console.warn('⚠️ Creating temporary user profile. Orders may not be linked until WC customer is accessible.');

        // Create a temporary but functional user object
        // Use a hash of the email as a pseudo-ID (better than 0, won't conflict)
        const emailHash = email.split('').reduce((acc, char) => {
            return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);
        const pseudoId = Math.abs(emailHash) % 1000000; // Keep it reasonable

        return {
            success: true,
            data: {
                id: pseudoId, // Non-zero ID to prevent "No customer ID" errors
                email: email,
                first_name: firstName,
                last_name: lastName,
                username: emailUsername,
                role: 'customer',
                avatar_url: '',
                billing: {},
                shipping: {},
                // Mark this as a temporary profile
                _meta: {
                    is_temporary: true,
                    reason: 'woocommerce_fetch_failed',
                    message: 'Customer exists but could not be fetched from WooCommerce'
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
}) {
    try {
        const orders = await getCustomerOrders(customerId, params);
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
