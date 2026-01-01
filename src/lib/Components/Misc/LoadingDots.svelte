<script lang="ts">
	export let label: string = 'Loading';
	export let className: string = '';
	export let ariaLabel: string = 'Loading';
</script>

<span class={`loading-dots ${className}`} role="status" aria-live="polite" aria-label={ariaLabel}>
	{label}<span class="dot">.</span><span class="dot d2">.</span><span class="dot d3">.</span>
</span>

<style>
	.loading-dots {
		display: inline-flex;
		align-items: baseline;
		gap: 0;
	}

	.dot {
		display: inline-block;
		width: 0.35em;
		animation: dotblink 1.2s infinite ease-in-out;
	}

	.d2 {
		animation-delay: 0.15s;
	}

	.d3 {
		animation-delay: 0.3s;
	}

	@keyframes dotblink {
		0% {
			opacity: 0.15;
		}
		20% {
			opacity: 1;
		}
		100% {
			opacity: 0.15;
		}
	}
</style>
