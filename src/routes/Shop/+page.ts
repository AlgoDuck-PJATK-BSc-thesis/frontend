import type { DuckDto } from "../../Types/DuckDto";
import type { ShopPageLoad } from "../../Types/ShopPageLoadType";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) : Promise<ShopPageLoad> => {


    const outfitCloudfrontUuids: Array<string> = [
        "03a4dced-f802-4cc5-b239-e0d4c3be9dcd",
        "052b219a-ec0b-430a-a7db-95c5db35dfce",
        "16d4a949-0f5f-481a-b9d6-e0329f9d7dd3",
        "182769e6-ff23-4584-a6fd-83d1c71725e8",
        "3cf1b82e-704a-4f2b-8bc0-af22b41dec14",
        "56ef2a57-707e-43d4-b62e-0c69ed4e8c65",
        "6239a5ed-45e7-4316-80c2-b3b4c7eeab5f",
        "660d65f2-6b1f-49c0-ac05-cfc0af7dc080",
        "6e231d75-91ff-4112-8d25-7f289b6e6f04",
        "833e927f-55cf-43e1-9653-647819e09bf2",
        "88ae6422-cb6f-4245-8367-cf46e381d886",
        "8e32fcf2-a192-4cd1-ad41-2e4362b6007d",
        "be99f3f8-412a-4503-99d6-52fee988ad88",
    ]
    
    let fetched: Array<DuckDto> = []; 
    for (let i = 0; i < outfitCloudfrontUuids.length; i++){
        fetched.push({
            id: outfitCloudfrontUuids[i],
            name: "name",
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo dolorem vel dolore nemo commodi odit, nostrum quidem maxime, in amet nobis, nam delectus quis voluptate doloremque rem consequuntur aliquam. Sunt?",
            isPurchased: i % 2 == 0,
            price: 100 * i,
            rarity: i % 5,
        });
    }

    return { ducksFetched: fetched };
}
