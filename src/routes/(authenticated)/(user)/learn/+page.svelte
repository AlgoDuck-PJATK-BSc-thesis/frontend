<script lang="ts">
	import Title from './_components/Title.svelte';
	import LearnCard from './_components/LearnCard.svelte';
</script>

<div class="min-h-screen px-4 py-10 md:px-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<section class="space-y-8 rounded-3xl px-6 py-8 md:px-10 md:py-10">
			<Title
				title="Algorithms and Data Structures"
				subtitle="Learn with interactive visualizations and Java implementations."
			/>

			<div class="grid gap-6 md:grid-cols-2">
				<LearnCard
					href="/learn/algorithms"
					title="Algorithms"
					description="Sorting, searching, graph algorithms, dynamic programming, and greedy strategies."
				/>
				<LearnCard
					href="/learn/data-structures"
					title="Data Structures"
					description="Stack, queue, linked list, arrays, heaps, trees, tries, hash tables, and graphs."
				/>
			</div>
		</section>
	</div>
</div>
