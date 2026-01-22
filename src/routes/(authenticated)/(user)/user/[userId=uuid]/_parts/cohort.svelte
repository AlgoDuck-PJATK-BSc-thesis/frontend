<script lang="ts">
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';
	import type { CohortDetailsDto } from '$lib/api/cohort';

	let {
		cohortId,
		cohortLoading,
		cohortJoinCode,
		copied,
		isMe,
		cohortDetails,
		joiningCohort,
		myCohortId,
		cohortError,
		onCopy,
		onJoin,
		onSwitch
	} = $props<{
		cohortId: string;
		cohortLoading: boolean;
		cohortJoinCode: string;
		copied: boolean;
		isMe: boolean;
		cohortDetails: CohortDetailsDto | null;
		joiningCohort: boolean;
		myCohortId: string;
		cohortError: string;
		onCopy: () => void;
		onJoin: () => void;
		onSwitch: () => void;
	}>();
</script>

<div class="mt-8 flex flex-col gap-2">
	{#if !cohortId}
		<div class="text-[1rem] text-[color:var(--color-landingpage-subtitle)]">
			User is not in any cohort.
		</div>
	{:else}
		<div class="flex flex-wrap items-center gap-2">
			<div class="text-[1rem] text-[color:var(--color-landingpage-subtitle)]">
				User's cohort access:
			</div>

			{#if cohortLoading}
				<PixelFrameMini
					className="flex items-center gap-2 bg-[color:var(--color-primary)] px-3 py-0.5 text-[1rem] text-[color:var(--color-accent-4)]"
				>
					<span>Loading</span>
				</PixelFrameMini>
			{:else if cohortJoinCode}
				<button type="button" onclick={onCopy} class="group" aria-label="Copy cohort code">
					<PixelFrameMini
						className="flex items-center gap-2 bg-[color:var(--color-primary)] px-3 py-0.5 text-[1rem] text-[color:var(--color-accent-4)] transition group-hover:brightness-110"
					>
						<span>{copied ? 'Copied' : cohortJoinCode}</span>
					</PixelFrameMini>
				</button>
			{/if}

			{#if !isMe && cohortDetails}
				{#if cohortDetails.isMember}
					<PixelFrameMini
						className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
					>
						<span>In your cohort</span>
					</PixelFrameMini>
				{:else}
					<button
						type="button"
						onclick={myCohortId.trim() ? onSwitch : onJoin}
						class={joiningCohort ? 'pointer-events-none opacity-60' : ''}
					>
						<PixelFrameMini
							className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
						>
							<span>
								{joiningCohort
									? 'Joining'
									: myCohortId.trim()
										? 'Leave current cohort to join'
										: 'Join'}
							</span>
						</PixelFrameMini>
					</button>
				{/if}
			{/if}
		</div>

		{#if cohortError}
			<div class="text-sm text-red-500">{cohortError}</div>
		{/if}
	{/if}
</div>
