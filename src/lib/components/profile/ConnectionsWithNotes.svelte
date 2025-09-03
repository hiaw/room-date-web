<script lang="ts">
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { goto } from "$app/navigation";
  import type { Id } from "../../../convex/_generated/dataModel";
  import type {
    ConnectionWithDetails,
    ConnectionNote,
    ConnectionNoteData,
  } from "$lib/types/domains/connections.js";
  import { createEnhancedConnections } from "$lib/utils/connectionsStore.js";
  import ConnectionNoteEditor from "./ConnectionNoteEditor.svelte";
  import ConnectionsSearch from "../connections/ConnectionsSearch.svelte";
  import ConnectionsWithNotesList from "../connections/ConnectionsWithNotesList.svelte";

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
    (connectionsQueryResult?.data as ConnectionWithDetails[]) ?? [],
  );
  let connectionNotes = $derived(
    (connectionNotesQueryResult?.data as ConnectionNote[]) ?? [],
  );
  let loading = $derived(
    (connectionsQueryResult?.isLoading ?? true) ||
      (connectionNotesQueryResult?.isLoading ?? true),
  );

  // Enhanced connections with notes using extracted logic
  let connectionsWithNotes = $derived(
    createEnhancedConnections(connections, connectionNotes),
  );

  const convex = useConvexClient();

  function openNoteEditor(connectionId: Id<"connections">) {
    editingConnection = connectionId;
    isNoteEditorOpen = true;
  }

  function closeNoteEditor() {
    editingConnection = null;
    isNoteEditorOpen = false;
  }

  async function saveConnectionNote(data: ConnectionNoteData) {
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

  function handleSearchChange(query: string) {
    searchQuery = query;
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

  <!-- Search Component -->
  <ConnectionsSearch
    {searchQuery}
    onSearchChange={handleSearchChange}
    connectionCount={connections.length}
  />

  <!-- Connections List Component -->
  <ConnectionsWithNotesList
    connections={connectionsWithNotes}
    {loading}
    {searchQuery}
    onEdit={openNoteEditor}
    onMessage={openConversation}
    onDiscoverClick={handleDiscoverClick}
  />
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
