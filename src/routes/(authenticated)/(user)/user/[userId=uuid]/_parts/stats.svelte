<script lang="ts">
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';

	let { solved, acceptance, totalSubs, accepted, wa, tle, re } = $props<{
		solved: number;
		acceptance: number | undefined;
		totalSubs: number | undefined;
		accepted: number | undefined;
		wa: number | undefined;
		tle: number | undefined;
		re: number | undefined;
	}>();
</script>

<div class="mt-6 flex w-full flex-col gap-3">
	<div class="text-xl font-black tracking-wide">Statistics</div>

	<div class="flex flex-wrap gap-2">
		<PixelFrameMini
			className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
		>
			<span>Solved</span>
			<span>{solved}</span>
		</PixelFrameMini>

		{#if typeof acceptance === 'number'}
			<PixelFrameMini
				className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
			>
				<span>Acceptance</span>
				<span>{Math.round(acceptance * 100)}%</span>
			</PixelFrameMini>
		{/if}

		{#if typeof totalSubs === 'number'}
			<PixelFrameMini
				className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
			>
				<span>Submissions</span>
				<span>{totalSubs}</span>
			</PixelFrameMini>
		{/if}

		{#if typeof accepted === 'number'}
			<PixelFrameMini
				className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
			>
				<span>Accepted</span>
				<span>{accepted}</span>
			</PixelFrameMini>
		{/if}

		{#if typeof wa === 'number'}
			<PixelFrameMini
				className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
			>
				<span>Wrong</span>
				<span>{wa}</span>
			</PixelFrameMini>
		{/if}

		{#if typeof tle === 'number'}
			<PixelFrameMini
				className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
			>
				<span>TLE</span>
				<span>{tle}</span>
			</PixelFrameMini>
		{/if}

		{#if typeof re === 'number'}
			<PixelFrameMini
				className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
			>
				<span>RE</span>
				<span>{re}</span>
			</PixelFrameMini>
		{/if}
	</div>
</div>
