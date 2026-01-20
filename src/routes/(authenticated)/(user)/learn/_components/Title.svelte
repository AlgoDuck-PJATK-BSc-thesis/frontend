<script lang="ts">
	let { title, subtitle } = $props<{ title: string; subtitle?: string }>();
</script>

<div class="text-center">
	<h1
		class="ocr-outline ocr-title isolate -mt-6 mb-6 ml-0 px-1 text-center [font-family:var(--font-ariw9500)] font-black tracking-widest text-[var(--color-landingpage-title)] md:text-6xl"
	>
		{title}
	</h1>

	{#if subtitle}
		<p class="mx-auto max-w-3xl font-medium text-[color:var(--color-landingpage-text)]">
			{subtitle}
		</p>
	{/if}
</div>
