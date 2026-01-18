<?php
/**
 * Debug script to check free shipping configuration
 * 
 * Upload this to your WordPress root and access it via:
 * https://crm.ideallivs.com/debug-shipping.php
 * 
 * Then delete it after debugging
 */

// Load WordPress
require_once('wp-load.php');

if (!function_exists('WC')) {
    die('WooCommerce is not active');
}

echo "<h1>Free Shipping Debug Report</h1>";
echo "<pre>";

// 1. Check all shipping zones
echo "\n=== SHIPPING ZONES ===\n";
$zones = WC_Shipping_Zones::get_zones();
foreach ($zones as $zone) {
    echo "\nZone ID: " . $zone['id'] . "\n";
    echo "Zone Name: " . $zone['zone_name'] . "\n";
    echo "Zone Locations:\n";
    print_r($zone['zone_locations']);
    
    echo "\nShipping Methods in this zone:\n";
    $zone_obj = new WC_Shipping_Zone($zone['id']);
    $methods = $zone_obj->get_shipping_methods(true); // true = enabled only
    
    foreach ($methods as $method) {
        echo "  - Method ID: " . $method->id . "\n";
        echo "    Instance ID: " . $method->instance_id . "\n";
        echo "    Title: " . $method->title . "\n";
        echo "    Enabled: " . ($method->enabled === 'yes' ? 'YES' : 'NO') . "\n";
        
        if ($method->id === 'free_shipping') {
            echo "    FREE SHIPPING SETTINGS:\n";
            $settings = $method->instance_settings;
            echo "      Min Amount: " . ($settings['min_amount'] ?? 'Not set') . "\n";
            echo "      Requires: " . ($settings['requires'] ?? 'Not set') . "\n";
            echo "      All Settings:\n";
            print_r($settings);
        }
        echo "\n";
    }
}

// 2. Test calculation with sample cart
echo "\n=== TEST CALCULATION (600 SEK cart) ===\n";

// Clear cart
WC()->cart->empty_cart();

// Add a test product (you'll need to replace with a real product ID)
// Get any product
$products = wc_get_products(['limit' => 1, 'status' => 'publish']);
if (!empty($products)) {
    $product = $products[0];
    echo "Adding product: " . $product->get_name() . " (ID: " . $product->get_id() . ")\n";
    
    // Add enough quantity to reach 600 SEK
    $price = $product->get_price();
    $quantity = $price > 0 ? ceil(600 / $price) : 1;
    
    WC()->cart->add_to_cart($product->get_id(), $quantity);
    
    // Set shipping address to Stockholm
    WC()->customer->set_shipping_country('SE');
    WC()->customer->set_shipping_postcode('11122');
    WC()->customer->set_shipping_city('Stockholm');
    
    // Calculate shipping
    WC()->cart->calculate_shipping();
    WC()->cart->calculate_totals();
    
    $cart_total = WC()->cart->get_subtotal();
    echo "\nCart Total: " . $cart_total . " SEK\n";
    echo "Should qualify for free shipping: " . ($cart_total >= 500 ? 'YES' : 'NO') . "\n";
    
    echo "\nAvailable shipping methods:\n";
    $packages = WC()->shipping()->get_packages();
    foreach ($packages as $package_key => $package) {
        if (isset($package['rates']) && !empty($package['rates'])) {
            foreach ($package['rates'] as $rate_id => $rate) {
                echo "  - ID: " . $rate_id . "\n";
                echo "    Method ID: " . $rate->method_id . "\n";
                echo "    Label: " . $rate->get_label() . "\n";
                echo "    Cost: " . $rate->cost . " SEK\n";
                echo "\n";
            }
        } else {
            echo "  No shipping methods found!\n";
        }
    }
    
    // Clear cart
    WC()->cart->empty_cart();
} else {
    echo "No products found to test with.\n";
}

echo "</pre>";
echo "<hr>";
echo "<p><strong>Next Steps:</strong></p>";
echo "<ol>";
echo "<li>Check if any shipping zones have 'free_shipping' method enabled</li>";
echo "<li>Check if free shipping has a minimum amount requirement set</li>";
echo "<li>Verify that Stockholm postcodes (111*) are covered by a shipping zone</li>";
echo "<li><strong>DELETE THIS FILE after debugging!</strong></li>";
echo "</ol>";
