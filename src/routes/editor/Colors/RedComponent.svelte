<script lang="ts">
	import type { RedComponentArgs } from "./TerminalComponentArgs";

  let { options }: { options: RedComponentArgs } = $props();
  setTimeout(()=>{
    options.message = 'haha';
    options.num = 67;
  }, 5000);
</script>

<main class="w-full h-full bg-red-500">
  <span>{options.num}</span>
  <span>{options.message}</span>
</main>