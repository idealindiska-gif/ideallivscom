<?php
/**
 * General Shipping Zones & Methods for Fourlines MCP
 *
 * Exposes WooCommerce shipping zones and methods via REST API
 */

defined('ABSPATH') || exit;

class Fourlines_MCP_Shipping_General {

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
        // Get all shipping zones
        register_rest_route('fourlines-mcp/v1', '/shipping/zones', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_shipping_zones'],
            'permission_callback' => [__CLASS__, 'check_api_key'],
        ]);

        // Get specific zone
        register_rest_route('fourlines-mcp/v1', '/shipping/zones/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_shipping_zone'],
            'permission_callback' => [__CLASS__, 'check_api_key'],
            'args' => [
                'id' => [
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric($param);
                    }
                ],
            ],
        ]);

        // Get methods for a zone
        register_rest_route('fourlines-mcp/v1', '/shipping/zones/(?P<id>\d+)/methods', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_zone_methods'],
            'permission_callback' => [__CLASS__, 'check_api_key'],
            'args' => [
                'id' => [
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric($param);
                    }
                ],
            ],
        ]);

        // Get all available shipping methods
        register_rest_route('fourlines-mcp/v1', '/shipping/methods', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_shipping_methods'],
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
     * Get all shipping zones
     */
    public static function get_shipping_zones($request) {
        try {
            if (!class_exists('WC_Shipping_Zones')) {
                return new WP_Error(
                    'woocommerce_not_active',
                    'WooCommerce is not active',
                    ['status' => 500]
                );
            }

            $zones_data = [];
            $zones = WC_Shipping_Zones::get_zones();

            foreach ($zones as $zone) {
                $zone_obj = new WC_Shipping_Zone($zone['id']);

                $zones_data[] = [
                    'id' => $zone_obj->get_id(),
                    'name' => $zone_obj->get_zone_name(),
                    'order' => $zone_obj->get_zone_order(),
                    'locations' => self::format_zone_locations($zone_obj->get_zone_locations()),
                ];
            }

            // Add "Rest of the World" zone (zone 0)
            $rest_of_world = new WC_Shipping_Zone(0);
            $zones_data[] = [
                'id' => 0,
                'name' => $rest_of_world->get_zone_name(),
                'order' => 999,
                'locations' => [],
            ];

            return [
                'zones' => $zones_data,
            ];

        } catch (Exception $e) {
            error_log('Fourlines MCP Shipping Zones Error: ' . $e->getMessage());

            return new WP_Error(
                'zones_fetch_failed',
                'Failed to fetch shipping zones: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get specific shipping zone
     */
    public static function get_shipping_zone($request) {
        try {
            $zone_id = $request->get_param('id');

            if (!class_exists('WC_Shipping_Zone')) {
                return new WP_Error(
                    'woocommerce_not_active',
                    'WooCommerce is not active',
                    ['status' => 500]
                );
            }

            $zone_obj = new WC_Shipping_Zone($zone_id);

            if (!$zone_obj->get_id() && $zone_id !== 0) {
                return new WP_Error(
                    'zone_not_found',
                    'Shipping zone not found',
                    ['status' => 404]
                );
            }

            return [
                'id' => $zone_obj->get_id(),
                'name' => $zone_obj->get_zone_name(),
                'order' => $zone_obj->get_zone_order(),
                'locations' => self::format_zone_locations($zone_obj->get_zone_locations()),
            ];

        } catch (Exception $e) {
            error_log('Fourlines MCP Shipping Zone Error: ' . $e->getMessage());

            return new WP_Error(
                'zone_fetch_failed',
                'Failed to fetch shipping zone: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get shipping methods for a zone
     */
    public static function get_zone_methods($request) {
        try {
            $zone_id = $request->get_param('id');

            if (!class_exists('WC_Shipping_Zone')) {
                return new WP_Error(
                    'woocommerce_not_active',
                    'WooCommerce is not active',
                    ['status' => 500]
                );
            }

            $zone_obj = new WC_Shipping_Zone($zone_id);
            $methods = $zone_obj->get_shipping_methods(true); // true = enabled only

            $methods_data = [];

            foreach ($methods as $method) {
                $methods_data[] = [
                    'id' => $method->id . ':' . $method->instance_id,
                    'instance_id' => $method->instance_id,
                    'method_id' => $method->id,
                    'method_title' => $method->method_title,
                    'title' => $method->title,
                    'enabled' => $method->enabled === 'yes',
                    'settings' => $method->instance_settings,
                ];
            }

            return [
                'methods' => $methods_data,
            ];

        } catch (Exception $e) {
            error_log('Fourlines MCP Zone Methods Error: ' . $e->getMessage());

            return new WP_Error(
                'methods_fetch_failed',
                'Failed to fetch zone methods: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Get all available shipping methods
     */
    public static function get_shipping_methods($request) {
        try {
            if (!function_exists('WC')) {
                return new WP_Error(
                    'woocommerce_not_active',
                    'WooCommerce is not active',
                    ['status' => 500]
                );
            }

            $shipping_methods = WC()->shipping()->get_shipping_methods();
            $methods_data = [];

            foreach ($shipping_methods as $method_id => $method) {
                $methods_data[] = [
                    'id' => $method_id,
                    'method_id' => $method_id,
                    'method_title' => $method->method_title,
                    'title' => $method->title ?? $method->method_title,
                    'enabled' => $method->enabled === 'yes',
                ];
            }

            return [
                'methods' => $methods_data,
            ];

        } catch (Exception $e) {
            error_log('Fourlines MCP Shipping Methods Error: ' . $e->getMessage());

            return new WP_Error(
                'methods_fetch_failed',
                'Failed to fetch shipping methods: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }

    /**
     * Format zone locations for API response
     */
    private static function format_zone_locations($locations) {
        $formatted = [];

        foreach ($locations as $location) {
            $formatted[] = [
                'code' => $location->code,
                'type' => $location->type,
            ];
        }

        return $formatted;
    }
}

// Initialize
Fourlines_MCP_Shipping_General::init();
