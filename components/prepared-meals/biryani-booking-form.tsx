/**
 * Biryani Booking Form Component
 * Comprehensive form for pre-ordering biryani with WhatsApp integration
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Loader2, Calendar, MapPin } from 'lucide-react';
import { generateWhatsAppUrl } from '@/lib/whatsapp/url-generator';
import { getWhatsAppPhone } from '@/lib/whatsapp/config';

// Form validation schema
const bookingFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  biryaniType: z.enum(['chicken', 'vegetable'], {
    required_error: 'Please select a biryani type',
  }),
  quantity: z.string().min(1, 'Quantity required'),
  pickupDay: z.enum(['saturday', 'sunday'], {
    required_error: 'Please select pickup/delivery day',
  }),
  preferredTime: z.string().min(1, 'Preferred time required'),
  deliveryMethod: z.enum(['pickup', 'delivery'], {
    required_error: 'Please select delivery method',
  }),
  address: z.string().optional(),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export function BiryaniBookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
  });

  const deliveryMethod = watch('deliveryMethod');
  const biryaniType = watch('biryaniType');
  const quantity = watch('quantity');

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);

    try {
      // Calculate price
      const pricePerItem = data.biryaniType === 'chicken' ? 119 : 119;
      const totalPrice = pricePerItem * parseInt(data.quantity || '1');

      // Format WhatsApp message
      const message = `*🍛 Biryani Pre-Order Request*

*Customer Details:*
Name: ${data.name}
Phone: ${data.phone}
${data.email ? `Email: ${data.email}` : ''}

*Order Details:*
Biryani: ${data.biryaniType === 'chicken' ? 'Chicken Dum Biryani' : 'Vegetable Dum Biryani'}
Quantity: ${data.quantity} portion(s)
Price per portion: ${pricePerItem} kr
*Total: ${totalPrice} kr*

*Pickup/Delivery:*
Day: ${data.pickupDay === 'saturday' ? 'Saturday' : 'Sunday'}
Preferred Time: ${data.preferredTime}
Method: ${data.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
${data.deliveryMethod === 'delivery' && data.address ? `Address: ${data.address}` : ''}

${data.specialRequests ? `*Special Requests:*\n${data.specialRequests}` : ''}

Please confirm this pre-order. Thank you!`;

      // Generate WhatsApp URL
      const phone = getWhatsAppPhone('orders');
      const urlResult = generateWhatsAppUrl(phone, message);

      // Show success message
      toast({
        title: 'Opening WhatsApp...',
        description: 'Your order details will be sent to our team for confirmation.',
      });

      // Open WhatsApp
      window.open(urlResult.url, '_blank');

      toast({
        title: 'Order Sent!',
        description: 'We will confirm your order shortly via WhatsApp.',
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-600" />
          Weekend Biryani Booking
        </CardTitle>
        <CardDescription>
          Complete the form below and we'll send your order details via WhatsApp for confirmation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>

            <div>
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" {...register('name')} placeholder="John Doe" />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="+46 70 123 4567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Details</h3>

            <div>
              <Label>
                Select Biryani <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={biryaniType}
                onValueChange={(value) => setValue('biryaniType', value as 'chicken' | 'vegetable')}
                className="mt-2"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 dark:hover:bg-orange-950/20 cursor-pointer">
                  <RadioGroupItem value="chicken" id="chicken" />
                  <Label htmlFor="chicken" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Chicken Dum Biryani</div>
                    <div className="text-sm text-gray-500">119 kr per portion</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 dark:hover:bg-orange-950/20 cursor-pointer">
                  <RadioGroupItem value="vegetable" id="vegetable" />
                  <Label htmlFor="vegetable" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Vegetable Dum Biryani</div>
                    <div className="text-sm text-gray-500">119 kr per portion</div>
                  </Label>
                </div>
              </RadioGroup>
              {errors.biryaniType && (
                <p className="text-sm text-red-500 mt-1">{errors.biryaniType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quantity">
                Quantity (portions) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="20"
                {...register('quantity')}
                placeholder="1"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
              )}
              {quantity && biryaniType && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Total: {(biryaniType === 'chicken' ? 119 : 119) * parseInt(quantity)} kr
                </p>
              )}
            </div>
          </div>

          {/* Pickup/Delivery Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pickup / Delivery Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickupDay">
                  Day <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('pickupDay', value as 'saturday' | 'sunday')}>
                  <SelectTrigger id="pickupDay">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
                {errors.pickupDay && (
                  <p className="text-sm text-red-500 mt-1">{errors.pickupDay.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="preferredTime">
                  Preferred Time <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('preferredTime', value)}>
                  <SelectTrigger id="preferredTime">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14:00-15:00">14:00 - 15:00</SelectItem>
                    <SelectItem value="15:00-16:00">15:00 - 16:00</SelectItem>
                    <SelectItem value="16:00-17:00">16:00 - 17:00</SelectItem>
                    <SelectItem value="17:00-18:00">17:00 - 18:00</SelectItem>
                    <SelectItem value="18:00-19:00">18:00 - 19:00</SelectItem>
                    <SelectItem value="19:00-20:00">19:00 - 20:00</SelectItem>
                    <SelectItem value="20:00-21:00">20:00 - 21:00</SelectItem>
                  </SelectContent>
                </Select>
                {errors.preferredTime && (
                  <p className="text-sm text-red-500 mt-1">{errors.preferredTime.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label>
                Delivery Method <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value) => setValue('deliveryMethod', value as 'pickup' | 'delivery')}
                className="mt-2"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="cursor-pointer">
                    <div className="font-semibold">Store Pickup</div>
                    <div className="text-sm text-gray-500">Pick up from Ideal Livs</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="cursor-pointer">
                    <div className="font-semibold">Home Delivery</div>
                    <div className="text-sm text-gray-500">Delivery within Stockholm area</div>
                  </Label>
                </div>
              </RadioGroup>
              {errors.deliveryMethod && (
                <p className="text-sm text-red-500 mt-1">{errors.deliveryMethod.message}</p>
              )}
            </div>

            {deliveryMethod === 'delivery' && (
              <div>
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="Enter your complete delivery address..."
                  rows={3}
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
            <Textarea
              id="specialRequests"
              {...register('specialRequests')}
              placeholder="Any special instructions, dietary requirements, or spice level preferences..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Send Booking via WhatsApp
                </>
              )}
            </Button>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
              Your order will be sent to our WhatsApp for confirmation
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
