import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription']
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Extract relevant information
    const sessionData = {
      id: session.id,
      customer_email: session.customer_details?.email || session.customer?.email,
      customer_name: session.customer_details?.name || session.customer?.name,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      subscription_id: session.subscription?.id,
      plan: session.metadata?.plan,
      created: session.created,
    };

    // Here you could also update your database with the subscription information
    // await updateUserSubscription(sessionData);

    return NextResponse.json({
      success: true,
      session: sessionData
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
