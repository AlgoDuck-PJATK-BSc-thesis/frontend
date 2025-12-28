<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userApi } from '$lib/api/user';

	onMount(async () => {
		try {
			const me = await userApi.getMe(fetch);
			const id = (me.userId ?? '').toString().trim();
			if (id) {
				await goto(`/user/${id}`);
				return;
			}
		} catch {}
		await goto('/home');
	});
</script>

<div></div>
