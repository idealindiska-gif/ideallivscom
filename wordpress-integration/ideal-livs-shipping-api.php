<?php
/*
Plugin Name: Ideal Indiska Livs Shipping Calculator API
Description: Custom REST API endpoints for headless WooCommerce shipping calculations with DHL eCommerce Sweden integration
Version: 1.0.0
Author: Ideal Indiska Livs
*/

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register REST API endpoints
 */
add_action('rest_api_init', function () {
    // Endpoint 1: Calculate shipping with DHL rates
    register_rest_route('ideal-livs/v1', '/shipping/calculate', array(
        'methods' => 'POST',
        'callback' => 'ideal_livs_calculate_shipping',
        'permission_callback' => '__return_true',
        'args' => array(
            'items' => array('required' => true, 'type' => 'array'),
            'postcode' => array('required' => true, 'type' => 'string'),
            'city' => array('required' => false, 'type' => 'string'),
            'country' => array('required' => false, 'type' => 'string', 'default' => 'SE'),
        ),
    ));

    // Endpoint 2: Get shipping zones
    register_rest_route('ideal-livs/v1', '/shipping/zones', array(
        'methods' => 'GET',
        'callback' => 'ideal_livs_get_shipping_zones',
        'permission_callback' => '__return_true',
    ));

    // Endpoint 3: Validate shipping
    register_rest_route('ideal-livs/v1', '/shipping/validate', array(
        'methods' => 'POST',
        'callback' => 'ideal_livs_validate_shipping',
        'permission_callback' => '__return_true',
    ));
});

/**
 * Main shipping calculation function with DHL integration
 */
