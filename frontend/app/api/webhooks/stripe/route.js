import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment successful:', session.id);
        
        // Here you would typically:
        // 1. Update user's subscription status in your database
        // 2. Send confirmation email
        // 3. Grant access to premium features
        
        await handleSubscriptionCreated(session);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object;
        console.log('Subscription canceled:', canceledSubscription.id);
        
        await handleSubscriptionCanceled(canceledSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('Payment succeeded:', invoice.id);
        
        await handlePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('Payment failed:', failedInvoice.id);
        
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(session) {
  try {
    // Extract subscription details
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    const plan = session.metadata?.plan;

    // Here you would update your database
    // Example:
    // await updateUserSubscription({
    //   customerId,
    //   subscriptionId,
    //   plan,
    //   status: 'active'
    // });

    console.log('Subscription created successfully:', {
      customerId,
      subscriptionId,
      plan
    });
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    // Handle subscription updates (plan changes, etc.)
    console.log('Subscription updated:', subscription.id);
    
    // Update database with new subscription details
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionCanceled(subscription) {
  try {
    // Handle subscription cancellation
    console.log('Subscription canceled:', subscription.id);
    
    // Update user's access in database
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    // Handle successful payment
    console.log('Payment succeeded for invoice:', invoice.id);
    
    // You might want to send a receipt email here
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice) {
  try {
    // Handle failed payment
    console.log('Payment failed for invoice:', invoice.id);
    
    // You might want to notify the user about the failed payment
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
