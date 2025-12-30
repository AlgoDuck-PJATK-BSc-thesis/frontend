<script lang="ts">
	import { onMount } from 'svelte';
	import TickIconSvg from '$lib/svg/EditorComponentIcons/TickIconSvg.svelte';
	import CrossIconSvg from '$lib/svg/CrossIconSvg.svelte';

	interface Props {
		message?: string;
		showButtons?: boolean;
		isVisible?: boolean;
		onYes?: () => void;
		onNo?: () => void;
	}

	let { 
		message = "Welcome, traveler!", 
		showButtons = false, 
		isVisible = true,
		onYes = () => {},
		onNo = () => {}
	}: Props = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = $state(null);
	
	// Typing effect state
	let displayedMessage: string = $state("");
	let isTyping: boolean = $state(false);
	let cursorVisible: boolean = $state(true);

	// Animation state
	let animationFrame: number;
	let time: number = 0;

	// Pixel art colors - warm parchment theme
	const colors = {
		background: '#f4e4c1',
		backgroundDark: '#d4c4a1',
		backgroundLight: '#fff8e7',
		border: '#5c3a21',
		borderDark: '#2a1a0a',
		borderLight: '#8c6a51',
		text: '#2a1a0a',
		shadow: 'rgba(42, 26, 10, 0.4)',
		// Animated glow colors
		glowStart: '#ffd700',
		glowEnd: '#ff8c00',
	};

	const SCALE = 4; // Pixel size multiplier
	const BORDER_WIDTH = 2;
	const CORNER_SIZE = 3;
	const PADDING = 4;

	// Canvas dimensions in "pixels" (will be scaled up)
	let pixelWidth = 70;
	let pixelHeight = 40;

	$effect(() => {
		if (!message) return;
		
		isTyping = true;
		displayedMessage = "";
		let i = 0;
		
		const interval = setInterval(() => {
			if (i < message.length) {
				displayedMessage += message[i];
				i++;
			} else {
				isTyping = false;
				clearInterval(interval);
			}
		}, 45);

		return () => clearInterval(interval);
	});

	// Cursor blink
	$effect(() => {
		const interval = setInterval(() => {
			cursorVisible = !cursorVisible;
		}, 400);
		return () => clearInterval(interval);
	});

	onMount(() => {
		ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Disable anti-aliasing for crisp pixels
		ctx.imageSmoothingEnabled = false;

		const animate = () => {
			time += 0.02;
			drawBubble();
			animationFrame = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			if (animationFrame) cancelAnimationFrame(animationFrame);
		};
	});

	function setPixel(x: number, y: number, color: string) {
		if (!ctx) return;
		ctx.fillStyle = color;
		ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
	}

	function drawRect(x: number, y: number, w: number, h: number, color: string) {
		if (!ctx) return;
		ctx.fillStyle = color;
		ctx.fillRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE);
	}

	function drawBubble() {
		if (!ctx) return;

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const w = pixelWidth;
		const h = pixelHeight;
		const c = CORNER_SIZE;
		const b = BORDER_WIDTH;

		// Drop shadow (offset by 1 pixel)
		drawPixelShape(2, 2, w, h, c, colors.shadow);

		// Main background fill
		drawPixelShape(0, 0, w, h, c, colors.background);

		// Inner highlight (top-left)
		drawRect(c, b, w - c * 2, 1, colors.backgroundLight);
		drawRect(b, c, 1, h - c * 2, colors.backgroundLight);

		// Inner shadow (bottom-right)
		drawRect(c, h - b - 1, w - c * 2, 1, colors.backgroundDark);
		drawRect(w - b - 1, c, 1, h - c * 2, colors.backgroundDark);

		// Animated glowing border
		const glowIntensity = (Math.sin(time * 2) + 1) / 2;
		const borderColor = lerpColor(colors.border, colors.glowStart, glowIntensity * 0.3);
		
		// Border - top
		drawRect(c, 0, w - c * 2, b, borderColor);
		// Border - bottom
		drawRect(c, h - b, w - c * 2, b, borderColor);
		// Border - left
		drawRect(0, c, b, h - c * 2, borderColor);
		// Border - right
		drawRect(w - b, c, b, h - c * 2, borderColor);

		// Corner pieces (beveled)
		// Top-left
		drawCorner(0, 0, c, b, borderColor, 'tl');
		// Top-right
		drawCorner(w - c, 0, c, b, borderColor, 'tr');
		// Bottom-left
		drawCorner(0, h - c, c, b, borderColor, 'bl');
		// Bottom-right
		drawCorner(w - c, h - c, c, b, borderColor, 'br');

		// Decorative corner pixels (inner)
		const decorAlpha = 0.3 + Math.sin(time * 3) * 0.1;
		ctx.globalAlpha = decorAlpha;
		setPixel(c + 1, c + 1, colors.border);
		setPixel(w - c - 2, c + 1, colors.border);
		setPixel(c + 1, h - c - 2, colors.border);
		setPixel(w - c - 2, h - c - 2, colors.border);
		ctx.globalAlpha = 1;

		ctx.globalAlpha = 0.03;
		for (let y = 0; y < h; y += 2) {
			drawRect(0, y, w, 1, '#000000');
		}
		ctx.globalAlpha = 1;
	}

	function drawPixelShape(x: number, y: number, w: number, h: number, c: number, color: string) {
		if (!ctx) return;
		ctx.fillStyle = color;
		
		ctx.fillRect((x + c) * SCALE, y * SCALE, (w - c * 2) * SCALE, h * SCALE);
		ctx.fillRect(x * SCALE, (y + c) * SCALE, w * SCALE, (h - c * 2) * SCALE);
		
		for (let i = 0; i < c; i++) {
			ctx.fillRect((x + c - i - 1) * SCALE, (y + i + 1) * SCALE, SCALE, SCALE);
			ctx.fillRect((x + w - c + i) * SCALE, (y + i + 1) * SCALE, SCALE, SCALE);
			ctx.fillRect((x + c - i - 1) * SCALE, (y + h - i - 2) * SCALE, SCALE, SCALE);
			ctx.fillRect((x + w - c + i) * SCALE, (y + h - i - 2) * SCALE, SCALE, SCALE);
		}
	}

	function drawCorner(x: number, y: number, size: number, borderWidth: number, color: string, position: 'tl' | 'tr' | 'bl' | 'br') {
		if (!ctx) return;
		ctx.fillStyle = color;

		for (let i = 0; i < size; i++) {
			const lineWidth = borderWidth;
			switch (position) {
				case 'tl':
					// Diagonal from top-left
					for (let j = 0; j < lineWidth && i + j < size; j++) {
						setPixel(x + size - 1 - i, y + i + j, color);
					}
					break;
				case 'tr':
					for (let j = 0; j < lineWidth && i + j < size; j++) {
						setPixel(x + i, y + i + j, color);
					}
					break;
				case 'bl':
					for (let j = 0; j < lineWidth && i + j < size; j++) {
						setPixel(x + size - 1 - i, y + size - 1 - i - j, color);
					}
					break;
				case 'br':
					for (let j = 0; j < lineWidth && i + j < size; j++) {
						setPixel(x + i, y + size - 1 - i - j, color);
					}
					break;
			}
		}
	}

