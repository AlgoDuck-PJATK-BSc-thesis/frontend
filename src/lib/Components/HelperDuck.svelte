<script lang="ts">
	import { onMount } from 'svelte';
	import type { DuckDto } from '../../routes/Shop/Dtos';
	import { browser } from '$app/environment';

	let { selectedDuck, mode }: { selectedDuck: DuckDto; mode: 'home' | 'solve' } = $props();

	const problemCategories = [
		'array',
		'loop',
		'string manipulation',
		'graph traversal',
		'tree',
		'sorting algorithms',
		'dynamic programming',
		'bit manipulation',
		'greedy algorithms'
	];

	let currentCategory = $state('');
	let currentMessage = $state('');

	const cloudfrontDistributionDomainName: string = 'd3018wbyyxg1xc.cloudfront.net';

	const wrapDuckIdInHttpsCloudfrontCall = (duckId: string): string => {
		return `https://${cloudfrontDistributionDomainName}/Ducks/Outfits/duck-${duckId}.png`;
	};

	let isDuckSupposedToSpeak: boolean = $state(false);

	onMount(() => {
		let interval: number;

		if (mode === 'home') {
			const updateCategory = () => {
				const lastUpdate = localStorage.getItem('lastCategoryUpdate');
				const now = Date.now();

				if (!lastUpdate || now - Number(lastUpdate) > 1000 * 60 * 60 * 24) {
					const random = problemCategories[Math.floor(Math.random() * problemCategories.length)];
					currentCategory = random;
					localStorage.setItem('currentCategory', random);
					localStorage.setItem('lastCategoryUpdate', now.toString());
				} else {
					const saved = localStorage.getItem('currentCategory');
					if (saved) currentCategory = saved;
				}
			};

			updateCategory();
			interval = setInterval(updateCategory, 1000 * 60 * 60 * 24);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	});

	let raf: number;

	const animateSpeaking = (node: HTMLSpanElement, targetMessage: string) => {
		currentMessage = '';
		raf = requestAnimationFrame(() => animateDuckMessage(targetMessage, 0, 0));

		return {
			destroy() {
				if (raf) {
					cancelAnimationFrame(raf);
				}
			}
		};
	};

	const animateDuckMessage = (
		message: string,
		currMessagePointer: number,
		frameCounter: number
	): void => {
		if (!browser) return;
		if (frameCounter % 6 == 0) {
			currentMessage += message.at(currMessagePointer);
			currMessagePointer++;
		}

		if (currMessagePointer == message.length) {
			cancelAnimationFrame(raf);
			frameCounter = 0;
			currMessagePointer = 0;
			return;
		}
		frameCounter++;
		raf = requestAnimationFrame(() =>
			animateDuckMessage(message, currMessagePointer, frameCounter)
		);
	};

	const makeDuckSpeak = async (): Promise<string> => {
		if (mode == 'home') {
			return `Hey! Let's solve some ${currentCategory} problems.`;
		} else {
			return await new Promise<string>((resolve) => {
				setTimeout(() => resolve('Simulated api tip fetch'), 3000);
			});
		}
	};

	const animateWaiting = (node: HTMLSpanElement, baselineMsg: string) => {
		if (!browser) return;
		currentMessage = '';
		raf = requestAnimationFrame(() => {
			waitingAnim(baselineMsg, 0);
		});

		return {
			destroy() {
				if (raf) {
					cancelAnimationFrame(raf);
				}
			}
		};
	};

	const waitingAnim = (message: string, frameCounter: number): void => {
		currentMessage = `${message}${'.'.repeat(frameCounter / 15)}`;

		frameCounter %= 59;
		frameCounter++;
		raf = requestAnimationFrame(() => {
			waitingAnim(message, frameCounter);
		});
	};

	const showMessageDiv = () => {
		isDuckSupposedToSpeak = true;
		return () => {
			isDuckSupposedToSpeak = false;
		};
	};

	console.log(Math.floor(Math.random() * 2));
</script>

<div class="fixed bottom-[10%] z-[999] aspect-square h-20 flex-row overflow-visible">
	<button
		onclick={showMessageDiv}
		class="200 absolute left-0 aspect-square h-full overflow-hidden rounded-full border-4 border-white bg-[color:var(--color-primary)] shadow-md transition-all ease-out hover:scale-110 hover:cursor-pointer active:scale-90 active:rotate-6"
	>
		<img
			src={wrapDuckIdInHttpsCloudfrontCall(selectedDuck.id)}
			alt="duck"
			class="pointer-events-none h-full w-full -translate-x-[-22%] -translate-y-[-10%] scale-[1.7]"
		/>
	</button>

	{#if isDuckSupposedToSpeak}
		<div class="absolute left-25 w-100 rounded-xl bg-white p-3 text-black">
			<span class="flex items-center justify-center">
				{#await makeDuckSpeak()}
					<span class="flex w-full justify-start" use:animateWaiting={'Let me think about it'}
						>{currentMessage}</span
					>
				{:then message}
					<span class="flex w-full justify-start" use:animateSpeaking={message}
						>{currentMessage}</span
					>
				{/await}
			</span>
		</div>
	{/if}
</div>
