/**
 * Debounce function to reduce excessive API calls
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Debounced state for reactive queries
 */
export function createDebouncedState<T>(initialValue: T, delay: number = 300) {
  let current = $state(initialValue);
  let debounced = $state(initialValue);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateDebounced = debounce((value: any) => {
    debounced = value;
  }, delay);

  $effect(() => {
    updateDebounced(current);
  });

  return {
    get current() {
      return current;
    },
    set current(value: T) {
      current = value;
    },
    get debounced() {
      return debounced;
    },
  };
}
