import type { PageLoad } from "../$types";
import type { CategoriesPageLoad } from "../../Types/Categories/CategoriesPageLoad";
import type { CategoryDto } from "../../Types/Categories/CategoryDto";

export const load: PageLoad = async ({ params }) : Promise<CategoriesPageLoad> => {    
    let fetched: Array<CategoryDto> = []; 

    for (let i = 0; i < 10; i++){
        fetched.push({
            id: `${crypto.randomUUID()}`,
            name: "category",
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quisquam velit voluptate, aliquid cupiditate iste id recusandae. Inventore soluta, distinctio modi unde laborum aspernatur debitis, labore, dolor ut eligendi temporibus laudantium!"
        })
    };

    return { LoadedCategories: fetched };
}
