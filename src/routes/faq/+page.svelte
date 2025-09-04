<script lang="ts">
  import { ChevronDown, ChevronUp } from "lucide-svelte";
  import MarketingLayout from "$lib/components/marketing/MarketingLayout.svelte";

  let openFaq = $state<number | null>(null);

  function toggleFaq(index: number) {
    openFaq = openFaq === index ? null : index;
  }

  const faqs = [
    {
      question: "What is Room Dates?",
      answer:
        "Room Dates is a platform that connects people through shared experiences in welcoming spaces. You can host events in your home or space, or discover and attend events hosted by others in your area.",
    },
    {
      question: "How do I get started as a host?",
      answer:
        "Simply sign up, complete your profile, and create your first room listing with photos and details about your space. Then you can start hosting events like dinner parties, game nights, book clubs, or any activity you're passionate about.",
    },
    {
      question: "How do I find events to attend?",
      answer:
        "Browse the Discover page to see events near you. You can filter by category, date, and distance. When you find an event you're interested in, send an application message to the host explaining why you'd like to attend.",
    },
    {
      question: "Is Room Dates safe?",
      answer:
        "Safety is our top priority. We verify user profiles, provide secure messaging, and have reporting tools. We recommend meeting hosts or guests in public first, trusting your instincts, and following our safety guidelines.",
    },
    {
      question: "How much does it cost?",
      answer:
        "Room Dates is free to join and use. Some hosts may charge for events that include food, materials, or special activities, but many events are completely free. Any costs are clearly displayed in the event details.",
    },
    {
      question: "Can I use Room Dates on my phone?",
      answer:
        "Yes! Room Dates is available as a web app that works great on phones, tablets, and computers. We also have dedicated iOS and Android apps for the full mobile experience.",
    },
    {
      question: "What types of events can I host?",
      answer:
        "Almost anything! Popular events include dinner parties, game nights, book clubs, workout sessions, movie nights, cooking classes, art workshops, and networking meetups. As long as it's legal and appropriate, you can host it.",
    },
    {
      question: "How do I communicate with other users?",
      answer:
        "Room Dates has a built-in secure messaging system. You can chat with hosts when applying to events, and with other attendees once you're accepted. All communication stays within the platform for your safety.",
    },
    {
      question: "What if I need to cancel an event?",
      answer:
        "Life happens! You can cancel events through your dashboard. We ask that you give as much notice as possible and communicate with attendees. Frequent cancellations may affect your hosting reputation.",
    },
    {
      question: "How do reviews work?",
      answer:
        "After events, both hosts and guests can leave reviews for each other. This helps build trust in the community and helps others know what to expect. Reviews are public and help maintain quality experiences.",
    },
    {
      question: "Can I bring friends to events?",
      answer:
        "Only if the host specifically allows it in their event description. Most events have limited capacity, so it's important to respect the host's guidelines and not bring uninvited guests.",
    },
    {
      question: "What if there's a problem during an event?",
      answer:
        "Contact our support team immediately through the app. We have 24/7 support for urgent safety concerns. For non-urgent issues, try to resolve them directly with the other party first, then reach out to our team if needed.",
    },
  ];
</script>

<svelte:head>
  <title>FAQ - Room Dates</title>
  <meta
    name="description"
    content="Frequently asked questions about Room Dates - learn how to host events, attend experiences, and connect with people through shared activities."
  />
</svelte:head>

<MarketingLayout>
  <section class="py-20">
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-16 text-center">
        <h1 class="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p class="mx-auto max-w-2xl text-lg text-gray-600">
          Everything you need to know about hosting events, attending
          experiences, and connecting with people through Room Dates.
        </p>
      </div>

      <!-- FAQ List -->
      <div class="space-y-4">
        {#each faqs as faq, index (faq.question)}
          <div
            class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <button
              onclick={() => toggleFaq(index)}
              class="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
            >
              <h3 class="pr-4 text-lg font-medium text-gray-900">
                {faq.question}
              </h3>
              {#if openFaq === index}
                <ChevronUp size={20} class="flex-shrink-0 text-purple-600" />
              {:else}
                <ChevronDown size={20} class="flex-shrink-0 text-gray-400" />
              {/if}
            </button>

            {#if openFaq === index}
              <div class="px-6 pb-4">
                <div class="border-t border-gray-100 pt-4">
                  <p class="leading-relaxed text-gray-700">
                    {faq.answer}
                  </p>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Contact Section -->
      <div class="mt-16 text-center">
        <div class="rounded-2xl bg-gray-50 p-8">
          <h2 class="mb-4 text-2xl font-bold text-gray-900">
            Still have questions?
          </h2>
          <p class="mb-6 text-gray-600">
            Can't find the answer you're looking for? Our support team is here
            to help.
          </p>
          <div class="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="mailto:support@roomdates.com"
              class="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700"
            >
              Contact Support
            </a>
            <a
              href="/auth"
              class="inline-flex items-center justify-center rounded-full border border-purple-600 px-6 py-3 font-medium text-purple-600 transition-colors hover:bg-purple-50"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</MarketingLayout>
