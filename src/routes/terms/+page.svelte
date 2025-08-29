<script lang="ts">
  import { ArrowLeft } from "lucide-svelte";
  import { goto } from "$app/navigation";

  function handleBack() {
    goto("/");
  }
</script>

<svelte:head>
  <title>Terms of Service - Room Dates</title>
  <meta
    name="description"
    content="Room Dates terms of service - the rules and guidelines for using our platform."
  />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="flex items-center justify-between">
        <button
          onclick={handleBack}
          class="rounded-xl bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 class="text-xl font-bold text-gray-900">Terms of Service</h1>
        <div></div>
      </div>
    </div>
  </div>

  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="prose prose-lg max-w-none">
      <h1 class="mb-6 text-4xl font-bold text-gray-900">Terms of Service</h1>

      <p class="mb-8 text-sm text-gray-600">
        Last updated: {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div class="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
        <p class="text-blue-800">
          <strong>Welcome to Room Dates!</strong> By using our platform, you agree
          to these Terms of Service. Please read them carefully before using our
          services.
        </p>
      </div>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        1. Acceptance of Terms
      </h2>

      <p class="mb-6 text-gray-700">
        By accessing or using Room Dates ("the platform"), you agree to be bound
        by these Terms of Service and our Privacy Policy. If you don't agree to
        these terms, please don't use our platform.
      </p>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">2. Eligibility</h2>

      <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
        <li>You must be at least 18 years old to use our platform</li>
        <li>You must provide accurate and complete information</li>
        <li>You must not have been previously banned from our platform</li>
        <li>You must comply with all applicable laws and regulations</li>
      </ul>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        3. User Responsibilities
      </h2>

      <h3 class="mb-3 text-xl font-semibold text-gray-900">As a Host</h3>
      <ul class="mb-4 list-inside list-disc space-y-2 text-gray-700">
        <li>Provide accurate descriptions and photos of your space</li>
        <li>Ensure your space is safe and suitable for events</li>
        <li>Treat all guests with respect and kindness</li>
        <li>Honor confirmed event commitments</li>
        <li>Maintain appropriate insurance coverage</li>
      </ul>

      <h3 class="mb-3 text-xl font-semibold text-gray-900">As a Guest</h3>
      <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
        <li>Be honest in your application messages</li>
        <li>Respect the host's space and property</li>
        <li>Follow event rules and guidelines</li>
        <li>Communicate respectfully with hosts and other guests</li>
        <li>Attend events you've committed to</li>
      </ul>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        4. Prohibited Activities
      </h2>

      <div class="mb-6 rounded-xl border border-red-200 bg-red-50 p-6">
        <p class="mb-3 font-semibold text-red-800">
          The following activities are strictly prohibited:
        </p>
        <ul class="list-inside list-disc space-y-2 text-red-700">
          <li>Harassment, bullying, or discriminatory behavior</li>
          <li>Illegal activities or promotion of illegal activities</li>
          <li>Spam, scams, or fraudulent behavior</li>
          <li>Sharing false or misleading information</li>
          <li>Inappropriate sexual content or behavior</li>
          <li>Violation of others' privacy or intellectual property</li>
          <li>Attempting to circumvent platform safety measures</li>
        </ul>
      </div>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        5. Content and Intellectual Property
      </h2>

      <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
        <li>
          You retain ownership of content you post (photos, descriptions,
          messages)
        </li>
        <li>
          You grant us a license to use your content to provide our services
        </li>
        <li>
          You're responsible for ensuring you have rights to all content you
          share
        </li>
        <li>We may remove content that violates these terms</li>
      </ul>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        6. Safety and Security
      </h2>

      <p class="mb-4 text-gray-700">Your safety is our priority:</p>

      <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
        <li>
          We provide identity verification tools, but you're responsible for
          your own safety
        </li>
        <li>Meet in public spaces first when possible</li>
        <li>Trust your instincts and report suspicious behavior</li>
        <li>We're not responsible for offline interactions between users</li>
      </ul>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">7. Privacy and Data</h2>

      <p class="mb-6 text-gray-700">
        Your privacy is governed by our Privacy Policy, which is incorporated
        into these terms. By using our platform, you consent to our data
        practices as described in the Privacy Policy.
      </p>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        8. Platform Availability
      </h2>

      <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
        <li>
          We strive for 99.9% uptime but can't guarantee uninterrupted service
        </li>
        <li>We may temporarily suspend service for maintenance</li>
        <li>We reserve the right to modify or discontinue features</li>
      </ul>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        9. Account Termination
      </h2>

      <p class="mb-4 text-gray-700">
        We may suspend or terminate accounts for:
      </p>

      <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
        <li>Violation of these terms</li>
        <li>Fraudulent or suspicious activity</li>
        <li>Harm to other users or the platform</li>
        <li>Extended periods of inactivity</li>
      </ul>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        10. Disclaimers and Limitations
      </h2>

      <div class="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-6">
        <p class="text-yellow-800">
          <strong>Important:</strong> Room Dates is a platform that connects users.
          We don't provide accommodations, events, or guarantee the quality or safety
          of user interactions. Use the platform at your own risk.
        </p>
      </div>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        11. Dispute Resolution
      </h2>

      <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
        <li>Try to resolve disputes directly with other users first</li>
        <li>Contact our support team for assistance if needed</li>
        <li>Serious disputes may be subject to binding arbitration</li>
      </ul>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        12. Changes to Terms
      </h2>

      <p class="mb-6 text-gray-700">
        We may update these Terms of Service from time to time. We'll notify you
        of material changes via email or platform notification. Continued use
        after changes constitutes acceptance.
      </p>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        13. Contact Information
      </h2>

      <div class="rounded-xl bg-gray-50 p-6">
        <p class="mb-4 text-gray-700">
          Questions about these Terms of Service? Contact us:
        </p>
        <ul class="space-y-2 text-gray-700">
          <li><strong>Email:</strong> legal@roomdates.com</li>
          <li>
            <strong>Support:</strong> Available through your account settings
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
