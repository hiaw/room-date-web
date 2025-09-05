import { writable } from "svelte/store";

export interface OnboardingState {
  step: number;
  saving: boolean;

  // Form data
  displayName: string;
  bio: string;
  location: string;
  latitude?: number;
  longitude?: number;
  locationSharing: boolean;
  gettingLocation: boolean;

  // Validation errors
  validationErrors: {
    displayName?: string;
    location?: string;
    save?: string;
  };
}

const defaultState: OnboardingState = {
  step: 1,
  saving: false,
  displayName: "",
  bio: "",
  location: "",
  latitude: undefined,
  longitude: undefined,
  locationSharing: true,
  gettingLocation: false,
  validationErrors: {},
};

function createOnboardingStore() {
  const { subscribe, set, update } = writable<OnboardingState>(defaultState);

  return {
    subscribe,
    set,
    update,
    reset: () => set(defaultState),
    setField: <K extends keyof OnboardingState>(
      field: K,
      value: OnboardingState[K],
    ) => update((state) => ({ ...state, [field]: value })),
    setError: (
      field: keyof OnboardingState["validationErrors"],
      error?: string,
    ) =>
      update((state) => ({
        ...state,
        validationErrors: { ...state.validationErrors, [field]: error },
      })),
    clearErrors: () => update((state) => ({ ...state, validationErrors: {} })),
    nextStep: () => update((state) => ({ ...state, step: state.step + 1 })),
    previousStep: () =>
      update((state) => ({ ...state, step: Math.max(1, state.step - 1) })),
    setStep: (step: number) => update((state) => ({ ...state, step })),
  };
}

export const onboardingStore = createOnboardingStore();
