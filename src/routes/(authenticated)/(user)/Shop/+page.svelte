<script lang="ts">
	import type { Item, ShopPageArgs, ShopkeepPrompt, BinaryUserInteractionArgs } from './Dtos';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import ItemPager from './ItemPager.svelte';
	import DuckDisplay from './DuckDisplay.svelte';
	import type { ItemType } from '$lib/Components/Misc/Pond/duckTypes';
	import { onMount, type Component } from 'svelte';
	import PlantDisplay from './PlantDisplay.svelte';
	import ShopkeepMessageComp from './ShopkeepMessageComp.svelte';
	import BinaryInteractionMessageComp from './BinaryInteractionMessageComp.svelte';
	import { ConversationBuilder, type ConversationExecutor } from './MessageTypes';

	const hoverAnimationTime = 3000;
	const driftAmount = 15;

	let bgImageWidth: number | undefined = $state();
	let bgImageHeight: number | undefined = $state();

	let contentRect: DOMRect | undefined = $state();

	let isDuckButtonPressed: boolean = $state(false);
	let isFlowerButtonPressed: boolean = $state(false);

	let currentlySelectedItem: Item | undefined = $state();
	let userCoins: number = $state(500);

	const selectItem = (selected: Item, wasAutomatic: boolean) => {
		currentlySelectedItem = selected;
		if (wasAutomatic) return;
		
		conversation()
			.clear()
			.react('item_selected', { selected: selectedTab })
			.prompt({
				messageContents: `Buy ${selected.name} for ${selected.price}?`,
				onAccept: () => handlePurchase(selected),
				onReject: () => handleReject()
			});
	};

	const handlePurchase = (item: Item) => {
		conversation()
			.react('purchase_accepted', { userCoins, item })
			.end();
		
		if (userCoins >= item.price) {
			userCoins -= item.price;
		}
	};

	const handleReject = () => {
		conversation()
			.react('purchase_rejected', {})
			.end();
	};

	let selectedTab: ItemType = $state("Duck");
	let tabs: Record<ItemType, { component: Component<{options: ShopPageArgs}>, options: ShopPageArgs }> = $state({
		"Duck": {
			component: ItemPager,
			options: {
				itemType: "Duck",
				endpoint: "AllDucks",
				itemDisplay: DuckDisplay,
				select: (selected: Item, wasAutomatic: boolean) => selectItem(selected, wasAutomatic)
			}
		},
		"Plant": {
			component: ItemPager,
			options: {
				itemType: "Plant",
				endpoint: "AllPlants",
				itemDisplay: PlantDisplay,
				select: (selected: Item, wasAutomatic: boolean) => selectItem(selected, wasAutomatic)
			}
		}
	});

	let CurrentTabComp: Component<{ options: ShopPageArgs }> = $derived(tabs[selectedTab].component ?? tabs["Duck"].component);
	let CurrentTabOptions: ShopPageArgs = $derived(tabs[selectedTab].options ?? tabs["Duck"].options);

	let chatWindowContents: ChatMessageEntry[] = $state([]);

	type ChatMessageEntry = 
		| { type: 'shopkeep'; messageId: string; options: ShopkeepPrompt }
		| { type: 'binary'; messageId: string; options: BinaryUserInteractionArgs };
	
	type QueuedMessage = 
		| { type: 'shopkeep'; messageContents: string }
		| { type: 'binary'; messageContents: string; onAccept: () => void; onReject?: () => void };
	
	let messageQueue: QueuedMessage[] = $state([]);
	let isProcessingQueue: boolean = $state(false);
	let conversationTimeoutIds: number[] = $state([]);
	
	const baseDisappearTime = 10000;
	const typingSpeedMs = 30; 

	const getTypingDuration = (text: string): number => {
		return text.length * typingSpeedMs + 100; 
	};

	const clearConversationTimeouts = () => {
		conversationTimeoutIds.forEach(id => clearTimeout(id));
		conversationTimeoutIds = [];
	};

	const dismissAllMessages = () => {
		chatWindowContents = [];
		clearConversationTimeouts();
		messageQueue = [];
		isProcessingQueue = false;
	};

	const resetConversationChainTimer = () => {
		clearConversationTimeouts();
		
		const timeoutId = window.setTimeout(() => {
			dismissAllMessages();
		}, baseDisappearTime);
		
		conversationTimeoutIds.push(timeoutId);
	};

	const processQueue = async () => {
		if (isProcessingQueue || messageQueue.length === 0) return;
		
		isProcessingQueue = true;
		
		while (messageQueue.length > 0) {
			const nextMessage = messageQueue.shift()!;
			
			const lastMessage = chatWindowContents[0];
			if (lastMessage && !lastMessage.options.wasTypedFully) {
				await new Promise<void>(resolve => {
					const checkTyping = setInterval(() => {
						if (chatWindowContents[0]?.options.wasTypedFully !== false) {
							clearInterval(checkTyping);
							resolve();
						}
					}, 50);
				});
			}
			
			if (nextMessage.type === 'shopkeep') {
				addShopkeepMessageImmediate(nextMessage.messageContents);
				await new Promise(resolve => setTimeout(resolve, getTypingDuration(nextMessage.messageContents)));
			} else {
				addBinaryPromptImmediate(nextMessage);
			}
			
			resetConversationChainTimer();
		}
		
		isProcessingQueue = false;
	};

	const addShopkeepMessageImmediate = (messageContents: string) => {
		const messageId = `message-${Date.now()}-${Math.random()}`;
		
		chatWindowContents.unshift({
			type: 'shopkeep',
			messageId,
			options: {
				dismissCallback: () => dismissMessage(messageId),
				messageContents,
				wasTypedFully: false,
			}
		});
	};

	const addBinaryPromptImmediate = (msg: Extract<QueuedMessage, { type: 'binary' }>) => {
		const messageId = `message-${Date.now()}-${Math.random()}`;
		
		chatWindowContents = chatWindowContents.filter(m => m.type !== 'binary');
		
		chatWindowContents.unshift({
			type: 'binary',
			messageId,
			options: {
				messageContents: msg.messageContents,
				dismissCallback: () => dismissMessage(messageId),
				onAccept: () => {
					msg.onAccept();
				},
				onReject: () => {
					msg.onReject?.();
				},
				wasTypedFully: true,
			}
		});
	};

	const createShopkeepMessage = (messageContents: string) => {
		messageQueue.push({ type: 'shopkeep', messageContents });
		processQueue();
	};

	const createBinaryUserPrompt = (args: { messageContents: string; onAccept: () => void; onReject?: () => void; }) => {
		const hasPendingBinary = messageQueue.some(m => m.type === 'binary');
		const hasDisplayedBinary = chatWindowContents.some(m => m.type === 'binary');
		
		if (hasPendingBinary || hasDisplayedBinary) {
			return;
		}
		
		messageQueue.push({
			type: 'binary',
			messageContents: args.messageContents,
			onAccept: args.onAccept,
			onReject: args.onReject,
		});
		processQueue();
	};

	const dismissMessage = (messageId: string) => {
		const index = chatWindowContents.findIndex(m => m.messageId === messageId);
		if (index !== -1) {
			chatWindowContents.splice(index, 1);
		}
	};

	const conversation = () => new ConversationBuilder({
		queueShopkeepMessage: createShopkeepMessage,
		queueBinaryPrompt: createBinaryUserPrompt,
		clearMessages: dismissAllMessages,
		delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
	});

	onMount(() => {
		userCoins = Math.floor(Math.random() * 1100);
		
		conversation()
			.react('entered_shop', { userCurrencyCount: userCoins })
			.end();
	});
