/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const response = await resolve(event);

  // Content Security Policy - tightened for better security
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Keep for Svelte compatibility - consider moving to nonces in production
    "style-src 'self' 'unsafe-inline'", // Keep for Tailwind/Svelte compatibility
    "connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud wss://*.convex.site https://api.opencagedata.com", // Convex connections and geocoding API
    "img-src 'self' data: https: blob: https://*.convex.cloud", // Images
    "font-src 'self' data:", // Fonts
    "object-src 'none'", // Disallow plugins
    "base-uri 'self'", // Restrict base URI
    "form-action 'self'", // Restrict form submissions
    "frame-ancestors 'none'", // Prevent embedding
    "upgrade-insecure-requests", // Force HTTPS
    "block-all-mixed-content", // Block mixed content
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspDirectives);

  // Enhanced security headers
  response.headers.set("X-Frame-Options", "DENY"); // Prevent clickjacking
  response.headers.set("X-Content-Type-Options", "nosniff"); // Prevent MIME sniffing
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin"); // Control referrer
  response.headers.set("X-XSS-Protection", "1; mode=block"); // Legacy XSS protection

  // Additional modern security headers
  response.headers.set("Cross-Origin-Embedder-Policy", "credentialless"); // Enhanced isolation but allow cross-origin resources
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin"); // Prevent cross-origin access
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin"); // Restrict resource sharing

  // Enhanced permissions policy
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(self), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(self)",
  );

  // HSTS (HTTP Strict Transport Security) - enhanced settings
  if (event.url.protocol === "https:") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}
