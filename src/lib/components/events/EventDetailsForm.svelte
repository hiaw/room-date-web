<script lang="ts">
  interface Props {
    title: string;
    description: string;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
  }

  let { title, description, onTitleChange, onDescriptionChange }: Props =
    $props();
</script>

<div class="space-y-4">
  <h2 class="text-lg font-semibold text-gray-900">Event Details</h2>

  <div>
    <label for="title" class="mb-1 block text-sm font-medium text-gray-700">
      Event Title *
    </label>
    <input
      id="title"
      type="text"
      value={title}
      oninput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
      placeholder="e.g. Wine & Paint Night, Game Night, Dinner Party"
      class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
      required
    />
  </div>

  <div>
    <label
      for="description"
      class="mb-1 block text-sm font-medium text-gray-700"
    >
      Description
    </label>
    <textarea
      id="description"
      value={description}
      oninput={(e) =>
        onDescriptionChange((e.target as HTMLTextAreaElement).value)}
      placeholder="What's the event about? What should people expect? What should they bring?"
      rows="4"
      class="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
    ></textarea>
  </div>
</div>
