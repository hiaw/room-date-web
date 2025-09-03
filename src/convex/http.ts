import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// Stripe webhook endpoint (placeholder for now)
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("No Stripe signature found", { status: 400 });
    }

    // For now, just acknowledge the webhook
    // Full implementation will be added after API generation is fixed
    console.log("Stripe webhook received");

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
});

export default http;