</script>

<main class="relative h-full w-full">
	<img bind:clientWidth={bgImageWidth} bind:clientHeight={bgImageHeight}
		class="pointer-events-none absolute inset-0 top-0 h-full object-cover select-none"
		src="/shop/store-bg.gif"
		alt="shop background gif"
	/>
	<img class="pointer-events-none absolute inset-0 top-0 z-500 h-full object-cover select-none"
		src="/shop/shopkeep.gif"
		alt="shopkeep"
	/>

	<div class="absolute top-4 right-4 z-800 flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-lg">
		<img class="h-6 w-6" src="/src/lib/images/store/coin.png" alt="coin" />
		<span class="text-amber-100 font-bold">{userCoins}</span>
	</div>

	<div class="w-[20%] max-h-[45%] absolute z-750 left-[22%] bottom-[27%] flex flex-col-reverse justify-end">
		{#each chatWindowContents as chatMessage (chatMessage.messageId)}
			{#if chatMessage.type === 'shopkeep'}
				<ShopkeepMessageComp options={chatMessage.options}/>
			{:else if chatMessage.type === 'binary'}
				<BinaryInteractionMessageComp options={chatMessage.options}/>
			{/if}
		{/each}
	</div>

	<div
		class="absolute top-0 z-150 flex flex-row"
		style="width: {bgImageWidth ?? 1920}px; height: {bgImageHeight ?? 1080}px;">
		<div class="relative h-full w-3/4">
			<div bind:contentRect class="absolute top-[4%] right-[1%] h-[65%] w-[91%] overflow-y-hidden">
				{#key selectedTab}
					<CurrentTabComp options={CurrentTabOptions}/>
				{/key}
			</div>
			<div class="absolute h-[6%] top-[69%] z-999 right-[5%] bg-red-500 flex flex-row gap-1 py-[0.1%] px-[1%]">
				<button onmousedown={() => {
					isDuckButtonPressed = true;
				}}
				onmouseup={() => {
					isDuckButtonPressed = false;
					selectedTab = 'Duck';
				}}
				class="h-full">
					<img class="h-full" src="/src/lib/images/store/sign-duck-{isDuckButtonPressed ? 2 : 1}.png" alt="duck tab">
				</button>
				<button onmousedown={() => {
					isFlowerButtonPressed = true;
				}}
				onmouseup={() => {
					isFlowerButtonPressed = false;
					selectedTab = 'Plant';
				}}
				class="h-full">
					<img class="h-full" src="/src/lib/images/store/sign-flower-{isFlowerButtonPressed ? 2 : 1}.png" alt="plant tab">
				</button>
			</div>
			<div class="absolute h-[6%] top-[69%] z-999 right-[5%] bg-red-500 flex flex-row gap-1 py-[0.1%] px-[1%]">
				<button onmousedown={() => {
					isDuckButtonPressed = true;
				}}
				onmouseup={() => {
					isDuckButtonPressed = false;
					activeTab = 'ducks';
				}}
				class="h-full">
					<img class="h-full" src="/src/lib/images/store/sign-duck-{isDuckButtonPressed ? 2 : 1}.png" alt="duck tab">
				</button>
				<button onmousedown={() => {
					isFlowerButtonPressed = true;
				}}
				onmouseup={() => {
					isFlowerButtonPressed = false;
					activeTab = 'plants';
				}}
				class="h-full">
					<img class="h-full" src="/src/lib/images/store/sign-flower-{isFlowerButtonPressed ? 2 : 1}.png" alt="plant tab">
				</button>
			</div>
		</div>

		<div class="relative flex h-full w-1/4 flex-col items-center">
			<div class="absolute text-text top-[15%] flex h-[12.5%] w-[50%] flex-col items-center justify-center [font-family:var(--font-ariw9500)]">
				{#if currentlySelectedItem}
					<h3 class="text-2xl font-bold flex items-center">
						{`${currentlySelectedItem?.name.at(0)?.toUpperCase()}${currentlySelectedItem?.name.substring(1)}`}
					</h3>
				{/if}
			</div>

			{#if currentlySelectedItem}
				<div
					class="absolute top-[40%] aspect-square w-[50%] flex justify-center item-center"
					{@attach (node) => {
						let startTime: number | undefined;
						let raf: number;

						const animate = (time: number) => {
							if (!startTime) startTime = time;
							const progress = ((time - startTime) % hoverAnimationTime) / hoverAnimationTime;
							node.style.transform = `translateY(${Math.sin(progress * Math.PI * 2) * driftAmount}px)`;
							raf = requestAnimationFrame(animate);
						};

						raf = requestAnimationFrame(animate);
						return () => cancelAnimationFrame(raf);
					}}>
					<CloudfrontImage path={`${selectedTab}s/${currentlySelectedItem.itemId}.png`} cls="max-h-full" />
				</div>
			{/if}
		</div>
	</div>
</main>