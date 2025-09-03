<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { User, Calendar, MessageCircle, Edit3, Search } from "lucide-svelte";
  import { formatDistanceToNow } from "date-fns";
  import { goto } from "$app/navigation";
  import type { Id } from "../../../convex/_generated/dataModel";
  import ConnectionNoteEditor from "./ConnectionNoteEditor.svelte";
  import LoadingSpinner from "../ui/LoadingSpinner.svelte";

  interface Connection {
    _id: Id<"connections">;
    _creationTime: number;
    otherUser?: {
      profile?: {
        displayName?: string;
      } | null;
    };
    connectedViaEventId?: Id<"events">;
    lastMessage?: {
      content: string;
      _creationTime: number;
    };
  }

  interface ConnectionNote {
    _id: Id<"connectionNotes">;
    connectionId: Id<"connections">;
    userId: Id<"users">;
    nickname?: string;
    notes?: string;
    tags?: string[];
    lastUpdated: number;
  }

  // State
  let searchQuery = $state("");
  let editingConnection = $state<Id<"connections"> | null>(null);
  let isNoteEditorOpen = $state(false);

  // Queries
  let connectionsQueryResult = useQuery(api.connections.getUserConnections, {});
  let connectionNotesQueryResult = useQuery(
    api.connectionNotes.index.getUserConnectionNotes,
    {},
  );

  let connections = $derived(
    (connectionsQueryResult?.data as Connection[]) ?? [],
  );
  let connectionNotes = $derived(
    (connectionNotesQueryResult?.data as ConnectionNote[]) ?? [],
  );
  let loading = $derived(
    (connectionsQueryResult?.isLoading ?? true) ||
      (connectionNotesQueryResult?.isLoading ?? true),
  );

  // Create a map of connection notes for quick lookup
  let notesMap = $derived(
    new Map(connectionNotes.map((note) => [note.connectionId, note])),
  );

  // Enhanced connections with notes
  let connectionsWithNotes = $derived(
    connections.map((connection) => {
      const note = notesMap.get(connection._id);
      const displayName =
        note?.nickname ||
        connection.otherUser?.profile?.displayName ||
        "Unknown User";

      return {
        ...connection,
        displayName,
        note,
        searchableText:
          `${displayName} ${note?.notes || ""} ${note?.tags?.join(" ") || ""}`.toLowerCase(),
      };
    }),
  );

  // Filtered connections
  let filteredConnections = $derived(
    connectionsWithNotes.filter((connection) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return connection.searchableText.includes(searchLower);
    }),
  );

  const convex = useConvexClient();

  function getUserInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function openNoteEditor(connectionId: Id<"connections">) {
    editingConnection = connectionId;
    isNoteEditorOpen = true;
  }

  function closeNoteEditor() {
    editingConnection = null;
    isNoteEditorOpen = false;
  }

  async function saveConnectionNote(data: {
    nickname?: string;
    notes?: string;
    tags?: string[];
  }) {
    if (!editingConnection) return;

    await convex.mutation(api.connectionNotes.index.updateConnectionNote, {
      connectionId: editingConnection,
      ...data,
    });
  }

  function openConversation(connectionId: Id<"connections">) {
    goto(`/messages/${connectionId}`);
  }

  function handleDiscoverClick() {
    goto("/discover");
  }

  // Get currently editing connection data
  let editingConnectionData = $derived(
    editingConnection
      ? connectionsWithNotes.find((c) => c._id === editingConnection)
      : null,
  );
</script>

<div
  class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
>
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-lg font-semibold text-gray-900">My Connections</h3>
    <span class="text-sm text-gray-500">{connections.length} total</span>
  </div>

  <!-- Search -->
  {#if connections.length > 0}
    <div class="relative mb-4">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search connections, notes, or tags..."
        class="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
      />
    </div>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center py-8">
      <LoadingSpinner />
    </div>
  {:else if filteredConnections.length === 0}
    <div class="py-8 text-center">
      {#if searchQuery}
        <div class="text-center">
          <Search class="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <h4 class="mb-2 font-medium text-gray-900">No matches found</h4>
          <p class="text-sm text-gray-500">Try adjusting your search terms.</p>
        </div>
      {:else if connections.length === 0}
        <div>
          <User class="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h4 class="mb-2 text-lg font-semibold text-gray-900">
            No Connections Yet
          </h4>
          <p class="mb-6 text-gray-600">
            Apply to events and get approved to start building your network!
          </p>
          <button
            onclick={handleDiscoverClick}
            class="rounded-xl bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
          >
            Discover Events
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="space-y-3">
      {#each filteredConnections as connection (connection._id)}
        <div
          class="group rounded-xl border border-gray-100 bg-white p-4 transition-all hover:shadow-md"
        >
          <div class="flex items-center space-x-4">
            <!-- Avatar -->
            <div
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
            >
              <span class="text-sm font-medium text-white">
                {getUserInitials(connection.displayName)}
              </span>
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-start justify-between">
                <div class="min-w-0">
                  <h4 class="truncate font-semibold text-gray-900">
                    {connection.displayName}
                  </h4>
                  {#if connection.note?.nickname && connection.note.nickname !== connection.otherUser?.profile?.displayName}
                    <p class="text-xs text-gray-500">
                      aka {connection.otherUser?.profile?.displayName ||
                        "Unknown"}
                    </p>
                  {/if}
                </div>
                <span class="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(connection._creationTime), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <!-- Connection details -->
              <div
                class="mb-2 flex items-center space-x-2 text-sm text-gray-600"
              >
                <Calendar size={14} />
                <span class="truncate">Connected at an event</span>
              </div>

              <!-- Notes preview -->
              {#if connection.note?.notes}
                <p class="mb-2 line-clamp-2 text-sm text-gray-600">
                  {connection.note.notes}
                </p>
              {/if}

              <!-- Tags -->
              {#if connection.note?.tags && connection.note.tags.length > 0}
                <div class="mb-2 flex flex-wrap gap-1">
                  {#each connection.note.tags.slice(0, 3) as tag}
                    <span
                      class="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700"
                    >
                      {tag}
                    </span>
                  {/each}
                  {#if connection.note.tags.length > 3}
                    <span class="text-xs text-gray-500">
                      +{connection.note.tags.length - 3} more
                    </span>
                  {/if}
                </div>
              {/if}

              <!-- Last message -->
              {#if connection.lastMessage}
                <div class="text-xs text-gray-500">
                  Last message: {formatDistanceToNow(
                    new Date(connection.lastMessage._creationTime),
                    { addSuffix: true },
                  )}
                </div>
              {/if}
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2">
              <button
                onclick={() => openNoteEditor(connection._id)}
                class="rounded-lg p-2 text-gray-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-50"
                title="Edit note"
              >
                <Edit3 size={16} />
              </button>
              <button
                onclick={() => openConversation(connection._id)}
                class="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-50"
                title="Send message"
              >
                <MessageCircle size={18} />
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Note Editor Modal -->
{#if editingConnectionData}
  <ConnectionNoteEditor
    connectionId={editingConnectionData._id}
    currentNickname={editingConnectionData.note?.nickname}
    currentNotes={editingConnectionData.note?.notes}
    currentTags={editingConnectionData.note?.tags}
    otherUserName={editingConnectionData.otherUser?.profile?.displayName ||
      "Unknown User"}
    isOpen={isNoteEditorOpen}
    onSave={saveConnectionNote}
    onClose={closeNoteEditor}
  />
{/if}
