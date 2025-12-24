import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductVariation } from '@/types/woocommerce';
import {
  calculateShipping,
  type ShippingMethod,
  type RestrictedProduct,
} from '@/lib/shipping-service';
import { CommerceRules } from '@/config/commerce-rules';

export interface CartItem {
  key: string;
  productId: number;
  variationId?: number;
  quantity: number;
  price: number;
  product: Product;
  variation?: ProductVariation;
}

export interface ShippingAddress {
  postcode: string;
  city: string;
  country: string;
}

export interface CartNotification {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Notification state
  notification: CartNotification | null;

  // Shipping state
  shippingAddress: ShippingAddress | null;
  availableShippingMethods: ShippingMethod[];
  selectedShippingMethod: ShippingMethod | null;
  restrictedProducts: RestrictedProduct[];
  isCalculatingShipping: boolean;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  minimumOrder: number;
  minimumOrderMet: boolean;

  // Actions
  addItem: (product: Product, quantity?: number, variation?: ProductVariation) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearNotification: () => void;

  // Shipping actions
  setShippingAddress: (address: ShippingAddress) => void;
  calculateShipping: () => Promise<void>;
  selectShippingMethod: (method: ShippingMethod) => void;
  clearShipping: () => void;

  // Computed values
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getShippingCost: () => number;
  getTotal: () => number;
}

// Generate unique key for cart item
function generateCartKey(productId: number, variationId?: number): string {
  return variationId ? `${productId}-${variationId}` : `${productId}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // Notification state
      notification: null,

      // Shipping state initialization
      shippingAddress: null,
      availableShippingMethods: [],
      selectedShippingMethod: null,
      restrictedProducts: [],
      isCalculatingShipping: false,
      freeShippingThreshold: 500,
      amountToFreeShipping: 0,
      minimumOrder: 300,
      minimumOrderMet: false,

      addItem: (product, quantity = 1, variation) => {
        const key = generateCartKey(product.id, variation?.id);
        const state = get();
        const existingItem = state.items.find((item) => item.key === key);

        // Get current quantity in cart
        const currentQuantity = existingItem ? existingItem.quantity : 0;

        // Check quantity limit
        const validation = CommerceRules.canAddQuantity(product.id, currentQuantity, quantity);

        if (!validation.allowed) {
          // Set notification
          set({
            notification: {
              message: validation.message || 'Cannot add more of this item',
              type: 'warning',
              timestamp: Date.now(),
            },
          });

          // Cap at maximum allowed
          const maxAllowed = validation.maxQuantity;
          if (maxAllowed !== null && currentQuantity < maxAllowed) {
            quantity = maxAllowed - currentQuantity;
          } else {
            // Already at max, don't add
            return;
          }
        }

        set((state) => {
          const price = variation
            ? parseFloat(variation.price)
            : parseFloat(product.price);

          if (existingItem) {
            // Update quantity of existing item
            return {
              items: state.items.map((item) =>
                item.key === key
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          // Add new item
          const newItem: CartItem = {
            key,
            productId: product.id,
            variationId: variation?.id,
            quantity,
            price,
            product,
            variation,
          };

          return {
            items: [...state.items, newItem],
          };
        });
      },

      removeItem: (key) => {
        set((state) => ({
          items: state.items.filter((item) => item.key !== key),
        }));
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }

        const state = get();
        const item = state.items.find((i) => i.key === key);

        if (item) {
          // Check quantity limit
          const maxQuantity = CommerceRules.getQuantityLimit(item.productId);

          if (maxQuantity !== null && quantity > maxQuantity) {
            // Set notification
            set({
              notification: {
                message: `Maximum ${maxQuantity} units allowed for this product.`,
                type: 'warning',
                timestamp: Date.now(),
              },
            });

            // Cap at maximum
            quantity = maxQuantity;
          }
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.key === key ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      clearNotification: () => {
        set({ notification: null });
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      // Shipping actions
      setShippingAddress: (address) => {
        set({ shippingAddress: address });
        // Auto-calculate shipping when address is set
        get().calculateShipping();
      },

      calculateShipping: async () => {
        const { items, shippingAddress } = get();

        if (process.env.NODE_ENV === 'development') {
          console.log('🚚 calculateShipping called', {
            itemsCount: items.length,
            shippingAddress,
          });
        }

        // Don't calculate if no items or no address
        if (items.length === 0 || !shippingAddress) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Skipping shipping calculation - no items or address');
          }
          return;
        }

        set({ isCalculatingShipping: true });

        try {
          // Convert cart items to shipping API format
          const shippingItems = items.map((item) => ({
            productId: item.productId,
            variationId: item.variationId,
            quantity: item.quantity,
          }));

          if (process.env.NODE_ENV === 'development') {
            console.log('📦 Calling shipping API with:', {
              items: shippingItems,
              postcode: shippingAddress.postcode,
              city: shippingAddress.city,
              country: shippingAddress.country,
            });
          }

          // Call shipping API (with DHL rates)
          const result = await calculateShipping(
            shippingItems,
            shippingAddress.postcode,
            shippingAddress.city,
            shippingAddress.country
          );

          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Shipping API response:', result);
          }

          if (result.success) {
            set({
              availableShippingMethods: result.available_methods || [],
              restrictedProducts: result.restricted_products || [],
              freeShippingThreshold: result.free_shipping_threshold || 2000,
              amountToFreeShipping: result.amount_to_free_shipping || 0,
              minimumOrder: result.minimum_order || 550,
              minimumOrderMet: result.minimum_order_met || false,
              isCalculatingShipping: false,
            });

            // Auto-select shipping method intelligently
            const methods = result.available_methods || [];
            const freeShipping = methods.find((m) => m.method_id === 'free_shipping');
            const cartSubtotal = result.cart_subtotal || get().getSubtotal();
            const threshold = result.free_shipping_threshold || 500;

            // Only auto-select free shipping if cart meets threshold
            let defaultMethod = null;
            if (freeShipping && cartSubtotal >= threshold) {
              defaultMethod = freeShipping;
              console.log('✅ Auto-selecting free shipping (cart:', cartSubtotal, '>= threshold:', threshold, ')');
            } else {
              // Otherwise, select the first available paid method
              defaultMethod = methods[0];
              console.log('ℹ️ Auto-selecting first method:', defaultMethod?.label);
            }

            if (defaultMethod) {
              set({ selectedShippingMethod: defaultMethod });
            }
          } else {
            set({
              availableShippingMethods: [],
              restrictedProducts: result.restricted_products || [],
              isCalculatingShipping: false,
              minimumOrderMet: result.minimum_order_met || false,
            });
          }
        } catch (error) {
          console.error('Failed to calculate shipping:', error);
          set({
            isCalculatingShipping: false,
            availableShippingMethods: [],
            restrictedProducts: [],
          });
        }
      },

      selectShippingMethod: (method) => {
        set({ selectedShippingMethod: method });
      },

      clearShipping: () => {
        set({
          shippingAddress: null,
          availableShippingMethods: [],
          selectedShippingMethod: null,
          restrictedProducts: [],
          amountToFreeShipping: 0,
        });
      },

      getShippingCost: () => {
        const { selectedShippingMethod } = get();
        return selectedShippingMethod?.total_cost || 0;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShippingCost();
        return subtotal + shipping;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
