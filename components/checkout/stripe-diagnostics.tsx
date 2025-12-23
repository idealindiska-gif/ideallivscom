'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function StripePaymentDiagnostics() {
    const [diagnostics, setDiagnostics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const runDiagnostics = async () => {
            const results: any = {
                timestamp: new Date().toISOString(),
                browser: {
                    userAgent: navigator.userAgent,
                    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
                    isChrome: /chrome/i.test(navigator.userAgent) && !/edg/i.test(navigator.userAgent),
                    platform: navigator.platform,
                },
                stripe: {
                    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...',
                },
            };

            // Check Stripe configuration
            try {
                const response = await fetch('/api/stripe/config');
                if (response.ok) {
                    results.stripeConfig = await response.json();
                } else {
                    results.stripeConfigError = await response.text();
                }
            } catch (error) {
                results.stripeConfigError = error instanceof Error ? error.message : 'Failed to load';
            }

            // Check if PaymentRequest API is available
            if (window.PaymentRequest) {
                results.paymentRequestAPI = 'Available';

                // Check Apple Pay
                try {
                    const canMakePayments = await (window as any).ApplePaySession?.canMakePayments();
                    results.applePay = {
                        available: canMakePayments,
                        version: (window as any).ApplePaySession?.supportsVersion(3),
                    };
                } catch (e) {
                    results.applePay = { available: false, error: 'Not supported on this browser' };
                }
            } else {
                results.paymentRequestAPI = 'Not Available';
            }

            setDiagnostics(results);
            setLoading(false);
        };

        runDiagnostics();
    }, []);

    if (loading) {
        return (
            <Card className="p-6">
                <p>Running diagnostics...</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Stripe Payment Diagnostics</strong>
                    <br />
                    This shows why wallets may or may not be visible.
                </AlertDescription>
            </Alert>

            <Card className="p-6 space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Browser Detection</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                            {diagnostics.browser.isSafari ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span>Safari (required for Apple Pay): {diagnostics.browser.isSafari ? 'YES' : 'NO'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {diagnostics.browser.isChrome ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span>Chrome (required for Google Pay): {diagnostics.browser.isChrome ? 'YES' : 'NO'}</span>
                        </div>
                        <div className="text-xs text-neutral-500 mt-2">
                            Platform: {diagnostics.browser.platform}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Payment Request API</h3>
                    <div className="flex items-center gap-2 text-sm">
                        {diagnostics.paymentRequestAPI === 'Available' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>{diagnostics.paymentRequestAPI}</span>
                    </div>
                </div>

                {diagnostics.applePay && (
                    <div>
                        <h3 className="font-semibold mb-2">Apple Pay</h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                                {diagnostics.applePay.available ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span>Can Make Payments: {diagnostics.applePay.available ? 'YES' : 'NO'}</span>
                            </div>
                            {diagnostics.applePay.error && (
                                <div className="text-xs text-red-600">{diagnostics.applePay.error}</div>
                            )}
                        </div>
                    </div>
                )}

                {diagnostics.stripeConfig && (
                    <div>
                        <h3 className="font-semibold mb-2">Stripe Account</h3>
                        <div className="text-sm space-y-1">
                            <div>Country: {diagnostics.stripeConfig.account?.country || 'Unknown'}</div>
                            <div className="text-xs text-neutral-500 mt-2">
                                <pre className="overflow-auto p-2 bg-neutral-100 dark:bg-neutral-900 rounded">
                                    {JSON.stringify(diagnostics.stripeConfig, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        <strong>Next Steps:</strong>
                    </p>
                    <ul className="text-sm space-y-1 mt-2 list-disc list-inside">
                        {!diagnostics.browser.isSafari && !diagnostics.browser.isChrome && (
                            <li className="text-red-600">Use Safari (for Apple Pay) or Chrome (for Google Pay)</li>
                        )}
                        {diagnostics.browser.isSafari && !diagnostics.applePay?.available && (
                            <li className="text-red-600">Set up Apple Pay in your device settings and add a card to Wallet</li>
                        )}
                        {!diagnostics.stripeConfig && (
                            <li className="text-red-600">Check Stripe API configuration</li>
                        )}
                    </ul>
                </div>
            </Card>

            <div className="text-xs text-neutral-500">
                Diagnostics run at: {new Date(diagnostics.timestamp).toLocaleString()}
            </div>
        </div>
    );
}
