import { writable } from 'svelte/store';

export const userPreferences = writable({
    theme: 'dark'
});