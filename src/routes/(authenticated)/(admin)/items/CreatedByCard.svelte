<script lang='ts'>
	import type { StandardResponseDto } from "$lib/api/apiCall";
	import type { UserPreviewDto } from "./column-preview-comps/columnPreviewArgs";

    let { options }: { options: StandardResponseDto<UserPreviewDto> } = $props();
</script>

<div class="w-64 flex flex-col gap-3">
    <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full overflow-hidden flex justify-center items-center bg-admin-bg-secondary border border-admin-border-primary relative shrink-0">
            <img 
                class="absolute w-24 h-24 max-w-none -scale-x-100 -mb-2 -ml-6" 
                src={`https://d3018wbyyxg1xc.cloudfront.net/duck/${options.body.selectedAvatar}/Sprite.png`} 
                alt="User avatar"
            />
        </div>

        <div class="flex flex-col min-w-0">
            <span class="text-sm font-medium text-admin-text-primary truncate">
                {options.body.username}
            </span>
            <span class="text-xs text-admin-text-muted truncate">
                {options.body.email}
            </span>
        </div>
    </div>

    <div class="h-px bg-admin-border-primary"></div>

    <div class="flex items-center justify-between text-xs">
        <span class="text-admin-text-muted">Items Created</span>
        <span class="text-admin-text-secondary font-medium">{options.body.itemCreatedCount}</span>
    </div>
</div>