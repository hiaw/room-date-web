import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import Stripe from "stripe";

const http = httpRouter();

auth.addHttpRoutes(http);

// Secure Stripe webhook endpoint with signature verification
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (_, request) => {
    // Get required environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookEndpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return new Response("Stripe not configured", { status: 500 });
    }

    if (!webhookEndpointSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Get signature from headers
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      console.error("Missing Stripe signature");
      return new Response("Missing Stripe signature", { status: 400 });
    }

    // Get raw request body
    const rawBody = await request.text();

    try {
      // Initialize Stripe
      const stripe = new Stripe(stripeSecretKey);

      // Verify webhook signature - this will throw if invalid
      const webhookEvent = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookEndpointSecret,
      );

      console.log(
        "Verified Stripe webhook event:",
        webhookEvent.type,
        webhookEvent.id,
      );

      // Process different event types
      switch (webhookEvent.type) {
        case "checkout.session.completed": {
          // Handle successful checkout completion
          const session = webhookEvent.data.object as Stripe.Checkout.Session;
          console.log("Checkout completed for session:", session.id);

          // TODO: Process the payment using internal mutation
          // For now, just log the event
          console.log("Payment webhook received for session:", session.id);
          break;
        }

        case "invoice.payment_failed": {
          // Handle failed payments if using subscriptions
          const invoice = webhookEvent.data.object;
          console.log("Payment failed for invoice:", invoice);
          break;
        }

        case "customer.subscription.deleted": {
          // Handle subscription cancellations if using subscriptions
          const subscription = webhookEvent.data.object;
          console.log("Subscription deleted:", subscription);
          break;
        }

        default:
          console.log("Unhandled webhook event type:", webhookEvent.type);
      }

      // Return success response
      return new Response(
        JSON.stringify({
          received: true,
          eventId: webhookEvent.id,
          eventType: webhookEvent.type,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      // Signature verification failed or other error
      console.error("Webhook signature verification failed:", error);
      return new Response("Webhook signature verification failed", {
        status: 400,
      });
    }
  }),
});

export default http;
