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
        $stored_key = get_option('fourlines_mcp_api_key');

        if (empty($api_key)) {
            return new WP_Error('missing_api_key','API key is required',['status' => 401]);
        }

        if ($api_key !== $stored_key) {
            return new WP_Error('invalid_api_key','Invalid API key',['status' => 401]);
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
                return new WP_Error('missing_params','Missing required parameter: postcode',['status' => 400]);
            }

            // Initialize WooCommerce if needed
            if (!function_exists('WC')) {
                return new WP_Error('woocommerce_not_active','WooCommerce is not active',['status' => 500]);
            }

            // RESTORED: Original Initialization Sequence
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

            // RESTORED: Original Billing Setting (Only non-address fields)
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

            // RESTORED: Manual Zone Matching (It actually checked free shipping status correctly)
            $zone_name = 'Sweden';
            $zone_id = 0;
            $matched_zone_obj = null;

            $shipping_zones = WC_Shipping_Zones::get_zones();
            foreach ($shipping_zones as $zone) {
                $zone_obj = new WC_Shipping_Zone($zone['id']);
                foreach ($zone_obj->get_zone_locations() as $location) {
                    if ($location->type === 'postcode') {
                        $postcode_range = $location->code;
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

            // If no specific zone found, check if Stockholm based on postcode (Legacy check)
            if ($zone_id === 0 && !empty($postcode)) {
                $first_digit = substr($postcode, 0, 1);
                if ($first_digit === '1') {
                    $zone_name = 'Stockholm';
                }
            }

            // Get cart total
            $cart_total = WC()->cart->get_subtotal();
            
            // Check if zone actually offers free shipping
            $zone_has_free_shipping = false;
            if ($matched_zone_obj) {
                $zone_methods = $matched_zone_obj->get_shipping_methods(true);
                foreach ($zone_methods as $method) {
                    if ($method->id === 'free_shipping' && $method->enabled === 'yes') {
                        $zone_has_free_shipping = true;
                        break;
                    }
                }
            }
            
            // --- STRICT FIX: STOCKHOLM CHECK ---
            $is_stockholm = false;
            // Clean postcode
            $normalized = preg_replace('/\s+/', '', $postcode);
            $prefix = intval(substr($normalized, 0, 3));
            if ($prefix >= 100 && $prefix <= 199) {
                $is_stockholm = true;
            }

            // GLOBAL FREE SHIPPING THRESHOLD (500 SEK)
            $free_shipping_threshold = 500;
            
            // FILTER: Remove free shipping if cart too low, zone disabled, OR NOT STOCKHOLM
            if ($cart_total < $free_shipping_threshold || !$zone_has_free_shipping || !$is_stockholm) {
                $available_methods = array_filter($available_methods, function($m) {
                    return $m['method_id'] !== 'free_shipping';
                });
                $available_methods = array_values($available_methods);
            } else {
                // Ensure zero cost
                foreach ($available_methods as &$m) {
                    if ($m['method_id'] === 'free_shipping') {
                        $m['cost'] = 0; $m['total_cost'] = 0;
                    }
                }
            }

            // Check for restricted products (Hooks based)
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

            WC()->cart->empty_cart();

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
            ];

        } catch (Exception $e) {
            return new WP_Error('shipping_calculation_failed', 'Failed to calculate shipping: ' . $e->getMessage(), ['status' => 500]);
        }
    }
}

Fourlines_MCP_Shipping_DHL::init();
