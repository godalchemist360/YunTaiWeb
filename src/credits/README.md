# Credit Management System Implementation

## Overview

This document describes the credit management system implementation for the mksaas-template project, which allows users to purchase credits using Stripe payments.

## Features Implemented

### 1. Credit Packages
- Defined credit packages with different tiers (Basic, Standard, Premium, Enterprise)
- Each package includes credits amount, price, and description
- Popular package highlighting

### 2. Payment Integration
- Stripe PaymentIntent integration for credit purchases
- Secure payment processing with webhook verification
- Automatic credit addition upon successful payment

### 3. UI Components
- Credit balance display with refresh functionality
- Credit packages selection interface
- Stripe payment form integration
- Modern, responsive design

### 4. Database Integration
- Credit transaction recording
- User credit balance management
- Proper error handling and validation

## Files Created/Modified

### Core Components
- `src/components/dashboard/credit-packages.tsx` - Main credit packages interface
- `src/components/dashboard/credit-balance.tsx` - Credit balance display
- `src/components/dashboard/stripe-payment-form.tsx` - Stripe payment integration

### Actions & API
- `src/actions/credits.action.ts` - Credit-related server actions
- `src/app/api/webhooks/stripe/route.ts` - Stripe webhook handler
- `src/payment/index.ts` - Payment provider interface (updated)
- `src/payment/types.ts` - Payment types (updated)

### Configuration
- `src/lib/constants.ts` - Credit packages configuration
- `env.example` - Environment variables template

### Pages
- `src/app/[locale]/(protected)/settings/credits/page.tsx` - Credits management page

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Setup Instructions

### 1. Stripe Configuration
1. Create a Stripe account at https://dashboard.stripe.com
2. Get your API keys from the Stripe dashboard
3. Set up a webhook endpoint pointing to `/api/webhooks/stripe`
4. Copy the webhook secret and add it to your environment variables

### 2. Database Setup
Make sure your database schema includes the required credit tables as defined in `src/db/schema.ts`.

### 3. Environment Variables
Copy the required environment variables from `env.example` to your `.env.local` file and fill in the values.

## Usage

### For Users
1. Navigate to `/settings/credits`
2. View current credit balance
3. Select a credit package
4. Complete payment using Stripe
5. Credits are automatically added to account

### For Developers
```typescript
// Get user credits
const result = await getCreditsAction();

// Create payment intent
const paymentIntent = await createCreditPaymentIntent({
  packageId: 'standard'
});

// Add credits manually
await addCredits({
  userId: 'user-id',
  amount: 100,
  type: 'PURCHASE',
  description: 'Credit purchase'
});
```

## Credit Packages Configuration

Edit `src/lib/constants.ts` to modify available credit packages:

```typescript
export const CREDIT_PACKAGES = [
  {
    id: 'basic',
    credits: 100,
    price: 9.99,
    popular: false,
    description: 'Perfect for getting started',
  },
  // ... more packages
];
```

## Webhook Events

The system handles these Stripe webhook events:
- `payment_intent.succeeded` - Adds credits to user account upon successful payment

## Security Features

1. **Webhook Verification**: All webhook requests are verified using Stripe signatures
2. **Payment Validation**: Amount and package validation before processing
3. **User Authentication**: All credit operations require authenticated users
4. **Metadata Validation**: Payment metadata is validated before processing

## Error Handling

The system includes comprehensive error handling for:
- Invalid payment attempts
- Network failures
- Database errors
- Authentication issues
- Webhook verification failures

## Testing

To test the credit purchase flow:
1. Use Stripe test cards (e.g., `4242424242424242`)
2. Monitor webhook events in Stripe dashboard
3. Check credit balance updates in the application

## Integration Notes

This implementation:
- Uses Next.js server actions for secure server-side operations
- Integrates with existing Drizzle ORM schema
- Follows the existing payment provider pattern
- Maintains consistency with the existing codebase architecture

## Future Enhancements

Potential improvements:
- Credit transaction history display
- Credit expiration management
- Bulk credit operations
- Credit usage analytics
- Subscription-based credit allocation
