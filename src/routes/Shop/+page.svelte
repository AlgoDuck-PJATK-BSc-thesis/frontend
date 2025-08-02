<script lang="ts">
	import ShopkeepCid from '$lib/images/Shop/shopkeep.mp4';
	import Sign from '$lib/images/Shop/sign-placeholder.png';
	import Padding from '$lib/images/Shop/padding.png';
	import Shelf from '$lib/images/Shop/shelf-placeholder.png';
	import Coin from '$lib/images/Shop/coin-placeholder.png';
	import TableDark from '$lib/images/Shop/table-placeholder-dark-1.png';
	import TableLight from '$lib/images/Shop/table-placeholder-light-1.png';
	import Border from '$lib/images/Shop/border-1.png';


    //TODO put these on cloudfront. No time now
    import Cat1 from '$lib/images/Shop/Cat/cat-1.png'
    import Cat2 from '$lib/images/Shop/Cat/cat-2.png'
    import Cat3 from '$lib/images/Shop/Cat/cat-3.png'
    import Cat4 from '$lib/images/Shop/Cat/cat-4.png'
    import Cat5 from '$lib/images/Shop/Cat/cat-5.png'
    import Cat6 from '$lib/images/Shop/Cat/cat-6.png'
    import Cat7 from '$lib/images/Shop/Cat/cat-7.png'
    import Cat8 from '$lib/images/Shop/Cat/cat-8.png'
    import Cat9 from '$lib/images/Shop/Cat/cat-9.png'
    import Cat10 from '$lib/images/Shop/Cat/cat-10.png'

    import { userPreferences } from '../../Stores';

	import { DuckRarity, type DuckDto } from '../../Types/DuckDto';
	import type { ShopPageLoad } from '../../Types/ShopPageLoadType';

    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';


    const cloudfrontDistributionDomainName: string = "d3018wbyyxg1xc.cloudfront.net";

    let { data } : { data: ShopPageLoad } = $props();

    let speechBubbleComponent: HTMLElement;
    let speechBubbleTextContents: HTMLElement;
    let main: HTMLElement;
    let veilDiv: HTMLElement;
    let duckSelectedForPurchaseDiv: HTMLElement;
    let videoMaskDiv: HTMLElement;
    let shopkeepDiv: HTMLElement;
    let DuckSelectionAreaDiv: HTMLElement;

    let pageIndex: number = $state(1);
    let previewedDuckIndex: number = $state(0);
    let userTheme: string = $state("light");

    let currentCat: string = $state(Cat1);
    
    let ducksPagedIn: Array<DuckDto> = $state(data.ducksFetched);

    let speechBubbleClosingTimeoutCancellationHandle: number | null;

    let previewedDuck: DuckDto = $derived.by(() => {
        if (ducksPagedIn.at(previewedDuckIndex) === undefined) throw new Error("");
        return ducksPagedIn.at(previewedDuckIndex)!;
    });


    let voiceLines: Array<string> = [
        "Welcome traveller. Please take a look at my wares",
    ];

    let purchasedVoiceLine: string = "Ah that's a good one. Hope it serves you well";

    const unsubscribe = userPreferences.subscribe(value => {
        userTheme = value.theme;
    });

    let frameCounter: number = 0;
    let currLetterIndex: number = 0;
    let selectedVoiceLine: string;
    let animationCancellationHandle: number;
    let shopkeepVoiceline: string = $state("");

    let isDuckPageActive: boolean = $state(true);
    let isPlantPageActive: boolean = $state(false);
  

    const printVoiceLine = (voiceLineToBePrinted: string) : void => {
        if (speechBubbleClosingTimeoutCancellationHandle){
            clearTimeout(speechBubbleClosingTimeoutCancellationHandle);
            speechBubbleClosingTimeoutCancellationHandle = null;
        }
        showSpeechBubble();
        shopkeepVoiceline = "";
        currLetterIndex = 0;
        frameCounter = 0;

        selectedVoiceLine = voiceLineToBePrinted;
        animationCancellationHandle = requestAnimationFrame(printLetters);
    }

    const printLetters = (currentTime: number) : void => {
    
        if (frameCounter % 5 == 0){
            const currLetter: string | undefined = selectedVoiceLine.at(currLetterIndex);
            if (!currLetter){
                cancelAnimationFrame(animationCancellationHandle);
                speechBubbleClosingTimeoutCancellationHandle = setTimeout(hideSpeechBubble, 2000);
                return;
            }
            shopkeepVoiceline = `${shopkeepVoiceline}${currLetter}`;
            currLetterIndex++;
        }

        frameCounter++;
        animationCancellationHandle = requestAnimationFrame(printLetters);
    }


    const showSpeechBubble = () : void => {
        const mainBoundingRect: DOMRect = main.getBoundingClientRect();
        speechBubbleComponent.style.left = `${mainBoundingRect.left}px`;
        speechBubbleComponent.style.visibility = `visible`;
    }

    const hideSpeechBubble = () : void => {
        if (speechBubbleClosingTimeoutCancellationHandle){
            speechBubbleComponent.style.visibility = "hidden";
            speechBubbleComponent.style.left = `-${speechBubbleHiddenLeftValue}px`;
            speechBubbleClosingTimeoutCancellationHandle = null;
        }
    }

    const selectDuckToPurchase = () : void => {
        if (previewedDuck.isPurchased) {
            printVoiceLine("can't sell it to you twice. Sorry");
            return;
        }
        hideSpeechBubble();
        veilDiv.style.background = "rgba(0, 0, 0, 0.6)";
        duckSelectedForPurchaseDiv.style.visibility = "visible";
        duckSelectedForPurchaseDiv.style.pointerEvents = "auto";
        DuckSelectionAreaDiv.style.pointerEvents = "none";
        
    }

    const deselectDuckToPurchase = () : void => {
        veilDiv.style.background = "rgba(0, 0, 0, 0)";
        duckSelectedForPurchaseDiv.style.visibility = "hidden";
        duckSelectedForPurchaseDiv.style.pointerEvents = "none";
        DuckSelectionAreaDiv.style.pointerEvents = "auto";
    }

    let speechBubbleHiddenLeftValue: number;

    onMount(() => {
        catAnimationCanellationHandle = requestAnimationFrame(animateCat);
        const mainRect: DOMRect = main.getBoundingClientRect();
        const clientRect: DOMRect = shopkeepDiv.getBoundingClientRect();
        speechBubbleComponent.style.bottom = `${clientRect.top + mainRect.top}px`;
        const speechBubbleComputedStyle: CSSStyleDeclaration = getComputedStyle(speechBubbleComponent);
        speechBubbleHiddenLeftValue = parseInt(speechBubbleComputedStyle.width.replaceAll("px", ""));
        speechBubbleComponent.style.left = `-${speechBubbleHiddenLeftValue}px`;

        const randomVoiceLineIndex: number = Math.floor(Math.random() * voiceLines.length);

        // TODO make this start printing only after speech bubble is fully visible
        printVoiceLine(voiceLines[randomVoiceLineIndex]);
        return () => {
            if (catAnimationCanellationHandle) {
               cancelAnimationFrame(catAnimationCanellationHandle);
            }
        };
    });

    const nextPage = () : void => {
        pageIndex++;
        fetchNextItemPage();
    }
    
    const previousPage = () : void => {
        if (pageIndex > 1){
            pageIndex--;
        }
    }

    const returnToHome = () : void => {
        goto("/home");
    }

    const buyDuck = () : void => {
        previewedDuck.isPurchased = true;

        deselectDuckToPurchase();
        printVoiceLine(purchasedVoiceLine);
    }

    const wrapDuckIdInHttpsCloudfrontCall = (duckId: string) : string => {
        return `https://${cloudfrontDistributionDomainName}/Ducks/Outfits/duck-${duckId}.png`
    }

    const fetchNextItemPage = () : void => {
        
    }

    let catFrameCounter: number = 0;
    let catAnimationCanellationHandle: number;
    let catIndex: number = 0;
    let catArray: Array<string> = [
        Cat1, Cat2, Cat3, Cat4, Cat5, Cat6, Cat7, Cat8, Cat9, Cat10,
    ]

    const animateCat = () : void => {
        if (catFrameCounter % 12 == 0){
            catFrameCounter = 0;
            currentCat = catArray[catIndex];
            catIndex = (catIndex + 1) % catArray.length;
        }
        catFrameCounter++;
        catAnimationCanellationHandle = requestAnimationFrame(animateCat);
    }

