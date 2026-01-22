<script lang="ts">
	import type { PageData } from './$types';
	import Avatar from './_parts/avatar.svelte';
	import Username from './_parts/username.svelte';
	import Email from './_parts/email.svelte';
	import Password from './_parts/password.svelte';
	import Twofactor from './_parts/twofactor.svelte';
	import Prefs from './_parts/prefs.svelte';
	import Danger from './_parts/danger.svelte';
	import Footer from './_parts/footer.svelte';

	let { data } = $props<{ data: PageData }>();

	let config = $derived.by(() => data.settings ?? null);
</script>

<svelte:head>
	<title>Settings - AlgoDuck</title>
</svelte:head>

<section class="mt-2 flex h-[calc(100vh-5rem)] justify-center overflow-hidden px-6 pt-7">
	<div class="flex h-full w-full max-w-2xl flex-col gap-5 overflow-y-auto pb-8">
		<div class="text-center">
			<h2
				class="ocr-outline ocr-title isolate mt-2 mb-12 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-semibold tracking-widest text-[var(--color-landingpage-title)]"
			>
				Settings
			</h2>

			<div id="avatar" class="w-full">
				<Avatar {config} />
			</div>
		</div>

		<Username {config} />
		<Email {config} />
		<Password />
		<Twofactor />
		<Prefs {config} />
		<Danger />
		<Footer />
	</div>
</section>
