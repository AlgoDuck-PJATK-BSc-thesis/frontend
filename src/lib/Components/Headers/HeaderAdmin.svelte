<script lang="ts">
	import type { KeyValuePair } from "../GenericComponents/dropDownMenu/DropDownSelectOptions";

    let routes: KeyValuePair<string, string | KeyValuePair<string, string>[]>[] = [
        {
            key: "home",
            value: "home"
        },
        {
            key: "admin",
            value: [
                {
                    key: "add problem",
                    value: "admin/problem"
                }
            ]
        }
    ] 
</script>

<header
	class="font-body flex flex-row justify-between sticky top-0 z-50 h-16 items-center border-b-4 border-[color:var(--color-bg-header-border)] bg-[color:var(--color-header-user)] text-[color:var(--color-landingpage-subtitle)]"
>
	<div class="flex items-center gap-6 whitespace-nowrap">
		<a href="/home" class="text-lg font-semibold text-[color:var(--color-primary)] no-underline">
			AlgoDuck</a
		>
	</div>

	<nav class="w-[70%] h-full bg-red-500">
	</nav>

	<div class="flex items-center gap-6 whitespace-nowrap">
		<a href="/home" class="text-lg font-semibold text-[color:var(--color-primary)] no-underline">
			AlgoDuck</a
		>
	</div>
</header>