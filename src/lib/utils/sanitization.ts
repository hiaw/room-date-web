/**
 * HTML sanitization utilities to prevent XSS attacks
 */

// Basic HTML entities that need escaping
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Sanitize HTML by escaping dangerous characters
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize text for safe display, preserving line breaks
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  return sanitizeHtml(input.trim());
}

/**
 * Remove potentially dangerous characters from input
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove null bytes, control characters, and normalize whitespace
  return (
    input
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // Remove control chars
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
  );
}

/**
 * Sanitize URLs to prevent javascript: and data: schemes
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmedUrl = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmedUrl.startsWith("javascript:") ||
    trimmedUrl.startsWith("data:") ||
    trimmedUrl.startsWith("vbscript:")
  ) {
    return "";
  }

  // Allow only http, https, and relative URLs
  if (
    !trimmedUrl.startsWith("http://") &&
    !trimmedUrl.startsWith("https://") &&
    !trimmedUrl.startsWith("/") &&
    !trimmedUrl.startsWith("./") &&
    !trimmedUrl.startsWith("../")
  ) {
    return "";
  }

  return url.trim();
}

/**
 * Clean and validate task text input
 */
export function sanitizeTaskText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Remove dangerous content and normalize
  return sanitizeUserInput(text)
    .replace(/[<>]/g, "") // Remove angle brackets entirely for task text
    .substring(0, 1000); // Enforce max length
}
