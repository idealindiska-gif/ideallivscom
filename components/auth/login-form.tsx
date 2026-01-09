'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuthStore } from '@/store/auth-store';
import { loginUserAction, getCurrentUserAction } from '@/app/actions/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
    username: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/my-account';

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    async function onSubmit(data: LoginFormValues) {
        console.log('Submitting login form...', data);
        setIsLoading(true);
        try {
            // 1. Login to get token
            console.log('Calling loginUserAction...');
            const authResult = await loginUserAction(data);
            console.log('Auth result:', authResult);

            if (!authResult.success || !authResult.data) {
                console.error('Login failed:', authResult.error);
                toast.error(authResult.error || 'Login failed');
                return;
            }

            const authData = authResult.data;

            // 2. Get full user details
            console.log('Getting user details for ID:', authData.user_id);
            const userResult = await getCurrentUserAction(authData.token, authData.user_email, authData.user_id);
            console.log('User result:', userResult);

            if (!userResult.success || !userResult.data) {
                console.error('Failed to load user profile:', userResult.error);
                const errorMsg = userResult.error || 'Failed to load user profile. Please try again or contact support.';
                toast.error(errorMsg, {
                    duration: 5000,
                });
                return;
            }

            const user = userResult.data;

            // 3. Update store
            console.log('Updating auth store...');
            login(user, authData.token);

            toast.success('Welcome back!');
            console.log('Redirecting to:', callbackUrl);
            router.push(callbackUrl);
            router.refresh();
        } catch (error) {
            console.error('Unexpected error in onSubmit:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading} variant="premium">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                </Button>
            </form>
        </Form>
    );
}
