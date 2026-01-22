<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import { authApi } from '$lib/api/auth';

	const logout = async () => {
		const confirmed = confirm('Are you sure you want to log out?');
		if (!confirmed) return;
		try {
			await authApi.logout(fetch);
		} catch {}
		await goto('/');
	};
</script>

<div class="mt-2 flex w-full items-center justify-center gap-20 pb-2">
	<Button
		size="medium"
		label="Log Out"
		labelFontFamily="var(--font-ariw9500)"
		labelColor="rgba(0,0,0,0.7)"
		labelFontSize="1.2rem"
		labelFontWeight="normal"
		labelTracking="normal"
		labelClass=""
		onclick={logout}
	/>
</div>
