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
	import { UserData } from '$lib/stores/userData.svelte';
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import { useQueryClient } from '@tanstack/svelte-query';
	import StoreBg from "$lib/images/store/store-bg.gif"
	import Shopkeep from "$lib/images/store/shopkeep.gif"
	import SignDuck1 from "$lib/images/store/sign-duck-1.png"
	import SignDuck2 from "$lib/images/store/sign-duck-2.png"
	import SignFlower1 from "$lib/images/store/sign-flower-1.png"
	import SignFlower2 from "$lib/images/store/sign-flower-2.png"

	const hoverAnimationTime = 3000;
	const driftAmount = 15;

	const imageAspectRatio = 2645 / 1234;
	const headerHeight = 64;

	let mainWidth: number = $state(0);
	let mainHeight: number = $state(0);

	let containerWidth: number = $derived.by(() => {
		const widthFromHeight = mainHeight * imageAspectRatio;
		
		if (widthFromHeight <= mainWidth) {
			return widthFromHeight;
		} else {
			return mainWidth;
		}
	});
	
	let containerHeight: number = $derived(containerWidth / imageAspectRatio);

	let contentRect: DOMRect | undefined = $state();

	let primarySpriteName: Record<ItemType, string> = {
		"duck": "Sprite.png",
		"plant": "Day.png"
	}

	let isDuckButtonPressed: boolean = $state(false);
	let isFlowerButtonPressed: boolean = $state(false);

	let currentlySelectedItem: Item | undefined = $state();

	const queryClient = useQueryClient();

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

	const handlePurchase = async (item: Item) => {
		const userCoins: number = UserData.user.coins;
		const currPageCapture = currentPage;
		const currPageSizeCapture = currentPageSize;
		const itemTypeCapture = selectedTab;
		conversation()
			.react('purchase_accepted', { userCoins, item })
			.end();
		if (UserData.user.coins >= item.price) {
			FetchFromApi<{ itemId: string }>("PurchaseItem", {
				method: "POST",
				body: JSON.stringify({
					itemId: item.itemId
			})
			}).then((value: StandardResponseDto<{ itemId: string }>) => {
				queryClient.invalidateQueries({queryKey: [`user/item/${selectedTab}`]})
				queryClient.setQueryData([itemTypeCapture, currPageCapture, currPageSizeCapture], (oldData: any) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						body: {
							...oldData.body,
							items: oldData.body.items.map((d: Item) =>
								d.itemId === value.body.itemId ? { ...d, isOwned: true } : d
							)
						}
					};
				});
				UserData.user.coins -= item.price;
			}).catch();
		
		}
	};

	const handleReject = () => {
		conversation()
			.react('purchase_rejected', {})
			.end();
	};

	let selectedTab: ItemType = $state("duck");
	let tabs: Record<ItemType, { component: Component<{ options: ShopPageArgs, currentPage: number, currentPageSize: number }>, options: ShopPageArgs }> = $state({
		"duck": {
			component: ItemPager,
			options: {
				itemType: "duck",
				endpoint: "item/duck",
				itemDisplay: DuckDisplay,
				select: (selected: Item, wasAutomatic: boolean) => selectItem(selected, wasAutomatic)
			}
		},
		"plant": {
			component: ItemPager,
			options: {
				itemType: "plant",
				endpoint: "item/plant",
				itemDisplay: PlantDisplay,
				select: (selected: Item, wasAutomatic: boolean) => selectItem(selected, wasAutomatic)
			}
		}
	});

	let CurrentTabComp: Component<{ options: ShopPageArgs, currentPage: number, currentPageSize: number }> = $derived(tabs[selectedTab].component ?? tabs["duck"].component);
	let CurrentTabOptions: ShopPageArgs = $derived(tabs[selectedTab].options ?? tabs["duck"].options);

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
		conversation()
			.react('entered_shop', { userCurrencyCount: UserData.user.coins })
			.end();
	});

	let currentPage: number = $state(1);
	let currentPageSize: number = $state(12);

</script>

<main bind:clientWidth={mainWidth} bind:clientHeight={mainHeight} style="height: calc(100vh - {headerHeight}px);"
	class="relative w-full flex justify-center items-center overflow-hidden bg-black">
	<img class="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
		src={StoreBg} alt="shop background gif"/>
	<img class="pointer-events-none absolute z-999 inset-0 h-full w-full object-cover select-none"alt="shopkeep"
			src={Shopkeep}/>
	<div class="relative" style="width: {containerWidth}px; height: {containerHeight}px;">
		<div class="w-[20%] max-h-[45%] absolute z-[75] left-[28%] bottom-[30%] flex flex-col-reverse justify-end">
			{#each chatWindowContents as chatMessage (chatMessage.messageId)}
				{#if chatMessage.type === 'shopkeep'}
					<ShopkeepMessageComp options={chatMessage.options}/>
				{:else if chatMessage.type === 'binary'}
					<BinaryInteractionMessageComp options={chatMessage.options}/>
				{/if}
			{/each}
		</div>

		<div class="absolute inset-0 z-[15] flex flex-row">
			<div class="relative h-full w-3/4">
				<div bind:contentRect class="absolute top-[9%] right-[1%] h-[57%] w-[88%] overflow-y-hidden">
					{#key selectedTab}
						<CurrentTabComp options={CurrentTabOptions} bind:currentPage bind:currentPageSize/>
					{/key}
				</div>
				
				<div class="absolute h-[6%] top-[3%] z-[999] left-[15%] flex flex-row gap-1 py-[0.1%] px-[1%]">
					<button 
						onmousedown={() => isDuckButtonPressed = true}
						onmouseup={() => {
							isDuckButtonPressed = false;
							selectedTab = 'duck';
						}}
						class="h-full"
					>
						<img class="h-full" src={isDuckButtonPressed ? SignDuck2 : SignDuck1} alt="duck tab">
					</button>
					<button 
						onmousedown={() => isFlowerButtonPressed = true}
						onmouseup={() => {
							isFlowerButtonPressed = false;
							selectedTab = 'plant';
						}}
						class="h-full"
					>
						<img class="h-full" src={isDuckButtonPressed ? SignFlower2 : SignFlower1} alt="plant tab">
					</button>
				</div>
			</div>

			{#if currentlySelectedItem}
				<div 
					class="fixed right-[10.5%] aspect-square w-[11%] flex justify-center items-center"
					style="top: calc(6vh + {headerHeight}px);"
				>
					<h3 class="text-[4vh] font-bold flex items-center">
						{`${currentlySelectedItem?.name.at(0)?.toUpperCase()}${currentlySelectedItem?.name.substring(1)}`}
					</h3>
				</div>
			{/if}
			{#if currentlySelectedItem}
					<div class="fixed top-[40%] right-[10%] aspect-square w-[11%] flex justify-center items-center"
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
						<CloudfrontImage path={`${selectedTab}/${currentlySelectedItem.itemId}/${primarySpriteName[selectedTab]}`} cls="max-h-full" />
					</div>
				{/if}
		</div>
	</div>
</main>

<svelte:head>
	<title>Shop - Algoduck</title>
</svelte:head>