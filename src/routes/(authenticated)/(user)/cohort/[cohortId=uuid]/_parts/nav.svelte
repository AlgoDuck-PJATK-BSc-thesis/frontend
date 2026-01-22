<script lang="ts">
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	let { activeTab, onTab, onRename, onLeave } = $props<{
		activeTab: 'chat' | 'leaderboard';
		onTab: (tab: 'chat' | 'leaderboard') => void;
		onRename: () => void;
		onLeave: () => void;
	}>();

	let showOptions = $state(false);

	const toggleOptions = () => {
		showOptions = !showOptions;
	};
</script>

<PixelFrameSimple
	className="text-[color:var(--color-landingpage-subtitle)] flex-1 px-6 py-1 z-[99999] flex items-center justify-start bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<nav class="mt-2 mb-1 flex gap-6 text-lg font-semibold">
		<button
			onclick={() => onTab('chat')}
			class={activeTab === 'chat'
				? 'text-[color:var(--color-primary)]'
				: 'text-[color:var(--color-landingpage-subtitle)]'}
		>
			Chat
		</button>

		<button
			onclick={() => onTab('leaderboard')}
			class={activeTab === 'leaderboard'
				? 'text-[color:var(--color-primary)]'
				: 'text-[color:var(--color-landingpage-subtitle)]'}
		>
			Leaderboard
		</button>

		<div class="relative">
			<button
				class="scale-y-[-1] rounded py-1 text-xl font-bold transition hover:bg-[color:var(--color-accent-3)]"
				onclick={toggleOptions}
				aria-label="Cohort options"
			>
				…
			</button>

			{#if showOptions}
				<button
					type="button"
					class="fixed top-0 left-0 z-99 h-screen w-screen border-none bg-transparent"
					aria-label="Close dropdown"
					onclick={toggleOptions}
				></button>

				<div class="absolute top-full right-0 z-999 mt-0 translate-x-[1.5rem]">
					<PixelFrameSimple
						className="w-48 bg-[color:var(--color-accent-3)] shadow-lg border-[color:var(--color-accent-4)] p-2"
					>
						<button
							onclick={() => {
								toggleOptions();
								onRename();
							}}
							class="block w-full px-4 py-2 text-left hover:rounded-md hover:bg-[color:var(--color-accent-4)]"
						>
							Rename Cohort
						</button>

						<button
							onclick={() => {
								toggleOptions();
								onLeave();
							}}
							class="z-9999 block w-full px-4 py-2 text-left text-red-500 hover:rounded-md hover:bg-[color:var(--color-accent-4)]"
						>
							Leave Cohort
						</button>
					</PixelFrameSimple>
				</div>
			{/if}
		</div>
	</nav>
</PixelFrameSimple>
