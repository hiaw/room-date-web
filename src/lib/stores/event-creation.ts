import { writable } from "svelte/store";

export interface EventCreationState {
  // Form fields
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isFlexibleTiming: boolean;
  maxGuests: number | undefined;
  minAge: number | undefined;
  maxAge: number | undefined;
  guestGenderPreferences: string[];
  eventImages: string[];

  // UI state
  saving: boolean;
}

export interface ModalState {
  show: boolean;
  requiredCredits: number;
}

const defaultState: EventCreationState = {
  title: "",
  description: "",
  startDate: "",
  startTime: "19:00",
  endDate: "",
  endTime: "22:00",
  isFlexibleTiming: false,
  maxGuests: undefined,
  minAge: 18,
  maxAge: 65,
  guestGenderPreferences: [],
  eventImages: [],
  saving: false,
};

function createEventCreationStore() {
  const { subscribe, set, update } = writable<EventCreationState>(defaultState);

  return {
    subscribe,
    set,
    update,
    reset: () => set(defaultState),
    setField: <K extends keyof EventCreationState>(
      field: K,
      value: EventCreationState[K],
    ) => update((state) => ({ ...state, [field]: value })),
    setSaving: (saving: boolean) => update((state) => ({ ...state, saving })),
    initializeDefaults: () => {
      const now = Date.now();
      const today = new Date(now);
      const tomorrow = new Date(now + 24 * 60 * 60 * 1000);

      update((state) => ({
        ...state,
        startDate: today.toISOString().split("T")[0],
        endDate: tomorrow.toISOString().split("T")[0],
      }));
    },
  };
}

export const eventCreationStore = createEventCreationStore();

export const modalStateStore = writable<ModalState>({
  show: false,
  requiredCredits: 0,
});
