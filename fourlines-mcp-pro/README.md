# Fourlines MCP Pro WordPress Plugin

A WordPress plugin that exposes WooCommerce shipping, DHL integration, and other features via REST API for headless Next.js implementations.

## 📦 What's Included

This plugin provides REST API endpoints for:
- ✅ **Shipping Zones** - Get all WooCommerce shipping zones
- ✅ **Shipping Methods** - Get available shipping methods
- ✅ **Shipping Calculation** - Calculate real-time shipping costs with DHL integration
- ✅ **DHL eCom Sweden Integration** - Automatic integration with DHL plugin if active

## 🚀 Installation

### Method 1: Upload via WordPress Admin

1. **Zip the plugin folder:**
   ```bash
   cd "D:\Visual codes\grocery-template"
   zip -r fourlines-mcp-pro.zip fourlines-mcp-pro/ -x "*.md" "*.git*"
   ```

2. **Upload to WordPress:**
   - Go to WordPress Admin → Plugins → Add New
   - Click "Upload Plugin"
   - Choose `fourlines-mcp-pro.zip`
   - Click "Install Now"
   - Click "Activate"

### Method 2: Manual Installation

1. **Copy plugin to WordPress:**
   ```bash
   cp -r fourlines-mcp-pro /path/to/wordpress/wp-content/plugins/
   ```

2. **Activate:**
   - Go to WordPress Admin → Plugins
   - Find "Fourlines MCP Pro"
   - Click "Activate"

## ⚙️ Configuration

### 1. Generate API Key

After activation:
1. Go to **WooCommerce → Fourlines MCP**
2. Click **"Generate API Key"**
3. Copy the generated key
4. **IMPORTANT:** Keep this key secure!

### 2. Add to Next.js Environment

Add to your `.env.local`:
```env
FOURLINES_MCP_KEY=fmcp_your_generated_key_here
```

### 3. Verify Setup

The plugin settings page shows:
- ✅ DHL plugin status
- ✅ Number of shipping zones configured
- ✅ Stripe status
- 📋 Available endpoints
- 💻 Example curl commands

## 🔌 API Endpoints

All endpoints require authentication via `X-Fourlines-Key` header.

### Shipping Zones

```bash
# Get all zones
GET /wp-json/fourlines-mcp/v1/shipping/zones

# Get specific zone
GET /wp-json/fourlines-mcp/v1/shipping/zones/{id}

# Get zone methods
GET /wp-json/fourlines-mcp/v1/shipping/zones/{id}/methods
```

### Shipping Methods

```bash
# Get all available methods
GET /wp-json/fourlines-mcp/v1/shipping/methods
```

### Calculate Shipping (Most Important!)

```bash
POST /wp-json/fourlines-mcp/v1/shipping/calculate
Content-Type: application/json
X-Fourlines-Key: fmcp_your_key

{
  "postcode": "11122",
  "city": "Stockholm",
  "country": "SE",
  "items": [
    {
      "product_id": 123,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "available_methods": [
    {
      "id": "flat_rate:1",
      "method_id": "flat_rate",
      "title": "Flat Rate",
      "cost": 49.00,
      "total_cost": 49.00
    },
    {
      "id": "dhl_servicepoint",
      "method_id": "dhl_servicepoint",
      "title": "DHL - Service Point",
      "cost": 49.00,
      "total_cost": 49.00
    }
  ],
  "zone": {
    "id": 1,
    "name": "Stockholm"
  },
  "cart_total": 500.00,
  "restricted_products": []
}
```

## 🧪 Testing

### Test Shipping Calculation

```bash
curl -X POST https://your-site.com/wp-json/fourlines-mcp/v1/shipping/calculate \
  -H "X-Fourlines-Key: fmcp_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "postcode": "11122",
    "city": "Stockholm",
    "country": "SE",
    "items": [{"product_id": 123, "quantity": 2}]
  }'
```

### Test Zones

```bash
curl https://your-site.com/wp-json/fourlines-mcp/v1/shipping/zones \
  -H "X-Fourlines-Key: fmcp_your_key"
```

## 🔧 Requirements

- **WordPress:** 6.0+
- **PHP:** 7.4+
- **WooCommerce:** 8.0+ (must be active)
- **DHL eCom Sweden:** Optional (for DHL shipping rates)

## 🎯 How It Works

### With DHL Plugin Active:

1. Customer enters address in Next.js checkout
2. Next.js calls `/shipping/calculate` endpoint
3. Plugin uses WooCommerce shipping calculation
4. If DHL plugin is active, DHL rates are included automatically
5. Returns all available methods with real-time costs
6. Next.js displays options to customer

### Without DHL Plugin:

- Returns standard WooCommerce shipping methods
- Flat rate, free shipping, local pickup, etc.
- Still fully functional!

## 📁 Plugin Structure

```
fourlines-mcp-pro/
├── fourlines-mcp-pro.php          # Main plugin file
├── includes/
│   ├── class-shipping-general.php # WooCommerce zones/methods
│   └── class-shipping-dhl.php     # Shipping calculation
├── assets/                         # Plugin assets
├── languages/                      # Translation files
└── README.md                       # This file
```

## 🐛 Troubleshooting

### "No shipping methods available"

**Check:**
1. ✅ DHL plugin is activated (if using DHL)
2. ✅ WooCommerce shipping zones are configured
3. ✅ Products have weights set (required for DHL)
4. ✅ Store address is configured in WooCommerce
5. ✅ API key is correct

**Debug:**
```bash
# Check WordPress debug.log
tail -f /path/to/wordpress/wp-content/debug.log

# Enable WordPress debugging in wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

### "Invalid API key"

**Solutions:**
1. Regenerate key in plugin settings
2. Update `.env.local` in Next.js
3. Restart Next.js dev server
4. Check for extra spaces in env var

### "DHL rates not showing"

**Check:**
1. DHL plugin shows as "Active" in plugin settings
2. Products have weights (kg) set
3. DHL API key is configured in DHL plugin settings
4. Test address is valid (Stockholm 11122, etc.)

## 🔒 Security

- ✅ API key authentication required
- ✅ Nonce verification for admin actions
- ✅ Capability checks (manage_woocommerce)
- ✅ Input sanitization and validation
- ✅ Output escaping
- ⚠️ **Keep API key secure** - treat like a password!

## 📝 Changelog

### Version 1.0.0 (2025-12-17)
- Initial release
- Shipping zones API
- Shipping methods API
- Shipping calculation with DHL integration
- Admin settings page with API key management
- Plugin status dashboard

## 🆘 Support

For issues or questions:
1. Check this README
2. Review documentation in guides folder
3. Check WordPress debug.log
4. Test endpoints with curl commands
5. Verify plugin status in settings page

## 📄 License

This plugin is proprietary software for use with Fourlines applications.

---

**Plugin Version:** 1.0.0
**Requires WordPress:** 6.0+
**Requires WooCommerce:** 8.0+
**Tested up to:** WordPress 6.9, WooCommerce 10.4
