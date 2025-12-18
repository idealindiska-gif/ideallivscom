'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const shippingSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    company: z.string().optional(),
    address_1: z.string().min(1, 'Address is required'),
    address_2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    postcode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Valid email is required'),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
    onSubmit: (data: ShippingFormData) => void;
    defaultValues?: Partial<ShippingFormData>;
    className?: string;
}

export function ShippingForm({ onSubmit, defaultValues, className }: ShippingFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ShippingFormData>({
        resolver: zodResolver(shippingSchema),
        defaultValues: defaultValues || {
            country: 'SE', // Default to Sweden
        },
    });

    const selectedCountry = watch('country');

    return (
        <form id="shipping-form" onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
            <div className="space-y-4">
                <h2 className="font-heading text-2xl font-bold text-primary-950 dark:text-primary-50">
                    Shipping Information
                </h2>

                {/* Email & Phone Group */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            Phone <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            {...register('phone')}
                            className={errors.phone ? 'border-destructive' : ''}
                        />
                        {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {/* First Name */}
                    <div className="space-y-2">
                        <Label htmlFor="first_name">
                            First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="first_name"
                            {...register('first_name')}
                            className={errors.first_name ? 'border-destructive' : ''}
                        />
                        {errors.first_name && (
                            <p className="text-sm text-destructive">{errors.first_name.message}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <Label htmlFor="last_name">
                            Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="last_name"
                            {...register('last_name')}
                            className={errors.last_name ? 'border-destructive' : ''}
                        />
                        {errors.last_name && (
                            <p className="text-sm text-destructive">{errors.last_name.message}</p>
                        )}
                    </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                    <Label htmlFor="company">Company (optional)</Label>
                    <Input id="company" {...register('company')} />
                </div>

                {/* Country */}
                <div className="space-y-2">
                    <Label htmlFor="country">
                        Country <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={selectedCountry}
                        onValueChange={(value) => setValue('country', value)}
                    >
                        <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SE">Sweden</SelectItem>
                            <SelectItem value="NO">Norway</SelectItem>
                            <SelectItem value="DK">Denmark</SelectItem>
                            <SelectItem value="FI">Finland</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.country && (
                        <p className="text-sm text-destructive">{errors.country.message}</p>
                    )}
                </div>

                {/* Address 1 */}
                <div className="space-y-2">
                    <Label htmlFor="address_1">
                        Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="address_1"
                        placeholder="House number and street name"
                        {...register('address_1')}
                        className={errors.address_1 ? 'border-destructive' : ''}
                    />
                    {errors.address_1 && (
                        <p className="text-sm text-destructive">{errors.address_1.message}</p>
                    )}
                </div>

                {/* Address 2 */}
                <div className="space-y-2">
                    <Label htmlFor="address_2">Apartment, suite, etc. (optional)</Label>
                    <Input id="address_2" {...register('address_2')} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {/* City */}
                    <div className="space-y-2">
                        <Label htmlFor="city">
                            City <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="city"
                            {...register('city')}
                            className={errors.city ? 'border-destructive' : ''}
                        />
                        {errors.city && (
                            <p className="text-sm text-destructive">{errors.city.message}</p>
                        )}
                    </div>

                    {/* State */}
                    <div className="space-y-2">
                        <Label htmlFor="state">
                            State/Province (optional)
                        </Label>
                        <Input
                            id="state"
                            {...register('state')}
                            className={errors.state ? 'border-destructive' : ''}
                        />
                        {errors.state && (
                            <p className="text-sm text-destructive">{errors.state.message}</p>
                        )}
                    </div>

                    {/* Postcode */}
                    <div className="space-y-2">
                        <Label htmlFor="postcode">
                            Postal Code <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="postcode"
                            {...register('postcode')}
                            className={errors.postcode ? 'border-destructive' : ''}
                        />
                        {errors.postcode && (
                            <p className="text-sm text-destructive">{errors.postcode.message}</p>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}
