<script lang="ts">
	import type { UserAchievementDto } from '$lib/api/user';
	import TickIconSvg from '$lib/svg/EditorComponentIcons/TickIconSvg.svelte';

	let { achievements, nameOf, descOf } = $props<{
		achievements: UserAchievementDto[];
		nameOf: (a: UserAchievementDto) => string;
		descOf: (a: UserAchievementDto) => string;
	}>();
</script>

<div class="mt-6 flex w-full flex-col gap-3">
	<div class="text-xl font-black tracking-wide">Achievements</div>

	<div class="flex max-h-[16rem] flex-col gap-2 overflow-y-auto pr-2">
		{#if achievements.length === 0}
			<div class="text-[color:var(--color-landingpage-subtitle)] opacity-80">
				No achievements yet.
			</div>
		{:else}
			{#each achievements as a}
				<div
					class="flex flex-col rounded px-3 py-2 {a.isCompleted
						? 'border border-green-500/30 bg-green-600/40'
						: 'bg-white/10'}"
				>
					<div class="flex items-center justify-between">
						<div class="font-black">{nameOf(a)}</div>
						{#if a.isCompleted}
							<span class="flex flex-row items-center gap-1 text-xs text-green-300">
								<span>Completed</span>
								<span class="inline-flex translate-y-[1px]">
									<TickIconSvg options={{ class: 'h-3 w-3 stroke-[2] stroke-green-300' }} />
								</span>
							</span>
						{:else}
							<span class="text-xs opacity-70">{a.currentValue ?? 0}/{a.targetValue ?? 0}</span>
						{/if}
					</div>
					{#if descOf(a)}
						<div class="text-sm opacity-90">{descOf(a)}</div>
					{/if}
					{#if !a.isCompleted && (a.targetValue ?? 0) > 0}
						<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
							<div
								class="h-full bg-blue-500 transition-all duration-300"
								style="width: {Math.min(
									100,
									((a.currentValue ?? 0) / (a.targetValue ?? 1)) * 100
								)}%"
							></div>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>
