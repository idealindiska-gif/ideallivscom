import { StripePaymentDiagnostics } from '@/components/checkout/stripe-diagnostics';

export default function StripeDiagnosticsPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Stripe Payment Diagnostics</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                This page shows exactly why Apple Pay and Google Pay may or may not be visible.
            </p>

            <StripePaymentDiagnostics />
        </div>
    );
}
