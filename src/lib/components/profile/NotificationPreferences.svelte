<script lang="ts">
  import { Bell } from "lucide-svelte";

  interface Props {
    pushNotifications: boolean;
    emailNotifications: boolean;
    messageNotifications: boolean;
    applicationNotifications: boolean;
    eventReminderNotifications: boolean;
    onPushNotificationsChange: (value: boolean) => void;
    onEmailNotificationsChange: (value: boolean) => void;
    onMessageNotificationsChange: (value: boolean) => void;
    onApplicationNotificationsChange: (value: boolean) => void;
    onEventReminderNotificationsChange: (value: boolean) => void;
  }

  let {
    pushNotifications,
    emailNotifications,
    messageNotifications,
    applicationNotifications,
    eventReminderNotifications,
    onPushNotificationsChange,
    onEmailNotificationsChange,
    onMessageNotificationsChange,
    onApplicationNotificationsChange,
    onEventReminderNotificationsChange,
  }: Props = $props();
</script>

<div
  class="rounded-3xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
>
  <div class="border-b border-gray-100 px-8 py-6">
    <h3 class="flex items-center space-x-2 text-lg font-semibold text-gray-900">
      <Bell size={20} />
      <span>Notifications</span>
    </h3>
    <p class="mt-1 text-sm text-gray-600">
      Choose what notifications you'd like to receive
    </p>
  </div>

  <div class="space-y-4 p-8">
    <label class="flex items-center justify-between">
      <div>
        <span class="font-medium text-gray-900">Push Notifications</span>
        <p class="text-sm text-gray-600">Get notified on your device</p>
      </div>
      <input
        type="checkbox"
        checked={pushNotifications}
        onchange={(e) =>
          onPushNotificationsChange((e.target as HTMLInputElement).checked)}
        class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
    </label>

    <label class="flex items-center justify-between">
      <div>
        <span class="font-medium text-gray-900">Email Notifications</span>
        <p class="text-sm text-gray-600">Receive updates via email</p>
      </div>
      <input
        type="checkbox"
        checked={emailNotifications}
        onchange={(e) =>
          onEmailNotificationsChange((e.target as HTMLInputElement).checked)}
        class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
    </label>

    <label class="flex items-center justify-between">
      <div>
        <span class="font-medium text-gray-900">Message Notifications</span>
        <p class="text-sm text-gray-600">New messages from connections</p>
      </div>
      <input
        type="checkbox"
        checked={messageNotifications}
        onchange={(e) =>
          onMessageNotificationsChange((e.target as HTMLInputElement).checked)}
        class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
    </label>

    <label class="flex items-center justify-between">
      <div>
        <span class="font-medium text-gray-900">Application Notifications</span>
        <p class="text-sm text-gray-600">When someone applies to your events</p>
      </div>
      <input
        type="checkbox"
        checked={applicationNotifications}
        onchange={(e) =>
          onApplicationNotificationsChange(
            (e.target as HTMLInputElement).checked,
          )}
        class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
    </label>

    <label class="flex items-center justify-between">
      <div>
        <span class="font-medium text-gray-900">Event Reminders</span>
        <p class="text-sm text-gray-600">Reminders for upcoming events</p>
      </div>
      <input
        type="checkbox"
        checked={eventReminderNotifications}
        onchange={(e) =>
          onEventReminderNotificationsChange(
            (e.target as HTMLInputElement).checked,
          )}
        class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
    </label>
  </div>
</div>
