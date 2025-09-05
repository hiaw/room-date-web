<script lang="ts">
  import {
    ArrowLeft,
    MessageCircle,
    Shield,
    Home,
    Users,
    Calendar,
    HelpCircle,
  } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Button from "$lib/components/ui/Button.svelte";

  function handleBack() {
    // Check if accessed from profile
    if (
      $page.url.searchParams.has("from") &&
      $page.url.searchParams.get("from") === "profile"
    ) {
      goto("/profile");
    } else {
      goto("/");
    }
  }

  function getNavUrl(path: string): string {
    // Preserve the from parameter if it exists
    const fromParam = $page.url.searchParams.get("from");
    return fromParam ? `${path}?from=${fromParam}` : path;
  }

  const faqs = [
    {
      question: "How do I create my first room?",
      answer:
        "Go to 'My Rooms' and click 'Create Room'. Add photos, description, location, and amenities. Make sure to be accurate and welcoming in your descriptions.",
    },
    {
      question: "How do event applications work?",
      answer:
        "When you apply to an event, the host receives your application and can approve, reject, or request more information. You'll get notified of their decision.",
    },
    {
      question: "Is Room Dates safe?",
      answer:
        "We prioritize safety through user verification, secure messaging, and community guidelines. Always meet in public first and trust your instincts.",
    },
    {
      question: "How do I report inappropriate behavior?",
      answer:
        "Use the report button on user profiles or events, or contact our support team directly. We take all reports seriously and investigate promptly.",
    },
    {
      question: "Can I cancel an event?",
      answer:
        "Yes, but please cancel as early as possible to be respectful to applicants. Frequent cancellations may affect your host reputation.",
    },
    {
      question: "How do I update my preferences?",
      answer:
        "Go to Profile > Preferences to update your discovery settings, notification preferences, and privacy settings.",
    },
  ];

  let openFaq = $state<number | null>(null);

  function toggleFaq(index: number) {
    openFaq = openFaq === index ? null : index;
  }
</script>

<svelte:head>
  <title>Help & Support - Room Dates</title>
  <meta
    name="description"
    content="Get help with Room Dates - FAQs, guides, and support resources."
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
        <h1 class="text-xl font-bold text-gray-900">Help & Support</h1>
        <div></div>
      </div>
    </div>
  </div>

  <div class="mx-auto max-w-4xl px-4 py-8">
    <!-- Welcome Section -->
    <div class="mb-12 text-center">
      <h1 class="mb-4 text-4xl font-bold text-gray-900">
        How can we help you?
      </h1>
      <p class="text-xl text-gray-600">
        Find answers to common questions and get the support you need.
      </p>
    </div>

    <!-- Quick Actions -->
    <div class="mb-12 grid gap-6 md:grid-cols-3">
      <a
        href={getNavUrl("/about")}
        class="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <div
          class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100"
        >
          <HelpCircle class="text-purple-600" size={24} />
        </div>
        <h3 class="mb-2 font-semibold text-gray-900">About Room Dates</h3>
        <p class="text-sm text-gray-600">
          Learn how our platform works and our mission.
        </p>
      </a>

      <a
        href={getNavUrl("/privacy")}
        class="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <div
          class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100"
        >
          <Shield class="text-purple-600" size={24} />
        </div>
        <h3 class="mb-2 font-semibold text-gray-900">Privacy & Safety</h3>
        <p class="text-sm text-gray-600">
          Understand how we protect your data and safety.
        </p>
      </a>

      <a
        href={getNavUrl("/terms")}
        class="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <div
          class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100"
        >
          <MessageCircle class="text-purple-600" size={24} />
        </div>
        <h3 class="mb-2 font-semibold text-gray-900">Terms of Service</h3>
        <p class="text-sm text-gray-600">
          Read our platform rules and guidelines.
        </p>
      </a>
    </div>

    <!-- Getting Started Guide -->
    <div class="mb-12">
      <h2 class="mb-6 text-2xl font-bold text-gray-900">Getting Started</h2>

      <div class="grid gap-6 md:grid-cols-2">
        <div class="rounded-2xl border border-gray-100 bg-white p-6">
          <div class="mb-4 flex items-center">
            <Home class="mr-3 text-purple-600" size={24} />
            <h3 class="font-semibold text-gray-900">For Hosts</h3>
          </div>
          <ol class="space-y-2 text-sm text-gray-700">
            <li>1. Complete your profile with photos and bio</li>
            <li>2. Create your first room with detailed descriptions</li>
            <li>3. Host your first event with clear expectations</li>
            <li>4. Review applications and approve guests</li>
            <li>5. Build your reputation through great experiences</li>
          </ol>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-white p-6">
          <div class="mb-4 flex items-center">
            <Users class="mr-3 text-purple-600" size={24} />
            <h3 class="font-semibold text-gray-900">For Guests</h3>
          </div>
          <ol class="space-y-2 text-sm text-gray-700">
            <li>1. Set up your profile to introduce yourself</li>
            <li>2. Browse events that interest you</li>
            <li>3. Apply with thoughtful messages</li>
            <li>4. Attend events and connect with people</li>
            <li>5. Leave reviews to help the community</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- FAQs -->
    <div class="mb-12">
      <h2 class="mb-6 text-2xl font-bold text-gray-900">
        Frequently Asked Questions
      </h2>

      <div class="space-y-4">
        {#each faqs as faq, index (index)}
          <div
            class="overflow-hidden rounded-xl border border-gray-100 bg-white"
          >
            <button
              onclick={() => toggleFaq(index)}
              class="w-full px-6 py-4 text-left transition-colors hover:bg-gray-50"
            >
              <div class="flex items-center justify-between">
                <h3 class="font-medium text-gray-900">{faq.question}</h3>
                <div class="ml-4 flex-shrink-0">
                  <div
                    class="transform transition-transform {openFaq === index
                      ? 'rotate-180'
                      : ''}"
                  >
                    ▼
                  </div>
                </div>
              </div>
            </button>

            {#if openFaq === index}
              <div class="px-6 pb-4">
                <p class="text-gray-700">{faq.answer}</p>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Contact Support -->
    <div class="rounded-2xl bg-purple-50 p-8 text-center">
      <h2 class="mb-4 text-2xl font-bold text-gray-900">Still need help?</h2>
      <p class="mb-6 text-gray-700">
        Can't find what you're looking for? Our support team is here to help.
      </p>
      <div class="flex flex-col justify-center gap-4 sm:flex-row">
        <Button variant="primary">
          <MessageCircle size={16} class="mr-2" />
          Contact Support
        </Button>
        <Button variant="secondary" onclick={() => goto("/discover")}>
          <Calendar size={16} class="mr-2" />
          Browse Events
        </Button>
      </div>
    </div>
  </div>
</div>
