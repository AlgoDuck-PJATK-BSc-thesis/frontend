import type { PageLoad } from "../$types";

export const load: PageLoad = ({ url }) => {
	const categoryId: string | null = url.searchParams.get("categoryId");
	return { 
        categoryId
    };
};