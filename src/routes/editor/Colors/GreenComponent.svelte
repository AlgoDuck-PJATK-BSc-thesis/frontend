<script lang="ts">
	import type { GreenComponentArgs } from "./TerminalComponentArgs";

  let { options }: { options: GreenComponentArgs } = $props();
  setTimeout(()=>{
    options.message = 'hmmmm';
  }, 5000);
</script>

<main class="w-full h-full bg-green-500">
  <span>{options.message}</span>
</main>