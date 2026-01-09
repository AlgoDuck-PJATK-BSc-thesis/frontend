<script lang="ts">
	let { title, subtitle } = $props<{ title: string; subtitle?: string }>();
</script>

<div class="text-center">
	<h1
		class="ocr-outline ocr-title isolate mt-0 mb-6 ml-0 px-1 text-center [font-family:var(--font-ariw9500)] font-black tracking-widest text-[var(--color-landingpage-title)] md:text-5xl"
	>
		{title}
	</h1>

	{#if subtitle}
		<p class="mx-auto max-w-3xl text-[color:var(--color-landingpage-subtitle)]">{subtitle}</p>
	{/if}
</div>
