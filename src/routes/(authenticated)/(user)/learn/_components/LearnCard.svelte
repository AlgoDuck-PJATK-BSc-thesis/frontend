<script lang="ts">
	let { href, title, description } = $props<{ href: string; title: string; description: string }>();
</script>

<a
	{href}
	class="block rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur transition hover:bg-white/10"
>
	<div class="text-xl font-black tracking-wide text-white">{title}</div>
	<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">{description}</p>
	<div class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/90">
		<span>Open</span>
	</div>
</a>