</script>
<main bind:this={main} class="flex justify-center w-full relative overflow-hidden">
    <button class="w-15 h-12 absolute left-5 bottom-5 z-200 rounded-md flex justify-center items-center hover:cursor-pointer active:bg-[rgba(255, 255, 255, 0.99)]" style="background: rgba(0, 0, 0, 0.6);" onclick="{returnToHome}" aria-label="return home">
        <svg class="w-6 h-6 z-210" style="fill: rgba(255, 255, 255, 0.9);" viewBox="0 0 96.154 96.154">
            <g>
                <path d="M75.183,0.561L17.578,46.513c-0.951,0.76-0.951,2.367,0,3.126l57.608,45.955c0.689,0.547,1.717,0.709,2.61,0.414
                    c0.186-0.061,0.33-0.129,0.436-0.186c0.65-0.351,1.057-1.025,1.057-1.765V2.093c0-0.736-0.405-1.414-1.057-1.762
                    c-0.108-0.059-0.253-0.127-0.426-0.184C76.903-0.15,75.874,0.011,75.183,0.561z"/>
            </g>
        </svg>
    </button>

    <div bind:this={veilDiv} class="fixed z-100 w-full h-full bg-transparent select-none pointer-events-none"></div>

    <div bind:this={duckSelectedForPurchaseDiv} class="flex flex-col z-120 w-80 h-100 fixed top-60 invisible">
        <div class="w-full h-[80%] relative">
            <img class="absolute z-140" src="{wrapDuckIdInHttpsCloudfrontCall(previewedDuck.id)}" alt="">
        </div>
        <div class="w-full h-[20%] flex justify-center items-center py-3">
            <button class="h-full w-[50%] bg-red-400 hover:cursor-pointer" onclick="{buyDuck}">buy</button>
            <button class="h-full w-[50%] bg-blue-400 hover:cursor-pointer" onclick="{deselectDuckToPurchase}">cancel</button>
        </div>
    </div>

    <div bind:this={speechBubbleComponent} class="absolute z-120 w-100 bg-[#FAF9F6] left-[-400px] p-5 rounded-md invisible transition-all duration-500 ease-out">
        <span class="select-none text-[#242526]" bind:this={speechBubbleTextContents}>{shopkeepVoiceline}</span>
    </div>

    <div class="absolute w-100 h-45 bg-transparent z-60 left-[calc(35%-300px)] overflow-hidden pointer-events-none">
        <div class="relative w-full h-full flex justify-center items-center">
            <img class="h-full" src="{Sign}" alt=""/>
            <span class="text-center absolute bottom-13 text-[#FAF9F6] text-md">Diddy's duck shop</span>
        </div>
    </div>

    <div class="w-[40%] bg-[#754d2b] h-[calc(100vh-10rem)] z-50 flex flex-col justify-end items-end px-2 py-5 overflow-y-hidden relative">
        <div class="w-full h-full absolute">

            <div class="relative w-full h-full">
                <img class="absolute z-60 w-[10%] left-[80%] bottom-[5%]" src="{currentCat}" alt="cat">
                <img class="absolute z-60 w-[40%] left-[5%] top-[5%]" src="{Shelf}" alt="">
                <img class="w-full" src="{Padding}" alt=""/>
                <img class="w-full" src="{Padding}" alt=""/>
                <video 
                bind:this={shopkeepDiv}
                src={ShopkeepCid} 
                autoplay 
                loop 
                muted 
                    class="w-full object-cover relative"
                >
                </video>
            </div>
            <!-- this is rancid -->
        </div>
    </div>

    <div bind:this={DuckSelectionAreaDiv} class="w-[60%] bg-[var(--color-bg)] h-[calc(100vh-10rem)] flex flex-col justify-start items-center pt-3 relative">
        <img class="absolute w-full h-full z-0" src="{userTheme === "light" ? TableLight : TableDark}" alt="table">
        {#if isDuckPageActive}
        <div class="w-[70%] h-[92%] bg-blue-950 rounded-2xl my-[1%] flex flex-col justify-center items-center z-10">
            <div class="h-[12%] w-full flex flex-col justify-start px-2 pt-2 rounded-t-2xl">

                <!-- TODO I don't like the color on this... -->
                <div class="w-full h-[45%] bg-[var(--color-accent-1)] p2 flex flex-col justify-center items-center rounded-lg">
                    <div class="w-[25%] h-full flex justify-center items-center pt-2">
                        
                        <button class="h-full w-[50%] mx-2 bg-blue-300 rounded-t-xl flex justify-center items-center hover:cursor-pointer active:bg-[var(--color-bg)]" class:bg-blue-950={isDuckPageActive} aria-label="ducks" onclick="{() => {isDuckPageActive = true; isPlantPageActive = false;}}">
                            <svg class="h-7.5 w-7.5 fill-white" viewBox="0 0 512 512">
                                <g>
                                    <path class="st0" d="M442.973,250.491c-25.635,18.05-196.165,53.474-141.134-74.936c3.975-11.693,6.732-29.452,6.732-42.457
                                        c0-64.839-53.389-117.403-119.24-117.403c-50.361,0-93.398,30.764-110.867,74.224c-34.196,6.826-42.062-6.929-48.861-22.794
                                        C22.261,50.005,3.509,54.898,0.255,76.915c-2.288,15.462,10.727,57.347,44.004,70.52c-9.423,4.482-17.365,10.671-24.444,18.754
                                        c-9.507,10.877,2.654,29.198,16.147,24.566c12.733-4.37,32.433-6.001,45.419-6.358c5.814,13.109,13.09,24.398,19.972,33.568
                                        c7.351,9.799-3.319,16.916-25.936,53.812c-30.979,50.549-35.874,117.403,2.992,165.822
                                        c46.497,57.937,139.418,58.706,242.137,58.706c141.998,0,178.706-146.076,188.466-205.456
                                        C521.529,214.702,493.813,214.702,442.973,250.491z M153.119,131.945c-10.802,0-19.559-8.758-19.559-19.569
                                        c0-10.802,8.758-19.569,19.559-19.569c10.811,0,19.569,8.767,19.569,19.569C172.688,123.187,163.93,131.945,153.119,131.945z"/>
                                </g>
                            </svg>
                        </button>
                        <button class="h-full w-[50%] mx-2 bg-blue-300 rounded-t-xl flex justify-center items-center hover:cursor-pointer active:bg-[var(--color-bg)]" class:bg-blue-950={isPlantPageActive} aria-label="decorations" onclick="{() => {isDuckPageActive = false; isPlantPageActive = true;}}">
                            <svg class="h-7.5 w-7.5 fill-white" viewBox="0 0 48 48">
                            <path d="M0 0h48v48H0z" fill="none"/>
                            <g id="Shopicon">
                                <path d="M28.783,23.536c1.846-0.252,3.498-1.38,4.431-3.068c0.93-1.681,1.02-3.717,0.299-5.468
                                    c0.721-1.751,0.631-3.787-0.299-5.468V9.531c-0.937-1.691-2.589-2.806-4.423-3.057C27.672,4.939,25.902,4,24,4
                                    s-3.672,0.939-4.792,2.475c-1.835,0.251-3.488,1.365-4.423,3.058c-0.929,1.681-1.019,3.717-0.298,5.468
                                    c-0.72,1.751-0.63,3.787,0.299,5.468c0.934,1.688,2.586,2.816,4.431,3.068c0.711,0.97,1.683,1.699,2.783,2.104V44h4V25.64
                                    C27.1,25.235,28.073,24.506,28.783,23.536z M24,11c2.209,0,4,1.791,4,4c0,2.209-1.791,4-4,4s-4-1.791-4-4
                                    C20,12.791,21.791,11,24,11z"/>
                                <path d="M29.445,33.214c-2.054,2.054-2.054,5.383,0,7.437c2.054,2.054,5.383,2.054,7.437,0c3.719-3.719,3.187-10.624,3.187-10.624
                                    S33.163,29.495,29.445,33.214z"/>
                                <path d="M7.931,30.095c0,0-0.531,6.906,3.187,10.624c2.054,2.054,5.383,2.054,7.437,0c2.054-2.054,2.054-5.383,0-7.437
                                    C14.837,29.564,7.931,30.095,7.931,30.095z"/>
                            </g>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="w-full h-[10%] bg-blue-950 p2"></div>

                <div class="w-full h-[45%] bg-[var(--color-tile)] p2 rounded-t-lg flex justify-between">
                    <div class="h-full w-[25%]"></div>
                    <div class="w-[50%] h-full flex justify-center items-center text-2xl">
                        <span>Purchaseable ducks</span>
                    </div>
                    <div class="h-full w-[25%] flex justify-center text-xl items-start p-3">
                        <span class="mx-1" >1413</span> 
                        <img class="h-full mx-1" src="{Coin}"alt="coin"/>
                    </div>
                </div>
            </div>


            <div class="h-[30%] w-full  flex justify-start px-2">
                <div class="w-[30%] h-full bg-[var(--color-bg)]  p-3">
                    <div class=" w-full h-full rounded-2xl relative">
                        <img class="w-full h-full absolute z-20" src="{Border}" alt="" srcset="">
                        <img class="h-full w-full bg-blue-950" src="{wrapDuckIdInHttpsCloudfrontCall(previewedDuck.id)}" alt="duck">
                    </div>
                </div>
                <div class="w-[70%] bg-[var(--color-bg)] h-full p-3 ">
                    <div class="bg-bluereviewedDuck:-400 w-full h-full relative rounded-2xl overflow-hidden">

                        {#if previewedDuck!.isPurchased}
                            <div class="absolute w-full h-full flex justify-end items-center px-5" style="background: rgba(255, 255, 255, 0.5);">
                                <div class="w-[60%] h-[40%] border-6 border-red-600 text-red-600 flex justify-center items-center rotate-20">
                                    <span class="text-[50px]">Sold Out</span>
                                </div>
                            </div>
                        {/if}

                        <div class="w-full h-[20%] p-5 flex justify-center items-center text-xl bg-[var(--color-primary)]">
                            <span class="pointer-events-none">{previewedDuck.name}</span>
                        </div>
                        <div class="w-full h-[50%] py-5 px-10 bg-[var(--color-tile)]">
                            <p class="pointer-events-none text-sm">{previewedDuck.description}</p>
                        </div>
                        <div class="w-full h-[15%] bg-[var(--color-tile)] flex justify-end items-end py-2 px-10">
                            <div class="w-[15%] h-full flex justify-around items-center">
                                <p class="pointer-events-none text-3xl text-center">{previewedDuck.price}$</p>
                            </div>
                        </div>

                        <div class="w-full h-[15%] flex justify-center items-center px-2 py-1 bg-[var(--color-tile)]">
                            <div class="w-full h-full py-1 px-3 flex justify-start items-start border-t-2 border-t-[var(--color-accent-1)]">
                                <div class="rounded-md h-full bg-[var(--color-bg)] flex justify-center items-center pointer-events-none text-sm p-2 border-amber-400 border-2">
                                    <span>{DuckRarity[previewedDuck!.rarity]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="h-[58%] w-full flex flex-col justify-start items-center pb-2 px-2 rounded-b-2xl">
                <div class="w-full h-full bg-[var(--color-bg)] flex justify-center rounded-b-lg">
                    <div class="h-full w-[90%]">
                        <div class="bg-[var(--color-tile)] h-[88%] w-full grid grid-cols-5 grid-rows-3 gap-x-3 gap-y-2 px-8 py-2 rounded-t-2xl rounded-bl-2xl">
                            {#each ducksPagedIn as duckInQuestion}
                                <button class="p-4 bg-[var(--color-bg)] w-full h-full flex flex-col justify-center items-center rounded-xl hover:cursor-pointer hover:bg-[var(--color-primary)]" onmouseenter="{()=>{ previewedDuck=duckInQuestion}}" onclick="{selectDuckToPurchase}">
                                    <img class="h-full" src="{wrapDuckIdInHttpsCloudfrontCall(duckInQuestion.id)}" alt="duck">
                                </button>
                            {/each}
                        </div>
                        <div class="h-[12%] w-full flex justify-center">
                            <div class="h-full w-[30%] rounded-b-md flex justify-between items-center py-2">
                                <button class="w-[20%] h-full bg-[var(--color-tile)] rounded-l-2xl border-r-[var(--color-accent-1)] border-r-3 hover:cursor-pointer active:bg-blue-950" onclick="{previousPage}">
                                    &lt;
                                </button>
                                <div class="w-[60%] h-full bg-[var(--color-tile)] flex justify-center items-center">
                                    <span>Page: {pageIndex}</span>
                                </div>
                                <button class="w-[20%] h-full bg-[var(--color-tile)] rounded-r-2xl border-l-[var(--color-accent-1)] border-l-3 hover:cursor-pointer active:bg-blue-950" onclick="{nextPage}">
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
    </div>
</main>