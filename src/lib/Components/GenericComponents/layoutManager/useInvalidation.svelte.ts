import { untrack } from 'svelte';

export function useInvalidation(
  options: { isValid: boolean },
  onInvalidate: () => Promise<void> | void
) {
  $effect(() => {
    console.log("running effect");
    console.log(options.isValid);
    if (options.isValid === false) {
      onInvalidate();
      untrack(() => {
        options.isValid = true;
      });
    }
  });
}