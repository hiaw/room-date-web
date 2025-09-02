import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";

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
      // Use dynamic import to avoid circular dependency
      const { signIn } = await import("./auth.js");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.runAction(signIn as any, {
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

      // Robust error handling: log details for debugging, provide generic message to client
      if (error instanceof Error) {
        // Log the detailed error for backend debugging
        console.error("Password reset failed:", error.message);
        console.error("Stack trace:", error.stack);

        // Provide a generic, user-friendly error to the client
        throw new ConvexError(
          "Failed to send password reset email. Please try again later or contact support if the issue persists.",
        );
      }

      // Fallback for non-Error objects
      console.error("Password reset failed with non-Error object:", error);
      throw new ConvexError(
        "An unknown error occurred while sending the password reset email.",
      );
    }
  },
});
