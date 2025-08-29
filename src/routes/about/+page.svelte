<script lang="ts">
  import { ArrowLeft } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { goto } from "$app/navigation";

  function handleBack() {
    goto("/");
  }
</script>

<svelte:head>
  <title>About Us - Room Dates</title>
  <meta
    name="description"
    content="Learn about Room Dates - connecting people through shared spaces and experiences."
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
        <h1 class="text-xl font-bold text-gray-900">About Us</h1>
        <div></div>
      </div>
    </div>
  </div>

  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="prose prose-lg max-w-none">
      <h1 class="mb-6 text-4xl font-bold text-gray-900">About Room Dates</h1>

      <p class="mb-8 text-xl text-gray-700">
        Room Dates is a platform that connects people through shared spaces and
        meaningful experiences. We believe that the best connections happen when
        people come together in comfortable, welcoming environments.
      </p>

      <div class="my-12 grid gap-8 md:grid-cols-2">
        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 class="mb-3 text-xl font-semibold text-purple-600">
            Our Mission
          </h3>
          <p class="text-gray-700">
            To create authentic connections by bringing people together in
            beautiful spaces for shared experiences, dates, and social
            gatherings.
          </p>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 class="mb-3 text-xl font-semibold text-purple-600">Our Vision</h3>
          <p class="text-gray-700">
            A world where meaningful relationships form naturally through shared
            experiences in welcoming spaces, fostering genuine human connection.
          </p>
        </div>
      </div>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">How It Works</h2>

      <div class="mb-12 space-y-6">
        <div class="flex items-start space-x-4">
          <div
            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100"
          >
            <span class="font-semibold text-purple-600">1</span>
          </div>
          <div>
            <h3 class="mb-2 font-semibold text-gray-900">Create Your Space</h3>
            <p class="text-gray-700">
              List your room or space with photos, amenities, and hosting
              preferences.
            </p>
          </div>
        </div>

        <div class="flex items-start space-x-4">
          <div
            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100"
          >
            <span class="font-semibold text-purple-600">2</span>
          </div>
          <div>
            <h3 class="mb-2 font-semibold text-gray-900">Host Events</h3>
            <p class="text-gray-700">
              Create events in your space - from dinner parties to game nights,
              book clubs to workout sessions.
            </p>
          </div>
        </div>

        <div class="flex items-start space-x-4">
          <div
            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100"
          >
            <span class="font-semibold text-purple-600">3</span>
          </div>
          <div>
            <h3 class="mb-2 font-semibold text-gray-900">Connect & Discover</h3>
            <p class="text-gray-700">
              Browse local events, apply to join experiences that interest you,
              and meet like-minded people.
            </p>
          </div>
        </div>

        <div class="flex items-start space-x-4">
          <div
            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100"
          >
            <span class="font-semibold text-purple-600">4</span>
          </div>
          <div>
            <h3 class="mb-2 font-semibold text-gray-900">
              Build Relationships
            </h3>
            <p class="text-gray-700">
              Form genuine connections through shared experiences in
              comfortable, curated spaces.
            </p>
          </div>
        </div>
      </div>

      <h2 class="mb-4 text-2xl font-bold text-gray-900">Our Values</h2>

      <div class="mb-12 grid gap-6 md:grid-cols-3">
        <div class="text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100"
          >
            <span class="text-2xl">🤝</span>
          </div>
          <h3 class="mb-2 font-semibold text-gray-900">Authentic Connection</h3>
          <p class="text-sm text-gray-600">
            We prioritize genuine relationships over superficial interactions.
          </p>
        </div>

        <div class="text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100"
          >
            <span class="text-2xl">🏠</span>
          </div>
          <h3 class="mb-2 font-semibold text-gray-900">Safe Spaces</h3>
          <p class="text-sm text-gray-600">
            Every space should feel welcoming, comfortable, and secure for all
            participants.
          </p>
        </div>

        <div class="text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100"
          >
            <span class="text-2xl">🌟</span>
          </div>
          <h3 class="mb-2 font-semibold text-gray-900">Quality Experiences</h3>
          <p class="text-sm text-gray-600">
            We focus on creating memorable, meaningful experiences that bring
            people together.
          </p>
        </div>
      </div>

      <div class="rounded-2xl bg-purple-50 p-8 text-center">
        <h2 class="mb-4 text-2xl font-bold text-gray-900">
          Ready to Get Started?
        </h2>
        <p class="mb-6 text-gray-700">
          Join our community of hosts and guests creating meaningful connections
          through shared spaces.
        </p>
        <Button onclick={() => goto("/")} class="inline-flex">
          Start Exploring
        </Button>
      </div>
    </div>
  </div>
</div>
