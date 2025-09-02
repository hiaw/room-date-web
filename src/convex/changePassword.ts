import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";

// For forgot password from sign-in page (takes email as parameter)
export default action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    console.log("Attempting password reset for email:", email);
    console.log("Environment check:");
    console.log("- RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log("- FROM_EMAIL:", process.env.FROM_EMAIL);

    // Use the auth signIn with password reset flow
    try {
      await ctx.runAction(api.auth.signIn, {
        provider: "password",
        params: {
          email,
          flow: "reset",
        },
      });

      console.log("Password reset email sent successfully for:", email);
      return {
        success: true,
        message:
          "Password reset email sent. Please check your email for instructions.",
      };
    } catch (error) {
      console.error("Password reset error details:", error);
      console.error("Error type:", typeof error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error",
      );

      // More specific error message
      if (error instanceof Error && error.message.includes("rate limit")) {
        throw new ConvexError(
          "Email service rate limited. Please try again in a few minutes.",
        );
      } else if (error instanceof Error && error.message.includes("domain")) {
        throw new ConvexError(
          "Email configuration issue. Please contact support.",
        );
      } else {
        throw new ConvexError(
          `Failed to send password reset email: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  },
});
