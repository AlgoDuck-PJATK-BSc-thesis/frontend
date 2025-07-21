<script>
	let cohortName = '';
</script>

<section class="max-w-md mx-auto py-16 text-center">
	<h1 class="text-4xl font-bold mb-6 text-[color:var(--color-primary)]">Welcome to cohorts!</h1>
	<h5 class="text-s mb-10 text-[color:var(--color-text)]">You can either create your own or ask a friend for an invite link</h5>
	
	<input
		bind:value={cohortName}
		placeholder="type a name"
		class="w-full px-4 py-2 border rounded mb-6 bg-white text-black"
	/>

	<button
		class="bg-[color:var(--color-primary)] text-[color:var(--color-bg)] px-6 py-2 rounded font-semibold"
		on:click={() => alert(`Creating cohort: ${cohortName}`)}
	>
		Create
	</button>
</section>