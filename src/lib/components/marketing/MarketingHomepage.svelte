<script lang="ts">
  import {
    Calendar,
    MessageCircle,
    MapPin,
    Users,
    Sparkles,
    Star,
    ArrowRight,
    CheckCircle,
    Smartphone,
  } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import MarketingLayout from "$lib/components/marketing/MarketingLayout.svelte";

  interface Props {
    passwordResetCode?: string;
  }

  let { passwordResetCode }: Props = $props();

  function handleGetStarted() {
    goto("/auth" + (passwordResetCode ? `?code=${passwordResetCode}` : ""));
  }

  const features = [
    {
      icon: Calendar,
      title: "Create Events",
      description:
        "Host activities in your space - from dinner parties to game nights, book clubs to workout sessions.",
    },
    {
      icon: MapPin,
      title: "Discover Local",
      description:
        "Find amazing events near you and connect with like-minded people in your neighborhood.",
    },
    {
      icon: Users,
      title: "Meet People",
      description:
        "Build genuine connections through shared experiences in comfortable, welcoming spaces.",
    },
    {
      icon: MessageCircle,
      title: "Stay Connected",
      description:
        "Continue conversations after events and build lasting friendships and relationships.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Event Host",
      content:
        "I've hosted over 20 dinner parties through Room Dates. It's incredible how food brings people together - I've made lifelong friends!",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Regular Guest",
      content:
        "As someone new to the city, Room Dates helped me find my community. The book club I joined led to my current friend group.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Host & Guest",
      content:
        "Both hosting game nights and attending cooking classes has enriched my social life beyond what I imagined possible.",
      rating: 5,
    },
  ];

  const benefits = [
    "Verified user profiles for safety",
    "In-app messaging system",
    "Event rating and review system",
    "Location-based discovery",
    "Calendar integration",
    "Photo sharing capabilities",
  ];
</script>

<svelte:head>
  <title>Room Dates - Connect Through Shared Experiences</title>
  <meta
    name="description"
    content="Join Room Dates to host events in your space or discover amazing experiences nearby. Create meaningful connections through shared activities and welcoming spaces."
  />
  <meta
    property="og:title"
    content="Room Dates - Connect Through Shared Experiences"
  />
  <meta
    property="og:description"
    content="Host events in your space or discover amazing experiences nearby. Create meaningful connections through shared activities."
  />
  <meta property="og:type" content="website" />
</svelte:head>

<MarketingLayout>
  <!-- Hero Section -->
  <section class="relative overflow-hidden py-20 lg:py-32">
    <div
      class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
    ></div>
    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1
          class="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
        >
          Connect Through
          <span
            class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Shared Experiences
          </span>
        </h1>

        <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          Room Dates brings people together through meaningful activities in
          welcoming spaces. Host events in your home or discover amazing
          experiences in your neighborhood.
        </p>

        <div
          class="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-center"
        >
          <button
            onclick={handleGetStarted}
            class="group flex items-center space-x-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            <span>Get Started Free</span>
            <ArrowRight
              size={20}
              class="transition-transform group-hover:translate-x-1"
            />
          </button>

          <div class="flex items-center space-x-4">
            <Smartphone size={20} class="text-gray-400" />
            <span class="text-sm text-gray-600"
              >Available on web, iOS & Android</span
            >
          </div>
        </div>

        <!-- Stats -->
        <div class="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">10K+</div>
            <div class="text-sm text-gray-600">Active Users</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">5K+</div>
            <div class="text-sm text-gray-600">Events Hosted</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">25K+</div>
            <div class="text-sm text-gray-600">Connections Made</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">4.9★</div>
            <div class="text-sm text-gray-600">User Rating</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="bg-white py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mb-16 text-center">
        <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl">
          How Room Dates Works
        </h2>
        <p class="mt-4 text-lg text-gray-600">
          Simple steps to start hosting or attending meaningful events
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {#each features as feature, index (feature.title)}
          {@const IconComponent = feature.icon}
          <div
            class="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-purple-200 hover:shadow-lg"
          >
            <div
              class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white"
            >
              <IconComponent size={24} />
            </div>
            <h3 class="mb-3 text-xl font-semibold text-gray-900">
              {feature.title}
            </h3>
            <p class="text-gray-600">{feature.description}</p>

            <!-- Step Number -->
            <div
              class="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-bold text-white"
            >
              {index + 1}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section class="bg-gray-50 py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mb-16 text-center">
        <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl">
          What Our Users Say
        </h2>
        <p class="mt-4 text-lg text-gray-600">
          Real stories from people who found their community through Room Dates
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {#each testimonials as testimonial (testimonial.name)}
          <div class="rounded-2xl border border-white bg-white p-8 shadow-sm">
            <div class="mb-4 flex items-center space-x-1">
              {#each Array.from({ length: testimonial.rating }, (_, i) => i) as starIndex (starIndex)}
                <Star size={16} class="fill-yellow-400 text-yellow-400" />
              {/each}
            </div>

            <blockquote class="mb-6 text-gray-700">
              "{testimonial.content}"
            </blockquote>

            <div class="flex items-center space-x-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-white"
              >
                {testimonial.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div class="font-medium text-gray-900">{testimonial.name}</div>
                <div class="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Benefits Section -->
  <section class="bg-white py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <h2 class="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
            Why Choose Room Dates?
          </h2>
          <p class="mb-8 text-lg text-gray-600">
            We've built the safest, most welcoming platform for people to
            connect through shared experiences in beautiful spaces.
          </p>

          <div class="space-y-4">
            {#each benefits as benefit (benefit)}
              <div class="flex items-center space-x-3">
                <CheckCircle size={20} class="flex-shrink-0 text-green-500" />
                <span class="text-gray-700">{benefit}</span>
              </div>
            {/each}
          </div>
        </div>

        <div class="relative">
          <!-- Placeholder for future image -->
          <div
            class="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100"
          >
            <div class="text-center text-gray-600">
              <Users size={64} class="mx-auto mb-4 text-purple-400" />
              <p class="text-lg font-medium">People Connecting</p>
              <p class="text-sm">Through Shared Experiences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="bg-gradient-to-r from-purple-600 to-pink-600 py-20">
    <div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
      <div class="mb-4 flex items-center justify-center">
        <Sparkles class="mr-2 h-8 w-8 text-purple-200" />
        <h2 class="text-3xl font-bold text-white sm:text-4xl">
          Ready to Connect?
        </h2>
        <Sparkles class="ml-2 h-8 w-8 text-purple-200" />
      </div>

      <p class="mb-8 text-xl text-purple-100">
        Join thousands of people creating meaningful connections through shared
        experiences
      </p>

      <div
        class="flex flex-col items-center gap-6 sm:flex-row sm:justify-center"
      >
        <button
          onclick={handleGetStarted}
          class="group flex items-center space-x-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-purple-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
        >
          <span>Start Your Journey</span>
          <ArrowRight
            size={20}
            class="transition-transform group-hover:translate-x-1"
          />
        </button>

        <p class="text-sm text-purple-200">
          Free to join • No credit card required
        </p>
      </div>
    </div>
  </section>
</MarketingLayout>
