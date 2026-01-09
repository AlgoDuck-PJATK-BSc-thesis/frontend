<script lang="ts">
	type Meta = {
		title: string;
		what: string;
		when: string[];
		avoid: string[];
		time: { best?: string; avg?: string; worst?: string };
		space: string;
		flags?: Record<string, string | boolean>;
	};

	let { meta, java } = $props<{ meta: Meta; java: string }>();

	import { highlightJava } from '../../../../../Utils/highlight';
</script>

<div class="space-y-4">
	<div class="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
		<div class="text-lg font-bold text-white">{meta.title}</div>
		<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">{meta.what}</p>

		<div class="mt-4 grid gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<div class="text-xs font-semibold tracking-wider text-white/70 uppercase">Good for</div>
				<ul class="list-disc space-y-1 pl-5 text-sm text-slate-200">
					{#each meta.when as item}
						<li>{item}</li>
					{/each}
				</ul>
			</div>

			<div class="space-y-2">
				<div class="text-xs font-semibold tracking-wider text-white/70 uppercase">Avoid when</div>
				<ul class="list-disc space-y-1 pl-5 text-sm text-slate-200">
					{#each meta.avoid as item}
						<li>{item}</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="mt-4 flex flex-wrap gap-2">
			<div class="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
				Time:{meta.time.best ? ` best ${meta.time.best}` : ''}{meta.time.avg
					? ` • avg ${meta.time.avg}`
					: ''}{meta.time.worst ? ` • worst ${meta.time.worst}` : ''}
			</div>
			<div class="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
				Space: {meta.space}
			</div>

			{#if meta.flags}
				{#each Object.entries(meta.flags) as [k, v]}
					<div
						class="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
					>
						{k}: {String(v)}
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<div class="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
		<div class="mb-3 text-sm font-semibold text-white">Java Implementation</div>
		<div class="overflow-x-auto text-sm text-slate-200">
			{@html highlightJava(java)}
		</div>
	</div>
</div>
