<script lang="ts">
	import PixelFrame from '../../Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
    import PixelFrameSimple from '../../Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
</script>

<div class="w-[30rem] h-[30rem] p-4">
	<div class="w-full bg-white h-full flex flex-col gap-4 p-4">
		<div class="h-[2rem] bg-gray-400 flex items-center justify-center">
			X
		</div>

		<div class="flex-1 bg-gray-100 flex flex-col p-4">
			<div class="h-[70%] bg-blue-400 flex items-center justify-center">
				70%
			</div>
			<div class="h-[30%] bg-red-400 flex items-center justify-center">
				30%
			</div>
		</div>
	</div>
</div>