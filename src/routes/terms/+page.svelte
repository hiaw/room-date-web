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
  <title>Terms of Service - Room Dates</title>
  <meta
    name="description"
    content="Room Dates terms of service - the rules and guidelines for using our platform."
  />
</svelte:head>

{#snippet pageContent()}
  <div class="prose prose-lg max-w-none">
    {#if showMarketingLayout}
      <h1 class="mb-6 text-4xl font-bold text-gray-900">Terms of Service</h1>
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
        <strong>Welcome to Room Dates!</strong> By using our platform, you agree
        to these Terms of Service. Please read them carefully before using our services.
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

    <h2 class="mb-4 text-2xl font-bold text-gray-900">5. Platform Safety</h2>

    <p class="mb-4 text-gray-700">
      We are committed to maintaining a safe environment for all users:
    </p>

    <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
      <li>
        All users must verify their identity before hosting or attending events
      </li>
      <li>We provide reporting tools for inappropriate behavior</li>
      <li>
        Hosts are responsible for ensuring their spaces meet safety standards
      </li>
      <li>
        We reserve the right to suspend or ban users who violate our policies
      </li>
    </ul>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">6. Payments and Fees</h2>

    <p class="mb-4 text-gray-700">
      Our platform may involve various fees and payment terms:
    </p>

    <ul class="mb-6 list-inside list-disc space-y-2 text-gray-700">
      <li>Some events may require payment or deposits</li>
      <li>Platform service fees may apply to certain transactions</li>
      <li>Refund policies are determined by individual hosts</li>
      <li>All payments are processed securely through our payment partners</li>
    </ul>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">
      7. Intellectual Property
    </h2>

    <p class="mb-6 text-gray-700">
      You retain ownership of content you post, but grant us necessary rights to
      operate the platform. You may not use copyrighted material without
      permission or violate others' intellectual property rights.
    </p>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">8. Privacy and Data</h2>

    <p class="mb-6 text-gray-700">
      Your privacy is important to us. Please review our Privacy Policy to
      understand how we collect, use, and protect your personal information.
    </p>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">9. Disclaimers</h2>

    <p class="mb-6 text-gray-700">
      Room Dates is provided "as is" without warranties. We do not guarantee the
      accuracy of user-generated content or the behavior of other users. Use the
      platform at your own risk.
    </p>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">
      10. Limitation of Liability
    </h2>

    <p class="mb-6 text-gray-700">
      We are not liable for damages arising from your use of the platform,
      interactions with other users, or events attended through our service. Our
      liability is limited to the maximum extent permitted by law.
    </p>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">11. Indemnification</h2>

    <p class="mb-6 text-gray-700">
      You agree to indemnify and hold harmless Room Dates from claims arising
      from your use of the platform, your content, or your violation of these
      terms.
    </p>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">12. Termination</h2>

    <p class="mb-6 text-gray-700">
      We may terminate or suspend your account at any time for violations of
      these terms. You may also terminate your account at any time through your
      account settings.
    </p>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">13. Changes to Terms</h2>

    <p class="mb-6 text-gray-700">
      We may update these Terms of Service from time to time. We will notify you
      of material changes by email or through the platform. Continued use after
      changes constitutes acceptance of the new terms.
    </p>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">14. Governing Law</h2>

    <p class="mb-6 text-gray-700">
      These Terms are governed by the laws of [Jurisdiction]. Any disputes will
      be resolved through binding arbitration in [Location].
    </p>

    <h2 class="mb-4 text-2xl font-bold text-gray-900">
      15. Contact Information
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
          <h1 class="text-xl font-bold text-gray-900">Terms of Service</h1>
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
