<script>
	let cohortName = '';
</script>

<section class="max-w-md mx-auto py-16 text-center">
	<h1 class="text-5xl mb-10 font-bold text-[color:var(--color-primary)]"
		style="font-family: var(--font-ariw9500);">Join a Cohort</h1>
	 <div class="border-2 bg-[color:var(--color-tile)] border-[color:var(--color-accent-1)] rounded-xl pt-8 pb-12 px-10 w-full max-w-2xl flex flex-col items-center">
		<h1 class="text-2xl font-bold mb-6 text-[color:var(--color-accent-2)]">How to do it?</h1>
		<h5 class="text-s mb-10 text-[color:var(--color-text)]">You can either create your own or ask a friend for an invite link</h5>
		
		<input
			bind:value={cohortName}
			placeholder="type a name"
			class="w-full px-4 py-2 border rounded mb-6 bg-white text-black"
		/>

		<button
			class="bg-[color:var(--color-primary)] text-[color:var(--color-tile)] px-6 py-2 rounded font-semibold"
			on:click={() => alert(`Creating cohort: ${cohortName}`)}
		>
			Create
		</button>
	</div>
</section>