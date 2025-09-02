<script lang="ts">
  import SimpleAuth from "../SimpleAuth.svelte";
  import {
    Heart,
    Calendar,
    MessageCircle,
    MapPin,
    Users,
    Sparkles,
  } from "lucide-svelte";

  interface Props {
    passwordResetCode?: string;
  }

  let { passwordResetCode }: Props = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
  <!-- Hero Section -->
  <div class="relative overflow-hidden">
    <div
      class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
    ></div>
    <div class="relative px-6 py-16">
      <div class="text-center">
        <!-- Logo Area -->
        <div class="mb-6 flex items-center justify-center">
          <div class="flex items-center space-x-2">
            <Heart class="h-8 w-8 fill-purple-600 text-purple-600" />
            <h1
              class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent"
            >
              Room Dates
            </h1>
          </div>
        </div>

        <!-- Tagline -->
        <p class="mx-auto mb-12 max-w-sm text-lg leading-relaxed text-gray-700">
          Connect through shared experiences and create meaningful relationships
        </p>
      </div>
    </div>
  </div>

  <!-- Features Grid -->
  <div class="px-6 pb-12">
    <div class="mx-auto mb-12 grid max-w-lg grid-cols-2 gap-4">
      <div
        class="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm backdrop-blur-sm"
      >
        <Calendar class="mb-2 h-6 w-6 text-purple-600" />
        <h3 class="text-sm font-medium text-gray-900">Create Events</h3>
        <p class="mt-1 text-xs text-gray-600">Host activities in your space</p>
      </div>

      <div
        class="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm backdrop-blur-sm"
      >
        <MapPin class="mb-2 h-6 w-6 text-purple-600" />
        <h3 class="text-sm font-medium text-gray-900">Discover Local</h3>
        <p class="mt-1 text-xs text-gray-600">Find events near you</p>
      </div>

      <div
        class="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm backdrop-blur-sm"
      >
        <Users class="mb-2 h-6 w-6 text-purple-600" />
        <h3 class="text-sm font-medium text-gray-900">Meet People</h3>
        <p class="mt-1 text-xs text-gray-600">
          Connect with like-minded individuals
        </p>
      </div>

      <div
        class="rounded-2xl border border-white/50 bg-white/70 p-4 shadow-sm backdrop-blur-sm"
      >
        <MessageCircle class="mb-2 h-6 w-6 text-purple-600" />
        <h3 class="text-sm font-medium text-gray-900">Stay Connected</h3>
        <p class="mt-1 text-xs text-gray-600">Chat after events</p>
      </div>
    </div>
  </div>

  <!-- Auth Section -->
  <div class="px-6 pb-8">
    <div class="mx-auto max-w-md">
      <div
        class="rounded-3xl border border-white/50 bg-white/90 p-8 shadow-xl backdrop-blur-md"
      >
        <!-- Welcome Text -->
        <div class="mb-6 text-center">
          <div class="mb-2 inline-flex items-center space-x-1">
            <Sparkles class="h-5 w-5 text-purple-500" />
            <span class="text-sm font-medium text-purple-600"
              >Ready to start?</span
            >
            <Sparkles class="h-5 w-5 text-purple-500" />
          </div>
          <h2 class="mb-2 text-xl font-semibold text-gray-900">
            Join Room Dates
          </h2>
          <p class="text-sm text-gray-600">
            Sign up to create rooms, host events, and connect with amazing
            people
          </p>
        </div>

        <SimpleAuth {passwordResetCode} />
      </div>
    </div>
  </div>

  <!-- Bottom Gradient -->
  <div class="h-16 bg-gradient-to-t from-purple-100/50 to-transparent"></div>
</div>
