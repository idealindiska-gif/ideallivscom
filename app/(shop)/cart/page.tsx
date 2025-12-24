'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { Container, Section } from '@/components/craft';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/woocommerce';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { StripeExpressCheckout } from '@/components/checkout/stripe-express-checkout';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <Section>
        <Container>
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
            <h1 className="mb-2 text-3xl font-bold">Your cart is empty</h1>
            <p className="mb-6 text-muted-foreground">
              Add some delicious items to your cart to get started
            </p>
            <Button asChild size="lg">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-4 rounded-lg border p-4"
                >
                  {/* Product Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border sm:h-32 sm:w-32">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0].src}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 96px, 128px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <div>
                          <Link
                            href={`/${item.product.slug}`}
                            className="font-semibold hover:text-primary"
                          >
                            {item.product.name}
                          </Link>
                          {item.product.categories && item.product.categories.length > 0 && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.product.categories[0].name}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.key)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Price: {formatPrice(item.price, 'SEK')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.price * item.quantity, 'SEK')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <div className="mt-6">
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border p-6 sticky top-4">
              <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(getTotalPrice(), 'SEK')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(getTotalPrice(), 'SEK')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {/* Express Checkout - Apple Pay / Google Pay */}
                <StripeExpressCheckout
                  amount={getTotalPrice()}
                  currency="SEK"
                  showDebug={true}
                  onSuccess={(result) => {
                    console.log('Express checkout from cart success:', result);
                  }}
                  onError={(error) => {
                    console.error('Express checkout from cart error:', error);
                  }}
                />

                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Taxes and shipping calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
