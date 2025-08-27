import { writable } from "svelte/store";
import { browser } from "$app/environment";

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

function createNetworkStore() {
  const { subscribe, set, update } = writable<NetworkStatus>({
    isOnline: browser ? navigator.onLine : true,
    wasOffline: false,
  });

  // Only add event listeners on the client side
  if (browser) {
    window.addEventListener("online", () => {
      update(() => ({
        isOnline: true,
        wasOffline: true,
      }));
    });

    window.addEventListener("offline", () => {
      update(() => ({
        isOnline: false,
        wasOffline: true,
      }));
    });
  }

  return {
    subscribe,
    set,
    update,
  };
}

export const networkStore = createNetworkStore();
