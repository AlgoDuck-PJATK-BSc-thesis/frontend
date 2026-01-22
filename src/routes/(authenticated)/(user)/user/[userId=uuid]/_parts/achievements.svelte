<script lang="ts">
	import type { UserAchievementDto } from '$lib/api/user';

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
				<div class="flex flex-col rounded bg-white/10 px-3 py-2">
					<div class="font-black">{nameOf(a)}</div>
					{#if descOf(a)}
						<div class="text-sm opacity-90">{descOf(a)}</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>
