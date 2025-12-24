/**
 * Commerce Rules Configuration
 * Mirrors the backend WordPress plugin rules for frontend validation
 * Source: ideal-indiska-commerce-rules/ideal-indiska-commerce-rules.php
 */

export interface QuantityLimit {
  productId: number;
  maxQuantity: number;
}

export interface BulkPricingRule {
  productId: number;
  requiredQuantity: number;
  totalPrice: number;
}

export interface ShippingRestriction {
  restrictedZones: string[];
  restrictedCategories: string[];
  restrictedProductIds: number[];
}

/**
 * Product quantity limits
 * These products have maximum purchase limits per order
 * UPDATED: 2025-05-24 to match WordPress plugin
 */
export const QUANTITY_LIMITS: QuantityLimit[] = [
  { productId: 215, maxQuantity: 3 },   // India Gate Sona Masoori Rice (changed from 4 to 3)
  { productId: 193, maxQuantity: 2 },   // Product ID 193 (NEW)
  { productId: 4943, maxQuantity: 3 },  // Product ID 4943 (NEW)
];

/**
 * Bulk pricing rules
 * Products with special pricing when buying multiple units
 * UPDATED: 2025-05-24 - Removed Shan and National promotions
 */
export const BULK_PRICING_RULES: BulkPricingRule[] = [
  // Bulk pricing promotions removed for Shan and National products
  // Add new bulk pricing rules here if needed
];

/**
 * Shipping restrictions
 * Perishable items cannot be shipped to certain zones
 */
export const SHIPPING_RESTRICTIONS: ShippingRestriction = {
  restrictedZones: [
    'Rest of Sweden',
    'Rest of the World',
  ],
  restrictedCategories: [
    'fresh-produce',
    'frozen-foods',
    'tradional-sweets', // Note: Matches backend typo
  ],
  restrictedProductIds: [],
};

/**
 * Helper functions for rule validation
 */
export const CommerceRules = {
  /**
   * Get quantity limit for a product
   */
  getQuantityLimit(productId: number): number | null {
    const limit = QUANTITY_LIMITS.find(l => l.productId === productId);
    return limit ? limit.maxQuantity : null;
  },

  /**
   * Check if adding quantity would exceed limit
   */
  canAddQuantity(productId: number, currentQuantity: number, addQuantity: number): { allowed: boolean; maxQuantity: number | null; message?: string } {
    const maxQuantity = this.getQuantityLimit(productId);

    if (maxQuantity === null) {
      return { allowed: true, maxQuantity: null };
    }

    const totalQuantity = currentQuantity + addQuantity;

    if (totalQuantity > maxQuantity) {
      return {
        allowed: false,
        maxQuantity,
        message: `Cannot add to cart. Maximum ${maxQuantity} units allowed for this product.`
      };
    }

    return { allowed: true, maxQuantity };
  },

  /**
   * Get bulk pricing rule for a product
   */
  getBulkPricing(productId: number, quantity: number): { unitPrice: number; isBulkPrice: boolean } | null {
    const rule = BULK_PRICING_RULES.find(r => r.productId === productId);

    if (!rule) {
      return null;
    }

    if (quantity >= rule.requiredQuantity) {
      return {
        unitPrice: Math.round((rule.totalPrice / rule.requiredQuantity) * 100) / 100,
        isBulkPrice: true
      };
    }

    return null;
  },

  /**
   * Check if product is restricted in shipping zone
   */
  isRestrictedForShipping(productCategories: string[], productId: number, shippingZone?: string): boolean {
    if (!shippingZone) {
      return false;
    }

    // Check if zone is restricted
    const isRestrictedZone = SHIPPING_RESTRICTIONS.restrictedZones.some(
      zone => zone.toLowerCase() === shippingZone.toLowerCase()
    );

    if (!isRestrictedZone) {
      return false;
    }

    // Check if product has restricted category
    const hasRestrictedCategory = productCategories.some(cat =>
      SHIPPING_RESTRICTIONS.restrictedCategories.includes(cat)
    );

    // Check if product ID is restricted
    const isRestrictedProduct = SHIPPING_RESTRICTIONS.restrictedProductIds.includes(productId);

    return hasRestrictedCategory || isRestrictedProduct;
  },

  /**
   * Get perishable category names for display
   */
  getPerishableCategoryNames(): string[] {
    return ['Fresh Produce', 'Frozen Foods', 'Traditional Sweets'];
  }
};
