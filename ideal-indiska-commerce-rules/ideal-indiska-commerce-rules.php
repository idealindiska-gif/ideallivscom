<?php
/**
 * Plugin Name: Ideal Indiska – Commerce Rules
 * Description: Quantity limits, bulk pricing, and conditional shipping rules.
 * Version: 1.1.0
 * Author: Ideal Indiska
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/* ============================================================
   FEATURE FLAGS (easy on/off)
============================================================ */
define( 'IDEAL_ENABLE_QTY_LIMITS', true );
define( 'IDEAL_ENABLE_BULK_PRICING', true );
define( 'IDEAL_ENABLE_SHIPPING_RULES', true );


/* ============================================================
   CONFIGURATION
============================================================ */

/**
 * Product quantity limits
 */
define( 'IDEAL_PROMO_LIMITS', [
    215 => 4, // India Gate Sona Masoori Rice
] );

/**
 * Bulk pricing rules (per product)
 * product_id => [ qty, total_price ]
 */
define( 'IDEAL_BULK_PRICING', [
    // Shan – 2 for 18
    925 => [ 'qty' => 2, 'total' => 18 ],
    873 => [ 'qty' => 2, 'total' => 18 ],
    849 => [ 'qty' => 2, 'total' => 18 ],

    // National – 2 for 28
    845 => [ 'qty' => 2, 'total' => 28 ],
    418 => [ 'qty' => 2, 'total' => 28 ],
    414 => [ 'qty' => 2, 'total' => 28 ],
] );

/**
 * Shipping restrictions
 */
define( 'IDEAL_RESTRICTED_ZONES', [
    'Rest of Sweden',
    'Rest of the World',
] );

define( 'IDEAL_RESTRICTED_CATEGORIES', [
    'fresh-produce',
    'frozen-foods',
    'tradional-sweets',
] );

define( 'IDEAL_RESTRICTED_PRODUCT_IDS', [] );


/* ============================================================
   1️⃣ HARD QUANTITY LIMITS
============================================================ */
if ( IDEAL_ENABLE_QTY_LIMITS ) {

    // Enforce limits when calculating totals
    add_action( 'woocommerce_before_calculate_totals', function ( $cart ) {

        if ( is_admin() && ! defined( 'DOING_AJAX' ) ) return;
        if ( ! $cart ) return;

        foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {

            $pid = (int) $cart_item['product_id'];

            if ( isset( IDEAL_PROMO_LIMITS[ $pid ] ) ) {
                $max = IDEAL_PROMO_LIMITS[ $pid ];

                if ( $cart_item['quantity'] > $max ) {
                    // FIXED: Use set_quantity() to actually update the cart
                    $cart->set_quantity( $cart_item_key, $max );

                    wc_add_notice(
                        sprintf(
                            '⚠️ Quantity adjusted to maximum limit: %d units for this product.',
                            $max
                        ),
                        'notice'
                    );
                }
            }
        }
    }, 20 );

    // Block adding more than max via Add to Cart
    add_filter( 'woocommerce_add_to_cart_validation', function( $passed, $product_id, $quantity ) {

        if ( isset( IDEAL_PROMO_LIMITS[ $product_id ] ) ) {
            $max = IDEAL_PROMO_LIMITS[ $product_id ];

            // Check existing quantity in cart
            $cart = WC()->cart;
            if ( $cart ) {
                foreach ( $cart->get_cart() as $cart_item ) {
                    if ( $cart_item['product_id'] == $product_id ) {
                        $quantity += $cart_item['quantity'];
                        break;
                    }
                }
            }

            if ( $quantity > $max ) {
                wc_add_notice(
                    sprintf(
                        'Cannot add to cart. Maximum %d units allowed for this product.',
                        $max
                    ),
                    'error'
                );
                return false;
            }
        }

        return $passed;

    }, 10, 3 );

    // Set max quantity on product page
    add_filter( 'woocommerce_quantity_input_max', function( $max, $product ) {

        $pid = $product->get_id();

        if ( isset( IDEAL_PROMO_LIMITS[ $pid ] ) ) {
            return IDEAL_PROMO_LIMITS[ $pid ];
        }

        return $max;

    }, 10, 2 );
}


/* ============================================================
   2️⃣ BULK PRICING (Buy-X logic – CLEAN & SAFE)
============================================================ */
if ( IDEAL_ENABLE_BULK_PRICING ) {

    add_action( 'woocommerce_before_calculate_totals', function ( $cart ) {

        if ( is_admin() && ! defined( 'DOING_AJAX' ) ) return;
        if ( ! $cart ) return;

        foreach ( $cart->get_cart() as $cart_item ) {

            $pid = (int) $cart_item['product_id'];
            $qty = (int) $cart_item['quantity'];

            if ( isset( IDEAL_BULK_PRICING[ $pid ] ) ) {

                $rule = IDEAL_BULK_PRICING[ $pid ];

                if ( $qty >= $rule['qty'] ) {
                    $unit_price = round( $rule['total'] / $rule['qty'], 2 );
                    $cart_item['data']->set_price( $unit_price );
                }
            }
        }
    }, 30 );
}


/* ============================================================
   3️⃣ CONDITIONAL SHIPPING RULES
============================================================ */
if ( IDEAL_ENABLE_SHIPPING_RULES ) {

    add_filter( 'woocommerce_package_rates', function ( $rates, $package ) {

        $zone = WC_Shipping_Zones::get_zone_matching_package( $package );
        $zone_name = $zone ? $zone->get_zone_name() : '';

        if ( in_array(
            strtolower( $zone_name ),
            array_map( 'strtolower', IDEAL_RESTRICTED_ZONES ),
            true
        ) ) {

            foreach ( $package['contents'] as $item ) {

                $pid = (int) $item['product_id'];

                if (
                    has_term( IDEAL_RESTRICTED_CATEGORIES, 'product_cat', $pid ) ||
                    in_array( $pid, IDEAL_RESTRICTED_PRODUCT_IDS, true )
                ) {
                    wc_add_notice(
                        'Perishable items are only available for delivery within Stockholm.
If you believe you’re in the wrong zone, please contact us via the chat button.',
                        'error'
                    );

                    return [];
                }
            }
        }

        return $rates;

    }, 100, 2 );
}
