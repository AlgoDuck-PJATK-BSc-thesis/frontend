<script lang="ts">
  import Button from '$lib/Components/ButtonComponents/Button.svelte';
  import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
  import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';
  import { onMount, onDestroy } from 'svelte';

  type Contest = { id: string; name: string; startTime: string; endTime: string };
  export let data: { active: Contest[]; inactive: Contest[] };

  let showActive = true;
  let nowMs = Date.now();
  let intervalId: number;

  onMount(() => {
    if (!data || (!data.active?.length && !data.inactive?.length)) {
      const KEY = 'contest_fallback_endMs';
      let endMs = Number(localStorage.getItem(KEY));
      if (!endMs || Number.isNaN(endMs)) {
        endMs = Date.now() + 36 * 3600e3;
        localStorage.setItem(KEY, String(endMs));
      }
      const startMs = endMs - 2 * 24 * 3600e3;
      data = {
        active: [
          {
            id: 'jan-2025',
            name: 'January Contest',
            startTime: new Date(startMs).toISOString(),
            endTime: new Date(endMs).toISOString()
          }
        ],
        inactive: [
          { id: 'dec-2024', name: 'December 2024 Contest', startTime: '2024-12-01T00:00:00Z', endTime: '2024-12-31T23:59:59Z' },
          { id: 'nov-2024', name: 'November 2024 Contest', startTime: '2024-11-01T00:00:00Z', endTime: '2024-11-30T23:59:59Z' },
          { id: 'oct-2024', name: 'October 2024 Contest', startTime: '2024-10-01T00:00:00Z', endTime: '2024-10-31T23:59:59Z' },
          { id: 'sep-2024', name: 'September 2024 Contest', startTime: '2024-09-01T00:00:00Z', endTime: '2024-09-30T23:59:59Z' }
        ]
      };
    }
    nowMs = Date.now();
    intervalId = window.setInterval(() => {
      nowMs = Date.now();
    }, 1000);
  });

  onDestroy(() => clearInterval(intervalId));

  function left(endISO: string, now: number) {
    const diff = new Date(endISO).getTime() - now;
    if (diff <= 0) return 'Time expired!';
    let s = Math.floor(diff / 1000);
    const d = Math.floor(s / 86400);
    s %= 86400;
    const h = Math.floor(s / 3600);
    s %= 3600;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const days = d ? `${d} day${d === 1 ? '' : 's'} ` : '';
    return `${days}${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')} hrs`;
  }

  function setFilter(mode: 'active' | 'inactive') {
    showActive = mode === 'active';
  }
</script>

<section class="max-w-[1100px] mx-auto px-8 pt-7 pb-14 text-[color:var(--color-text)]">
  <h1
    class="mb-4 text-[2.75rem] leading-none md:text-6xl font-black tracking-[0.08em] text-[color:var(--color-primary)] [text-shadow:5.5px_1.5px_0_#000,-2px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_2px_0_#000]"
    style="font-family: var(--font-ariw9500);"
  >
    Contests
  </h1>

  <div class="mb-6 flex items-center gap-3" role="tablist" aria-label="Filter contests">
    <span
      class={`inline-block transition-all duration-150 ${showActive ? 'scale-110 opacity-100' : 'scale-95 opacity-60 filter grayscale'}`}
      role="tab"
      aria-selected={showActive}
      on:click={() => setFilter('active')}
    >
      <Button size="medium" label="ACTIVE" labelColor="[color:#000]" labelFontSize="1rem" labelFontFamily="var(--font-ariw9500)" labelFontWeight="bold" />
    </span>
    <span
      class={`inline-block transition-all duration-150 ${!showActive ? 'scale-110 opacity-100' : 'scale-95 opacity-60 filter grayscale'}`}
      role="tab"
      aria-selected={!showActive}
      on:click={() => setFilter('inactive')}
    >
      <Button size="medium" label="INACTIVE" labelColor="[color:#000]" labelFontSize="1rem" labelFontFamily="var(--font-ariw9500)" labelFontWeight="bold" />
    </span>
  </div>

  {#if showActive}
    <div class="grid gap-4 max-w-[900px]">
      {#each data.active as c}
        <a class="no-underline" href={`/contest/${c.id}?title=${encodeURIComponent(c.name)}`} aria-label={`Open ${c.name}`}>
          <PixelFrame className="w-full px-5 py-4 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]">
            <div class="flex items-center justify-between gap-4">
              <span class="text-xl font-black text-[color:var(--color-accent-2)]" style="font-family: var(--font-ariw9500);">
                {c.name}
              </span>
              <PixelFrameMini className="px-3 py-1 text-sm bg-[color:var(--color-bg)]">
                Remaining time: {left(c.endTime, nowMs)}
              </PixelFrameMini>
            </div>
          </PixelFrame>
        </a>
      {/each}
      {#if !data.active.length}
        <PixelFrame className="w-full px-5 py-3 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]">
          <span>No active contests.</span>
        </PixelFrame>
      {/if}
    </div>
  {:else}
    <div class="grid gap-4 max-w-[900px]">
      {#each data.inactive as c}
        <a class="no-underline" href={`/contest/${c.id}?title=${encodeURIComponent(c.name)}`} aria-label={`Open ${c.name} results`}>
          <PixelFrame className="w-full px-5 py-4 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]">
            <div class="flex items-center justify-between gap-4">
              <span class="text-xl font-black text-[color:var(--color-accent-2)]" style="font-family: var(--font-ariw9500);">
                {c.name}
              </span>
              <PixelFrameMini className="px-3 py-1 text-sm bg-[color:var(--color-bg)]">
                Time expired — click here to view results
              </PixelFrameMini>
            </div>
          </PixelFrame>
        </a>
      {/each}
      {#if !data.inactive.length}
        <PixelFrame className="w-full px-5 py-3 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]">
          <span>No inactive contests.</span>
        </PixelFrame>
      {/if}
    </div>
  {/if}
</section>
