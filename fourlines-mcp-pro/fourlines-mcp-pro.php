<?php
/**
 * Plugin Name: Fourlines MCP Pro
 * Plugin URI: https://fourlines.com
 * Description: Model Context Protocol integration for WooCommerce - exposes shipping, products, and orders via REST API
 * Version: 1.0.0
 * Author: Fourlines
 * Author URI: https://fourlines.com
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 * Text Domain: fourlines-mcp-pro
 * Domain Path: /languages
 */

defined('ABSPATH') || exit;

// Define plugin constants
define('FOURLINES_MCP_VERSION', '1.0.0');
define('FOURLINES_MCP_PLUGIN_FILE', __FILE__);
define('FOURLINES_MCP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FOURLINES_MCP_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Check if WooCommerce is active
 */
function fourlines_mcp_check_woocommerce() {
    if (!class_exists('WooCommerce')) {
        add_action('admin_notices', function() {
            echo '<div class="error"><p>';
            echo '<strong>Fourlines MCP Pro</strong> requires WooCommerce to be installed and active.';
            echo '</p></div>';
        });
        return false;
    }
    return true;
}

/**
 * Frontend domain for headless setup
 * Change this to match your frontend domain
 */
define('FOURLINES_FRONTEND_URL', 'https://www.ideallivs.com');

/**
 * Initialize the plugin
 */
function fourlines_mcp_init() {
    // Check for WooCommerce
    if (!fourlines_mcp_check_woocommerce()) {
        return;
    }

    // Load shipping integrations
    require_once FOURLINES_MCP_PLUGIN_DIR . 'includes/class-shipping-general.php';
    require_once FOURLINES_MCP_PLUGIN_DIR . 'includes/class-shipping-dhl.php';

    // Initialize admin settings if needed
    if (is_admin()) {
        add_action('admin_menu', 'fourlines_mcp_add_admin_menu');
        add_action('admin_init', 'fourlines_mcp_register_settings');
    }

    // Initialize headless checkout URL redirects
    fourlines_mcp_init_headless_checkout();
}

/**
 * Initialize headless checkout URL redirects
 * Redirects payment URLs from the WooCommerce backend to the Next.js frontend
 */
function fourlines_mcp_init_headless_checkout() {
    // Redirect "Pay for Order" URLs to frontend
    // Original: /checkout/order-pay/123/?pay_for_order=true&key=wc_order_xxx
    // Redirected to: https://ideallivs.com/checkout/order-pay/123?pay_for_order=true&key=wc_order_xxx
    add_filter('woocommerce_get_checkout_payment_url', 'fourlines_mcp_redirect_payment_url', 10, 2);
    
    // Redirect "Order Received" (Thank You) page URLs to frontend
    add_filter('woocommerce_get_checkout_order_received_url', 'fourlines_mcp_redirect_order_received_url', 10, 2);
    
    // Redirect checkout page URL to frontend
    add_filter('woocommerce_get_checkout_url', 'fourlines_mcp_redirect_checkout_url', 10, 1);
}

/**
 * Redirect payment URL to frontend
 * 
 * @param string $url The original payment URL
 * @param WC_Order $order The order object
 * @return string The modified URL pointing to frontend
 */
function fourlines_mcp_redirect_payment_url($url, $order) {
    $frontend_url = FOURLINES_FRONTEND_URL;
    $backend_url = home_url();
    
    // Replace backend domain with frontend domain
    if (strpos($url, $backend_url) !== false) {
        $url = str_replace($backend_url, $frontend_url, $url);
    }
    
    // Also handle the URL structure: WooCommerce uses /checkout/order-pay/ID/
    // Make sure it works with Next.js routing
    // The trailing slash might cause issues, so normalize the URL
    $url = preg_replace('#/checkout/order-pay/(\d+)/?#', '/checkout/order-pay/$1', $url);
    
    return $url;
}

/**
 * Redirect order received URL to frontend
 * 
 * @param string $url The original order received URL
 * @param WC_Order $order The order object
 * @return string The modified URL pointing to frontend
 */
function fourlines_mcp_redirect_order_received_url($url, $order) {
    $frontend_url = FOURLINES_FRONTEND_URL;
    $backend_url = home_url();
    
    // Replace backend domain with frontend domain
    if (strpos($url, $backend_url) !== false) {
        $url = str_replace($backend_url, $frontend_url, $url);
    }
    
    // Redirect to the frontend success page format
    // Original: /checkout/order-received/123/?key=wc_order_xxx
    // Frontend: /checkout/success?order=123&key=wc_order_xxx
    if (preg_match('#/checkout/order-received/(\d+)/?\?key=([^&]+)#', $url, $matches)) {
        $order_id = $matches[1];
        $order_key = $matches[2];
        $url = $frontend_url . '/checkout/success?order=' . $order_id . '&key=' . $order_key;
    }
    
    return $url;
}

/**
 * Redirect main checkout URL to frontend
 * 
 * @param string $url The original checkout URL
 * @return string The modified URL pointing to frontend
 */
function fourlines_mcp_redirect_checkout_url($url) {
    $frontend_url = FOURLINES_FRONTEND_URL;
    $backend_url = home_url();
    
    // Replace backend domain with frontend domain
    if (strpos($url, $backend_url) !== false) {
        $url = str_replace($backend_url, $frontend_url, $url);
    }
    
    return $url;
}
add_action('plugins_loaded', 'fourlines_mcp_init');

/**
 * Add admin menu
 */
function fourlines_mcp_add_admin_menu() {
    add_submenu_page(
        'woocommerce',
        'Fourlines MCP Settings',
        'Fourlines MCP',
        'manage_woocommerce',
        'fourlines-mcp-settings',
        'fourlines_mcp_settings_page'
    );
}

/**
 * Register settings
 */
function fourlines_mcp_register_settings() {
    register_setting('fourlines_mcp_settings', 'fourlines_mcp_api_key');
}

/**
 * Settings page
 */
function fourlines_mcp_settings_page() {
    ?>
    <div class="wrap">
        <h1>Fourlines MCP Settings</h1>

        <?php
        // Generate new API key if requested
        if (isset($_POST['generate_api_key']) && check_admin_referer('fourlines_mcp_generate_key')) {
            $new_key = 'fmcp_' . bin2hex(random_bytes(32));
            update_option('fourlines_mcp_api_key', $new_key);
            echo '<div class="notice notice-success"><p>New API key generated successfully!</p></div>';
        }
        ?>

        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>API Key</h2>
            <p>Use this API key in your Next.js application to authenticate MCP API requests.</p>

            <?php
            $current_key = get_option('fourlines_mcp_api_key');

            if (empty($current_key)) {
                echo '<p><strong>No API key generated yet.</strong></p>';
            } else {
                echo '<div style="background: #f0f0f1; padding: 15px; margin: 15px 0; border-radius: 4px; font-family: monospace;">';
                echo esc_html($current_key);
                echo '</div>';

                echo '<p style="color: #d63638;"><strong>⚠️ Important:</strong> Keep this key secure. Anyone with this key can access your API endpoints.</p>';
            }
            ?>

            <form method="post" style="margin-top: 20px;">
                <?php wp_nonce_field('fourlines_mcp_generate_key'); ?>
                <button type="submit" name="generate_api_key" class="button button-primary">
                    <?php echo empty($current_key) ? 'Generate API Key' : 'Regenerate API Key'; ?>
                </button>
            </form>

            <hr style="margin: 30px 0;">

            <h3>Environment Variable for Next.js</h3>
            <p>Add this to your <code>.env.local</code> file:</p>
            <div style="background: #2c3338; color: #f0f0f1; padding: 15px; border-radius: 4px; font-family: monospace;">
                FOURLINES_MCP_KEY=<?php echo esc_html($current_key ?: 'your_api_key_here'); ?>
            </div>
        </div>

        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>Available Endpoints</h2>

            <h3>Shipping Zones</h3>
            <ul>
                <li><code>GET /wp-json/fourlines-mcp/v1/shipping/zones</code> - Get all shipping zones</li>
                <li><code>GET /wp-json/fourlines-mcp/v1/shipping/zones/{id}</code> - Get specific zone</li>
                <li><code>GET /wp-json/fourlines-mcp/v1/shipping/zones/{id}/methods</code> - Get zone methods</li>
                <li><code>GET /wp-json/fourlines-mcp/v1/shipping/methods</code> - Get all methods</li>
            </ul>

            <h3>Shipping Calculation</h3>
            <ul>
                <li><code>POST /wp-json/fourlines-mcp/v1/shipping/calculate</code> - Calculate shipping costs</li>
            </ul>

            <h4>Example Request:</h4>
            <pre style="background: #f0f0f1; padding: 15px; border-radius: 4px; overflow-x: auto;">
curl -X POST <?php echo esc_url(rest_url('fourlines-mcp/v1/shipping/calculate')); ?> \
  -H "X-Fourlines-Key: <?php echo esc_html($current_key ?: 'your_api_key'); ?>" \
  -H "Content-Type: application/json" \
  -d '{
    "postcode": "11122",
    "city": "Stockholm",
    "country": "SE",
    "items": [
      {"product_id": 123, "quantity": 2}
    ]
  }'
            </pre>
        </div>

        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>Plugin Status</h2>

            <?php
            // Check DHL plugin
            $dhl_active = class_exists('DHL_ECOM_SE_MODEL_DHL');
            echo '<p><strong>DHL eCom Sweden:</strong> ';
            if ($dhl_active) {
                echo '<span style="color: #00a32a;">✓ Active</span>';
            } else {
                echo '<span style="color: #d63638;">✗ Not Active</span>';
            }
            echo '</p>';

            // Check WooCommerce Shipping
            echo '<p><strong>WooCommerce Shipping:</strong> ';
            if (class_exists('WC_Shipping_Zones')) {
                $zones = WC_Shipping_Zones::get_zones();
                echo '<span style="color: #00a32a;">✓ ' . count($zones) . ' zones configured</span>';
            } else {
                echo '<span style="color: #d63638;">✗ Not Available</span>';
            }
            echo '</p>';

            // Check Stripe
            $stripe_active = class_exists('WC_Stripe');
            echo '<p><strong>WooCommerce Stripe:</strong> ';
            if ($stripe_active) {
                echo '<span style="color: #00a32a;">✓ Active</span>';
            } else {
                echo '<span style="color: #2271b1;">ℹ Stripe handled by Next.js</span>';
            }
            echo '</p>';
            ?>
        </div>
    </div>
    <?php
}

/**
 * Activation hook
 */
function fourlines_mcp_activate() {
    // Generate API key on activation if not exists
    if (empty(get_option('fourlines_mcp_api_key'))) {
        $api_key = 'fmcp_' . bin2hex(random_bytes(32));
        update_option('fourlines_mcp_api_key', $api_key);
    }

    // Flush rewrite rules
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'fourlines_mcp_activate');

/**
 * Deactivation hook
 */
function fourlines_mcp_deactivate() {
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'fourlines_mcp_deactivate');
