<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import MarketingLayout from "$lib/components/marketing/MarketingLayout.svelte";
  import { ArrowLeft } from "lucide-svelte";

  function handleBack() {
    // Check if accessed from profile (only in browser)
    if (
      browser &&
      $page.url.searchParams.has("from") &&
      $page.url.searchParams.get("from") === "profile"
    ) {
      goto("/profile");
    } else {
      goto("/");
    }
  }

  // Check if this page was accessed from within the app (not marketing)
  // Default to showing marketing layout during prerender
  const showMarketingLayout = $derived(
    !browser || !$page.url.searchParams.has("from"),
  );
</script>

<svelte:head>
  <title>Privacy Policy - Room Dates</title>
  <meta
    name="description"
    content="Room Dates privacy policy - how we collect, use, and protect your personal information."
  />
</svelte:head>

{#snippet pageContent()}
  <div class="prose prose-lg max-w-none">
    {#if showMarketingLayout}
      <h1 class="mb-6 text-4xl font-bold text-gray-900">Privacy Policy</h1>
    {/if}

    <p class="mb-8 text-sm text-gray-600">
      Last updated: {new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </p>

    <div class="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
      <p class="text-blue-800">
        <strong>Your privacy matters to us.</strong> This Privacy Policy explains
        how Room Dates ("we," "our," or "us") collects, uses, and protects your personal
        information when you use our platform.
      </p>
    </div>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">
      Information We Collect
    </h2>

    <h3 class="mb-3 text-xl font-semibold text-gray-900">
      Information You Provide
    </h3>
    <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
      <li>Account information (name, email address, profile details)</li>
      <li>Profile photos and room/event images</li>
      <li>Room and event descriptions, preferences, and details</li>
      <li>Messages and communications with other users</li>
      <li>Application messages and responses</li>
    </ul>

    <h3 class="mb-3 text-xl font-semibold text-gray-900">
      Information We Collect Automatically
    </h3>
    <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
      <li>Device information (browser, operating system, device type)</li>
      <li>Usage data (pages visited, features used, time spent)</li>
      <li>
        Location data (if you choose to share it for finding nearby events)
      </li>
      <li>Log data (IP addresses, access times, error logs)</li>
    </ul>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">
      How We Use Your Information
    </h2>

    <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
      <li>Provide and improve our platform services</li>
      <li>Facilitate connections between hosts and guests</li>
      <li>Process event applications and communications</li>
      <li>Send important service notifications and updates</li>
      <li>Ensure platform safety and security</li>
      <li>Analyze usage patterns to improve user experience</li>
      <li>Comply with legal obligations</li>
    </ul>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">Information Sharing</h2>

    <p class="mb-4 text-gray-700">
      We share your information only in these limited circumstances:
    </p>

    <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
      <li>
        <strong>With other users:</strong> Profile information is visible to facilitate
        connections
      </li>
      <li>
        <strong>Service providers:</strong> Trusted third parties who help us operate
        our platform
      </li>
      <li>
        <strong>Legal requirements:</strong> When required by law or to protect our
        rights
      </li>
      <li>
        <strong>Business transfers:</strong> In case of merger, acquisition, or asset
        sale
      </li>
    </ul>

    <div class="mb-8 rounded-xl border border-red-200 bg-red-50 p-6">
      <p class="text-red-800">
        <strong>We never sell your personal information</strong> to third parties
        or use it for advertising purposes outside our platform.
      </p>
    </div>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">Data Security</h2>

    <p class="mb-4 text-gray-700">
      We implement industry-standard security measures including:
    </p>

    <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
      <li>Encryption of data in transit and at rest</li>
      <li>Secure authentication and access controls</li>
      <li>Regular security audits and monitoring</li>
      <li>Strict data access policies for our team</li>
    </ul>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">
      Your Rights and Choices
    </h2>

    <p class="mb-4 text-gray-700">You have the right to:</p>

    <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
      <li>Access, update, or delete your personal information</li>
      <li>Control your profile visibility and privacy settings</li>
      <li>Opt out of non-essential communications</li>
      <li>Request a copy of your data</li>
      <li>Deactivate or delete your account</li>
    </ul>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">Data Retention</h2>

    <p class="mb-6 text-gray-700">
      We retain your information for as long as your account is active or as
      needed to provide services. We may retain certain information for
      legitimate business purposes or legal requirements after account deletion.
    </p>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">Children's Privacy</h2>

    <p class="mb-6 text-gray-700">
      Our platform is not intended for users under 18 years of age. We do not
      knowingly collect personal information from children under 18.
    </p>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">
      Changes to This Policy
    </h2>

    <p class="mb-6 text-gray-700">
      We may update this Privacy Policy from time to time. We will notify you of
      any material changes by email or through our platform.
    </p>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">Contact Us</h2>

    <div class="rounded-xl bg-gray-50 p-6">
      <p class="mb-4 text-gray-700">
        If you have questions about this Privacy Policy or our data practices,
        please contact us:
      </p>
      <ul class="space-y-2 text-gray-700">
        <li><strong>Email:</strong> privacy@roomdates.com</li>
        <li>
          <strong>Support:</strong> Available through your account settings
        </li>
      </ul>
    </div>
  </div>
{/snippet}

{#if showMarketingLayout}
  <MarketingLayout>
    <div class="py-20">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {@render pageContent()}
      </div>
    </div>
  </MarketingLayout>
{:else}
  <!-- App Layout (no marketing header/footer) -->
  <div
    class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
  >
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
          <h1 class="text-xl font-bold text-gray-900">Privacy Policy</h1>
          <div></div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="py-8">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {@render pageContent()}
      </div>
    </div>
  </div>
{/if}