</script>

<div 
	class="relative transition-all duration-300 ease-out {isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}"
	style="width: {(pixelWidth + 6) * SCALE}px; height: {(pixelHeight + 4) * SCALE}px;"
>
	<canvas
		bind:this={canvas}
		width={(pixelWidth + 6) * SCALE}
		height={(pixelHeight + 4) * SCALE}
		class="absolute inset-0"
		style="image-rendering: pixelated;"
	></canvas>
	
	<!-- Text overlay (using HTML for better text handling) -->
	<div 
		class="absolute flex flex-col justify-between"
		style="
			top: {(CORNER_SIZE + PADDING) * SCALE}px;
			left: {(CORNER_SIZE + PADDING) * SCALE}px;
			right: {(CORNER_SIZE + PADDING + 6) * SCALE}px;
			bottom: {(CORNER_SIZE + PADDING) * SCALE}px;
		"
	>
		<p 
			class="text-[#2a1a0a] leading-relaxed"
			style="font-family: 'Press Start 2P', 'Courier New', monospace; font-size: 10px; line-height: 1.8;"
		>
			{displayedMessage}{#if isTyping && cursorVisible}<span class="text-[#5c3a21]">▌</span>{/if}
		</p>
		
		{#if showButtons && !isTyping}
			<div class="flex flex-row gap-3 justify-center mt-2">
				<button 
					class="pixel-button pixel-button-yes"
					onclick={onYes}
				>
					<TickIconSvg options={{ class: "h-3 w-3 stroke-[3] stroke-white" }}/>
					<span>YES</span>
				</button>
				
				<button 
					class="pixel-button pixel-button-no"
					onclick={onNo}
				>
					<CrossIconSvg options={{ class: "h-3 w-3 stroke-[3] stroke-white" }}/>
					<span>NO</span>
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.pixel-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 4px;
		padding: 6px 12px;
		border: none;
		cursor: pointer;
		font-family: 'Press Start 2P', 'Courier New', monospace;
		font-size: 8px;
		color: white;
		transition: transform 0.1s;
		image-rendering: pixelated;
	}

	.pixel-button:active {
		transform: translateY(2px);
	}

	.pixel-button-yes {
		background: linear-gradient(to bottom, #6ab833 0%, #4a7c23 50%, #3a5c1a 100%);
		box-shadow: 
			inset 2px 2px 0 rgba(255,255,255,0.3),
			inset -2px -2px 0 rgba(0,0,0,0.3),
			2px 2px 0 #2a4a13;
	}

	.pixel-button-yes:hover {
		background: linear-gradient(to bottom, #7ac843 0%, #5a9c2a 50%, #4a7c23 100%);
	}

	.pixel-button-no {
		background: linear-gradient(to bottom, #bc5a5a 0%, #8c3a3a 50%, #6c2a2a 100%);
		box-shadow: 
			inset 2px 2px 0 rgba(255,255,255,0.3),
			inset -2px -2px 0 rgba(0,0,0,0.3),
			2px 2px 0 #5c1a1a;
	}

	.pixel-button-no:hover {
		background: linear-gradient(to bottom, #cc6a6a 0%, #ac4a4a 50%, #8c3a3a 100%);
	}
</style>