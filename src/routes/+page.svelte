<script lang="ts">
	import image from '$lib/images/ponds/image.jpeg';
</script>

<svelte:head>
	<title>Beetcode</title>
	<meta name="description" content="Improve your skills with coding challenges." />
</svelte:head>

<section class="flex flex-col items-center text-center px-4 py-24">
	<h1 class="text-2xl text-[color:var(--color-primary)] font-bold mb-4">Improve your skills</h1>
	
	<p class="text-[0.95rem] text-[color:var(--color-text)] mb-8">
		Transform your coding skills, one problem at a time
	</p>

	<div class="flex gap-4 mb-8">
		<a href="/signup"
			class="px-5 py-[0.6rem] text-sm no-underline border-2 border-[color:var(--color-text)] bg-[color:var(--color-primary)] text-black hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
			Start
		</a>
		<a href="/learnmore"
			class="px-5 py-[0.6rem] text-sm no-underline border-2 border-[color:var(--color-text)] text-[color:var(--color-text)] bg-transparent hover:underline hover:translate-x-1 transition-all duration-200">
			Learn more →
		</a>
	</div>

	<img src={image} alt="Illustration"
		class="w-full max-w-[360px] h-auto rounded-lg shadow-lg mt-8" />
</section>