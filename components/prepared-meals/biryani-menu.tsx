/**
 * Biryani Menu Component
 * Displays available biryani options with quick WhatsApp ordering
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Drumstick, Leaf, Star, Flame } from 'lucide-react';
import { generateWhatsAppUrl } from '@/lib/whatsapp/url-generator';
import { getWhatsAppPhone } from '@/lib/whatsapp/config';

interface BiryaniItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'chicken' | 'vegetable';
  features: string[];
  spiceLevel: number;
  popular?: boolean;
}

const biryanis: BiryaniItem[] = [
  {
    id: 'chicken-dum-biryani',
    name: 'Chicken Dum Biryani',
    description: 'Tender chicken pieces marinated in aromatic spices, slow-cooked with fragrant basmati rice using the traditional dum pukht method. Garnished with fried onions, fresh mint, and coriander.',
    price: 119,
    type: 'chicken',
    spiceLevel: 3,
    popular: true,
    features: [
      'Marinated tender chicken',
      'Long-grain basmati rice',
      'Slow-cooked for 45 minutes',
      'Garnished with fried onions',
      'Serves 1-2 people',
      'Includes raita & pickle'
    ]
  },
  {
    id: 'vegetable-dum-biryani',
    name: 'Vegetable Dum Biryani',
    description: 'A delightful medley of fresh seasonal vegetables and paneer, layered with basmati rice and aromatic spices. Cooked in the traditional dum style for authentic flavors.',
    price: 119,
    type: 'vegetable',
    spiceLevel: 2,
    features: [
      'Fresh seasonal vegetables',
      'Paneer cubes included',
      'Long-grain basmati rice',
      'Traditional dum cooking',
      'Serves 1-2 people',
      'Includes raita & pickle'
    ]
  }
];

export function BiryaniMenu() {
  const handleWhatsAppOrder = (biryani: BiryaniItem) => {
    const message = `Hi! I would like to pre-order *${biryani.name}* (${biryani.price} kr) for the weekend.\n\nPlease confirm availability and delivery/pickup details.\n\nThank you!`;

    const phone = getWhatsAppPhone('orders');
    const urlResult = generateWhatsAppUrl(phone, message);

    // Open WhatsApp in new window
    window.open(urlResult.url, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {biryanis.map((biryani) => (
        <Card key={biryani.id} className="relative overflow-hidden border-2 hover:border-orange-300 transition-all hover:shadow-xl">
          {/* Popular Badge */}
          {biryani.popular && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-orange-600 text-white border-0">
                <Star className="h-3 w-3 mr-1 fill-white" />
                Popular
              </Badge>
            </div>
          )}

          <CardHeader className="pb-4">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
              {biryani.type === 'chicken' ? (
                <Drumstick className="h-8 w-8 text-white" />
              ) : (
                <Leaf className="h-8 w-8 text-white" />
              )}
            </div>

            <CardTitle className="text-2xl">{biryani.name}</CardTitle>
            <CardDescription className="text-base mt-2">
              {biryani.description}
            </CardDescription>

            {/* Spice Level */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Spice Level:</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Flame
                    key={i}
                    className={`h-4 w-4 ${
                      i < biryani.spiceLevel
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Features */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">What's Included:</p>
              <ul className="grid grid-cols-2 gap-2">
                {biryani.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-orange-600 mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price */}
            <div className="pt-4 border-t">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {biryani.price} kr
                </span>
                <span className="text-sm text-gray-500">per portion</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              onClick={() => handleWhatsAppOrder(biryani)}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Quick Order via WhatsApp
            </Button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Or use the booking form below for detailed orders
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