function ideal_livs_calculate_shipping($request) {
    $params = $request->get_params();
    $items = $params['items'];
    $postcode = $params['postcode'];
    $city = isset($params['city']) ? $params['city'] : '';
    $country = isset($params['country']) ? $params['country'] : 'SE';

    try {
        // Check WooCommerce availability
        if (!function_exists('WC')) {
            return new WP_Error('wc_not_found', 'WooCommerce not found', array('status' => 500));
        }

        // Create virtual cart (save current cart)
        $saved_cart_contents = WC()->cart->get_cart_contents();
        WC()->cart->empty_cart();

        $cart_subtotal = 0;
        $cart_weight = 0;
        $restricted_products = array();
        $product_categories = array();

        // Add items to virtual cart
        foreach ($items as $item) {
            $product_id = $item['productId'];
            $quantity = $item['quantity'];
            $variation_id = isset($item['variationId']) ? $item['variationId'] : 0;

            $product = wc_get_product($variation_id ? $variation_id : $product_id);

            if (!$product) {
                continue;
            }

            // Add to cart
            WC()->cart->add_to_cart($product_id, $quantity, $variation_id);

            // Calculate totals
            $cart_subtotal += $product->get_price() * $quantity;

            // Get product weight (default to 0.5kg if not set)
            $product_weight = $product->get_weight() ? floatval($product->get_weight()) : 0.5;
            $cart_weight += $product_weight * $quantity;

            // Collect categories
            $terms = get_the_terms($product_id, 'product_cat');
            if ($terms && !is_wp_error($terms)) {
                foreach ($terms as $term) {
                    $product_categories[] = $term->slug;
                }
            }

            // Check restrictions (perishable items, etc.)
            $shipping_class = $product->get_shipping_class();
            $restriction = get_post_meta($product_id, '_shipping_restriction', true);

            if (ideal_livs_is_product_restricted($product, $postcode, $country, $shipping_class, $restriction)) {
                $restricted_products[] = array(
                    'product_id' => $product_id,
                    'product_name' => $product->get_name(),
                    'reason' => ideal_livs_get_restriction_reason($shipping_class, $restriction, $postcode, $country),
                );
            }
        }

        // Round weight to 1 decimal place
        $cart_weight = round($cart_weight, 1);

        // Check for restricted products
        if (!empty($restricted_products)) {
            // Restore original cart
            WC()->cart->empty_cart();
            foreach ($saved_cart_contents as $cart_item) {
                WC()->cart->add_to_cart(
                    $cart_item['product_id'],
                    $cart_item['quantity'],
                    $cart_item['variation_id'],
                    $cart_item['variation'],
                    $cart_item
                );
            }

            return array(
                'success' => false,
                'restricted_products' => $restricted_products,
                'available_methods' => array(),
            );
        }

        // Check minimum order requirement
        $minimum_order = 300; // SEK
        if ($cart_subtotal < $minimum_order) {
            // Restore original cart
            WC()->cart->empty_cart();
            foreach ($saved_cart_contents as $cart_item) {
                WC()->cart->add_to_cart(
                    $cart_item['product_id'],
                    $cart_item['quantity'],
                    $cart_item['variation_id'],
                    $cart_item['variation'],
                    $cart_item
                );
            }

            return array(
                'success' => false,
                'error' => 'minimum_order_not_met',
                'message' => sprintf('Minimum order value is %s SEK. Your cart total is %s SEK.', $minimum_order, $cart_subtotal),
                'minimum_order' => $minimum_order,
                'cart_subtotal' => $cart_subtotal,
                'amount_needed' => $minimum_order - $cart_subtotal,
                'available_methods' => array(),
            );
        }

        // Set customer location for shipping calculation
        WC()->customer->set_shipping_country($country);
        WC()->customer->set_shipping_postcode($postcode);
        WC()->customer->set_shipping_city($city);

        // Calculate shipping with DHL
        WC()->cart->calculate_totals();
        WC()->cart->calculate_shipping();

        // Get available shipping packages (DHL rates will be included)
        $packages = WC()->shipping()->get_packages();
        $available_methods = array();

        foreach ($packages as $package_key => $package) {
            $rates = $package['rates'];

            foreach ($rates as $rate_id => $rate) {
                $method_data = array(
                    'id' => $rate->get_id(),
                    'method_id' => $rate->get_method_id(),
                    'label' => $rate->get_label(),
                    'cost' => $rate->get_cost(),
                    'total_cost' => $rate->get_cost() + array_sum($rate->get_taxes()),
                    'tax' => array_sum($rate->get_taxes()),
                    'meta_data' => $rate->get_meta_data(),
                );

                $available_methods[] = $method_data;
            }
        }

        // Apply free shipping threshold
        $free_shipping_threshold = 500; // SEK
        
        // IMPORTANT: Filter out free shipping methods if cart doesn't qualify
        if ($cart_subtotal < $free_shipping_threshold) {
            // Remove any free shipping methods that WooCommerce might have returned
            $available_methods = array_filter($available_methods, function($method) {
                return $method['method_id'] !== 'free_shipping';
            });
            // Re-index array after filtering
            $available_methods = array_values($available_methods);
        } else {
            // Cart qualifies for free shipping
            $has_free_shipping = false;
            foreach ($available_methods as &$method) {
                if ($method['method_id'] === 'free_shipping') {
                    $has_free_shipping = true;
                    $method['cost'] = 0;
                    $method['total_cost'] = 0;
                }
            }

            // Add custom free shipping ONLY if in Stockholm area
            if (!$has_free_shipping && ideal_livs_is_stockholm_postcode($postcode)) {
                $available_methods[] = array(
                    'id' => 'free_shipping:custom',
                    'method_id' => 'free_shipping',
                    'label' => 'Free Shipping (Orders over 500 SEK)',
                    'cost' => 0,
                    'total_cost' => 0,
                    'tax' => 0,
                    'meta_data' => array(),
                );
            }
        }

        // Restore original cart
        WC()->cart->empty_cart();
        foreach ($saved_cart_contents as $cart_item) {
            WC()->cart->add_to_cart(
                $cart_item['product_id'],
                $cart_item['quantity'],
                $cart_item['variation_id'],
                $cart_item['variation'],
                $cart_item
            );
        }

        // Return results
        return array(
            'success' => true,
            'cart_subtotal' => $cart_subtotal,
            'cart_weight' => $cart_weight,
            'available_methods' => $available_methods,
            'restricted_products' => array(),
            'free_shipping_threshold' => $free_shipping_threshold,
            'free_shipping_available' => $cart_subtotal >= $free_shipping_threshold,
            'amount_to_free_shipping' => max(0, $free_shipping_threshold - $cart_subtotal),
            'minimum_order' => $minimum_order,
            'minimum_order_met' => $cart_subtotal >= $minimum_order,
        );

    } catch (Exception $e) {
        // Restore original cart on error
        if (isset($saved_cart_contents)) {
            WC()->cart->empty_cart();
            foreach ($saved_cart_contents as $cart_item) {
                WC()->cart->add_to_cart(
                    $cart_item['product_id'],
                    $cart_item['quantity'],
                    $cart_item['variation_id'],
                    $cart_item['variation'],
                    $cart_item
                );
            }
        }

        return new WP_Error('calculation_error', $e->getMessage(), array('status' => 500));
    }
}

