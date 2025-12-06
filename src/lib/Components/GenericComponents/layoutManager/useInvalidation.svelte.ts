import { untrack } from 'svelte';

export function useInvalidation(
  options: { isValid: boolean },
  onInvalidate: () => Promise<void> | void
) {
  $effect(() => {
    if (options.isValid === false) {
      onInvalidate();
      untrack(() => {
        options.isValid = true;
      });
    }
  });
}