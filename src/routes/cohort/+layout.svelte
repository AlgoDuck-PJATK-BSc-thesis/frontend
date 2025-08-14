<script>
	let cohortName = '';
</script>

<section class="mx-auto max-w-md py-16 text-center">
	<h1
		class="mb-10 text-5xl font-bold text-[color:var(--color-primary)]"
		style="font-family: var(--font-ariw9500);"
	>
		Join a Cohort
	</h1>
	<div
		class="flex w-full max-w-2xl flex-col items-center rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] px-10 pt-8 pb-12"
	>
		<h1 class="mb-6 text-2xl font-bold text-[color:var(--color-accent-2)]">How to do it?</h1>
		<h5 class="text-s mb-10 text-[color:var(--color-text)]">
			You can either create your own or ask a friend for an invite link
		</h5>

		<input
			bind:value={cohortName}
			placeholder="type a name"
			class="mb-6 w-full rounded border bg-white px-4 py-2 text-black"
		/>

		<button
			class="rounded bg-[color:var(--color-primary)] px-6 py-2 font-semibold text-[color:var(--color-tile)]"
			on:click={() => alert(`Creating cohort: ${cohortName}`)}
		>
			Create
		</button>
	</div>
</section>