/**
 * Get all shipping zones
 */
function ideal_livs_get_shipping_zones() {
    if (!class_exists('WC_Shipping_Zones')) {
        return new WP_Error('wc_not_found', 'WooCommerce Shipping not found', array('status' => 500));
    }

    $zones = WC_Shipping_Zones::get_zones();
    $formatted_zones = array();

    foreach ($zones as $zone) {
        $formatted_zones[] = array(
            'id' => $zone['id'],
            'zone_name' => $zone['zone_name'],
            'zone_locations' => $zone['zone_locations'],
            'shipping_methods' => $zone['shipping_methods'],
        );
    }

    return array(
        'success' => true,
        'zones' => $formatted_zones,
    );
}

/**
 * Validate shipping address and products
 */
function ideal_livs_validate_shipping($request) {
    $params = $request->get_params();

    // Call calculate shipping to validate
    $result = ideal_livs_calculate_shipping($request);

    if (is_wp_error($result)) {
        return $result;
    }

    return array(
        'success' => $result['success'],
        'valid' => $result['success'] && empty($result['restricted_products']),
        'restricted_products' => isset($result['restricted_products']) ? $result['restricted_products'] : array(),
        'minimum_order_met' => isset($result['minimum_order_met']) ? $result['minimum_order_met'] : false,
        'minimum_order_required' => isset($result['minimum_order']) ? $result['minimum_order'] : 300,
        'cart_subtotal' => isset($result['cart_subtotal']) ? $result['cart_subtotal'] : 0,
    );
}

/**
 * Check if product is restricted for delivery location
 */
function ideal_livs_is_product_restricted($product, $postcode, $country, $shipping_class, $restriction) {
    // Check category-based restrictions (perishable items might be restricted)
    $terms = get_the_terms($product->get_id(), 'product_cat');
    if ($terms && !is_wp_error($terms)) {
        foreach ($terms as $term) {
            // Example: Fresh produce might be Stockholm only
            if (in_array($term->slug, array('fresh-produce', 'perishable', 'frozen-foods'))) {
                if (!ideal_livs_is_stockholm_postcode($postcode)) {
                    return true;
                }
            }
        }
    }

    // Check shipping class restrictions
    if ($shipping_class === 'stockholm-only' && !ideal_livs_is_stockholm_postcode($postcode)) {
        return true;
    }

    // Check custom restriction meta
    if ($restriction === 'stockholm_only' && !ideal_livs_is_stockholm_postcode($postcode)) {
        return true;
    }

    if ($restriction === 'sweden_only' && $country !== 'SE') {
        return true;
    }

    return false;
}

/**
 * Check if postcode is in Stockholm area
 */
function ideal_livs_is_stockholm_postcode($postcode) {
    // Remove spaces and normalize
    $normalized = preg_replace('/\s+/', '', $postcode);
    $prefix = substr($normalized, 0, 3);

    if (strlen($prefix) < 3 || !is_numeric($prefix)) {
        return false;
    }

    $prefix_num = intval($prefix);

    // Stockholm postcodes: 100 00 - 199 99
    return $prefix_num >= 100 && $prefix_num <= 199;
}

/**
 * Get human-readable restriction reason
 */
function ideal_livs_get_restriction_reason($shipping_class, $restriction, $postcode, $country) {
    if ($shipping_class === 'stockholm-only' || $restriction === 'stockholm_only') {
        return 'This item can only be delivered within Stockholm area (postcodes 100 00 - 199 99)';
    }

    if ($restriction === 'sweden_only' && $country !== 'SE') {
        return 'This item can only be delivered within Sweden';
    }

    return 'This item cannot be delivered to your address';
}
