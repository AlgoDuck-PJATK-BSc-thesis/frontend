<script lang="ts">
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';

	let { name, code, duckPath } = $props<{ name: string; code: string; duckPath: string }>();
</script>

<div class="flex items-center gap-3">
	<CloudfrontImage path={duckPath} cls="h-[7rem] w-[7.2rem] -scale-x-100 drop-shadow-md" />

	<div class="relative -translate-x-4 -translate-y-4">
		<div
			class="w-[16rem] overflow-auto rounded-3xl border-3 border-black bg-[color:var(--color-landingpage-subtitle)] px-5 py-2 text-sm font-semibold text-[color:var(--color-shadow-black)] shadow-lg"
		>
			<p class="leading-snug">
				Welcome to Cohort: {name}! <br />
				Code to join: {code}
			</p>
		</div>
		<div
			class="absolute top-1/2 -left-[0.3rem] h-3 w-3 -translate-y-1/2 rotate-45 border-b-3 border-l-3 border-black bg-[color:var(--color-landingpage-subtitle)]"
		></div>
	</div>
</div>
