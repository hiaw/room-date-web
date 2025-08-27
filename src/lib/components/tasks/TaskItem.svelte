<script lang="ts">
  import { useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { sanitizeText } from "../../utils/sanitization.js";
  import type { Id } from "../../../convex/_generated/dataModel.js";

  interface Props {
    task: {
      _id: Id<"tasks">;
      text: string;
      isCompleted: boolean;
    };
  }

  let { task }: Props = $props();

  const convex = useConvexClient();

  // Sanitize task text for display
  const sanitizedTaskText = $derived(sanitizeText(task.text));

  async function handleToggle() {
    try {
      await convex.mutation(api.tasks.toggle, { id: task._id });
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  }
</script>

<div
  class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
>
  <button
    onclick={handleToggle}
    class="cursor-pointer text-xl transition-transform hover:scale-110"
    aria-label={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
  >
    {task.isCompleted ? "☑️" : "☐"}
  </button>
  <span
    class="flex-1 text-gray-900 {task.isCompleted
      ? 'line-through opacity-60'
      : ''}">{sanitizedTaskText}</span
  >
</div>
