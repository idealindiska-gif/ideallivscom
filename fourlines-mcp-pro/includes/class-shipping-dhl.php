<?php
/**
 * DHL Shipping Integration for Fourlines MCP
 *
 * Exposes DHL eCom Sweden plugin functionality via REST API
 */

defined('ABSPATH') || exit;

class Fourlines_MCP_Shipping_DHL {

    /**
     * Initialize hooks
     */
    public static function init() {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public static function register_routes() {
        register_rest_route('fourlines-mcp/v1', '/shipping/calculate', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'calculate_shipping'],
            'permission_callback' => [__CLASS__, 'check_api_key'],
        ]);
    }

    /**
     * Check API key authentication
     */
    public static function check_api_key($request) {
        $api_key = $request->get_header('X-Fourlines-Key');

        if (empty($api_key)) {
            return new WP_Error(
                'missing_api_key',
                'API key is required',
                ['status' => 401]
            );
        }

        // Get stored API key
        $stored_key = get_option('fourlines_mcp_api_key');

        if ($api_key !== $stored_key) {
            return new WP_Error(
                'invalid_api_key',
                'Invalid API key',
                ['status' => 401]
            );
        }

        return true;
    }

    /**
     * Calculate shipping costs using DHL plugin and WooCommerce
     */
    public static function calculate_shipping($request) {
        try {
            $params = $request->get_json_params();

            // Validate required parameters
            if (empty($params['postcode'])) {
                return new WP_Error(
                    'missing_params',
                    'Missing required parameter: postcode',
                    ['status' => 400]
                );
            }

            // Initialize WooCommerce if needed
            if (!function_exists('WC')) {
                return new WP_Error(
                    'woocommerce_not_active',
                    'WooCommerce is not active',
                    ['status' => 500]
                );
            }

            // Initialize WC cart and customer
            if (!WC()->cart) {
                require_once WC_ABSPATH . 'includes/wc-cart-functions.php';
                require_once WC_ABSPATH . 'includes/wc-notice-functions.php';

                if (null === WC()->session) {
                    $session_class = apply_filters('woocommerce_session_handler', 'WC_Session_Handler');
                    WC()->session = new $session_class();
                    WC()->session->init();
                }

                if (null === WC()->customer) {
                    WC()->customer = new WC_Customer(get_current_user_id(), true);
                }

                if (null === WC()->cart) {
                    WC()->cart = new WC_Cart();
                }
            }

            // Clear cart first
            WC()->cart->empty_cart();

            // Add items to cart if provided
            if (!empty($params['items']) && is_array($params['items'])) {
                foreach ($params['items'] as $item) {
                    if (!empty($item['product_id'])) {
                        WC()->cart->add_to_cart(
                            intval($item['product_id']),
                            isset($item['quantity']) ? intval($item['quantity']) : 1,
                            isset($item['variation_id']) ? intval($item['variation_id']) : 0
                        );
                    }
                }
            }

            // Set customer shipping address
            $country = !empty($params['country']) ? $params['country'] : 'SE';
            $postcode = $params['postcode'];
            $city = !empty($params['city']) ? $params['city'] : '';
            $state = !empty($params['state']) ? $params['state'] : '';
            $address = !empty($params['address_1']) ? $params['address_1'] : '';

            WC()->customer->set_shipping_country($country);
            WC()->customer->set_shipping_postcode($postcode);
            WC()->customer->set_shipping_city($city);
            WC()->customer->set_shipping_state($state);
            WC()->customer->set_shipping_address($address);

            // Also set billing (some plugins need it)
            WC()->customer->set_billing_country($country);
            WC()->customer->set_billing_postcode($postcode);
            WC()->customer->set_billing_city($city);
            WC()->customer->set_billing_state($state);

            // Calculate shipping
            WC()->cart->calculate_shipping();
            WC()->cart->calculate_totals();

            // Get shipping packages
            $packages = WC()->shipping()->get_packages();
            $available_methods = [];

            // Collect all available shipping methods
            foreach ($packages as $package_key => $package) {
                if (isset($package['rates']) && !empty($package['rates'])) {
                    foreach ($package['rates'] as $rate_id => $rate) {
                        $available_methods[] = [
                            'id' => $rate_id,
                            'instance_id' => $rate->instance_id ?? 0,
                            'method_id' => $rate->method_id,
                            'method_title' => $rate->get_method_id(),
                            'title' => $rate->get_label(),
                            'enabled' => true,
                            'cost' => floatval($rate->cost),
                            'total_cost' => floatval($rate->cost + array_sum($rate->taxes)),
                            'label' => $rate->get_label(),
                        ];
                    }
                }
            }

            // Determine shipping zone
            $zone_name = 'Sweden';
            $zone_id = 0;
            $matched_zone_obj = null;

            // Try to match shipping zone
            $shipping_zones = WC_Shipping_Zones::get_zones();
            foreach ($shipping_zones as $zone) {
                $zone_obj = new WC_Shipping_Zone($zone['id']);

                // Check if postcode matches
                foreach ($zone_obj->get_zone_locations() as $location) {
                    if ($location->type === 'postcode') {
                        $postcode_range = $location->code;
                        // Simple wildcard matching
                        $pattern = str_replace('*', '.*', $postcode_range);
                        if (preg_match('/^' . $pattern . '/', $postcode)) {
                            $zone_name = $zone_obj->get_zone_name();
                            $zone_id = $zone_obj->get_id();
                            $matched_zone_obj = $zone_obj;
                            break 2;
                        }
                    }
                }
            }

            // If no specific zone found, check if Stockholm based on postcode
            if ($zone_id === 0 && !empty($postcode)) {
                $first_digit = substr($postcode, 0, 1);
                if ($first_digit === '1') {
                    $zone_name = 'Stockholm';
                }
            }

            // Get cart total for minimum amount check
            $cart_total = WC()->cart->get_subtotal();
            
            // DEBUG: Log what we received from WooCommerce
            error_log('MCP Shipping Debug:');
            error_log('Cart Total: ' . $cart_total);
            error_log('Zone ID: ' . $zone_id);
            error_log('Zone Name: ' . $zone_name);
            error_log('Methods from WooCommerce: ' . print_r($available_methods, true));
            
            // CRITICAL FIX: Check if zone actually offers free shipping
            $zone_has_free_shipping = false;
            if ($matched_zone_obj) {
                $zone_methods = $matched_zone_obj->get_shipping_methods(true); // true = enabled only
                foreach ($zone_methods as $method) {
                    if ($method->id === 'free_shipping' && $method->enabled === 'yes') {
                        $zone_has_free_shipping = true;
                        error_log('Zone HAS free shipping enabled');
                        break;
                    }
                }
            }
            
            if (!$zone_has_free_shipping) {
                error_log('Zone does NOT have free shipping enabled');
            }
            
            // STRICT CHECK: Verify if postcode is in Stockholm (100xx - 199xx)
            $is_stockholm = false;
            if (!empty($postcode)) {
                $normalized_postcode = preg_replace('/\s+/', '', $postcode);
                $prefix_num = intval(substr($normalized_postcode, 0, 3));
                if ($prefix_num >= 100 && $prefix_num <= 199) {
                    $is_stockholm = true;
                }
            }

            // GLOBAL FREE SHIPPING THRESHOLD (500 SEK)
            // Free shipping is ONLY available if:
            // 1. Cart total >= 500 SEK
            // 2. Customer's zone has free shipping enabled
            // 3. Customer is in Stockholm area (Strict enforcement)
            $free_shipping_threshold = 500;
            
            // Allow if strictly Stockholm AND threshold met AND zone enabled
            // OR if it's "Store Pickup" (local_pickup) which is always free
            if (($cart_total < $free_shipping_threshold) || !$zone_has_free_shipping || !$is_stockholm) {
                // Remove free shipping methods
                $available_methods = array_filter($available_methods, function($m) {
                    // Keep if not free shipping
                    if ($m['method_id'] !== 'free_shipping' && $m['cost'] > 0) {
                        return true;
                    }
                    // Keep local pickup (always free)
                    if ($m['method_id'] === 'local_pickup' || strpos($m['id'], 'local_pickup') !== false) {
                        return true;
                    }
                    // If it's free shipping, only keep if logic passes (which it doesn't here)
                    return false;
                });
                $available_methods = array_values($available_methods);
            } else {
                // Cart qualifies AND zone offers free shipping AND is Stockholm
                foreach ($available_methods as &$m) {
                    if ($m['method_id'] === 'free_shipping') {
                        $m['cost'] = 0;
                        $m['total_cost'] = 0;
                    }
                }
            }

            // Check for restricted products (if any plugins add restrictions)
            $restricted_products = [];
            $restrictions_applied = apply_filters('fourlines_mcp_shipping_restrictions', [], WC()->cart);

            if (!empty($restrictions_applied)) {
                foreach ($restrictions_applied as $restriction) {
                    $restricted_products[] = [
                        'product_id' => $restriction['product_id'] ?? 0,
                        'product_name' => $restriction['product_name'] ?? '',
                        'reason' => $restriction['reason'] ?? 'Shipping restricted',
                    ];
                }
            }

            // Clear cart after calculation
            WC()->cart->empty_cart();

            // Return response with debug info
            $debug = [
                'cart_total' => $cart_total,
                'available_methods' => $available_methods,
            ];
            return [
                'available_methods' => $available_methods,
                'zone' => [
                    'id' => $zone_id,
                    'name' => $zone_name,
                    'has_free_shipping' => $zone_has_free_shipping,
                ],
                'cart_total' => $cart_total,
                'restricted_products' => $restricted_products,
                'free_shipping_threshold' => $free_shipping_threshold,
                'free_shipping_available' => $cart_total >= $free_shipping_threshold && $zone_has_free_shipping && $is_stockholm,
                'amount_to_free_shipping' => max(0, $free_shipping_threshold - $cart_total),
                'debug' => $debug,
            ];

        } catch (Exception $e) {
            error_log('Fourlines MCP Shipping Error: ' . $e->getMessage());

            return new WP_Error(
                'shipping_calculation_failed',
                'Failed to calculate shipping: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }
}

// Initialize
Fourlines_MCP_Shipping_DHL::init();
