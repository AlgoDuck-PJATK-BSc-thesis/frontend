<script lang='ts'>
	import { page } from "$app/state";
	import { createQuery } from "@tanstack/svelte-query";
	import { FetchFromApi } from "$lib/api/apiCall";
	import type { AvatarResponse } from "./MyProfile";

    const avatarQuery = createQuery({
        queryFn: async () => {
            return await FetchFromApi<AvatarResponse>("item/avatar", {
                method: "GET"
            });
        },
        queryKey: [ "selected-icon" ]
    });
</script>

<a href="/user/me" aria-label="Profile" aria-current={page.url.pathname.startsWith('/user') ? 'page' : undefined} class="no-underline">
    {#if $avatarQuery.isLoading}
        <div class="w-6 h-6 border-t-3 border-t-slate-300 animate-spin rounded-full"></div>
    {:else if $avatarQuery.data?.body}
        <div class="-mr-2 ml-4 h-11 w-11 overflow-hidden rounded-full border-3 border-white bg-[color:var(--color-primary)] shadow">
            <img style="image-rendering: pixelated;" class="h-full w-full -translate-x-[-20%] -translate-y-[-15%] scale-[200%] object-cover object-[left_top]" src={`https://d3018wbyyxg1xc.cloudfront.net/duck/${$avatarQuery.data.body.itemId}/Sprite.png`} alt="">
        </div>  
    {/if}
</a>