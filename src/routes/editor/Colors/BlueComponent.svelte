
<script lang="ts">
	import type { BlueComponentArgs } from "./TerminalComponentArgs";

  let { options }: { options: BlueComponentArgs } = $props();
  setTimeout(()=>{
    options.num = 65;
  }, 5000);
</script>

<main class="w-full h-full bg-blue-500">
  <span>{options.num}</span>
</main>