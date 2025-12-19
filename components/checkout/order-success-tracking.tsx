'use client';

import { useEffect } from 'react';
import { trackPurchase } from '@/lib/analytics';
import { GoogleCustomerReviews } from '@/components/analytics';

interface OrderSuccessTrackingProps {
  orderId: string;
  orderNumber: string;
  total: string;
  shippingTotal: string;
  lineItems: any[];
  customerEmail: string;
  deliveryCountry?: string;
  estimatedDeliveryDate?: string;
}

export function OrderSuccessTracking({
  orderId,
  orderNumber,
  total,
  shippingTotal,
  lineItems,
  customerEmail,
  deliveryCountry = 'SE',
  estimatedDeliveryDate,
}: OrderSuccessTrackingProps) {
  useEffect(() => {
    // Track purchase event
    const totalValue = parseFloat(total);
    const shipping = parseFloat(shippingTotal);

    // Calculate tax (25% VAT is included in Swedish prices)
    const tax = totalValue * 0.2; // 20% of total (25% VAT means 20% of gross)

    trackPurchase(orderNumber, totalValue, lineItems, shipping, tax);
  }, [orderId, orderNumber, total, shippingTotal, lineItems]);

  // Calculate estimated delivery date (7 days from now if not provided)
  const deliveryDate = estimatedDeliveryDate ||
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <>
      {/* Google Customer Reviews Widget */}
      <GoogleCustomerReviews
        orderId={orderNumber}
        email={customerEmail}
        deliveryCountry={deliveryCountry}
        estimatedDeliveryDate={deliveryDate}
      />
    </>
  );
}
