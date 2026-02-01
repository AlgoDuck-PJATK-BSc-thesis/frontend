<script lang='ts'>
    let { options }: { options: { 
        checked?: boolean,
        oncheck: (() => void), 
        onuncheck: (() => void) 
    }} = $props();
</script>

<input 
    checked={options.checked ?? false} 
    class="w-6 h-6 rounded border-2 border-[#3c3c3c] bg-[#3c3c3c] checked:bg-[#0e639c] checked:border-[#0e639c] cursor-pointer accent-[#0e639c] transition-colors" 
    type="checkbox" 
    aria-label="Toggle variable as operated on in place" 
    onchange={(e) => {
        if (e.currentTarget.checked) {
            options.oncheck();
        } else {
            options.onuncheck();
        }
    }}
/>