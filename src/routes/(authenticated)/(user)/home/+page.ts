import type { PageLoad } from "../delete-account/$types";

export const load: PageLoad = async ({ fetch, params }) => { 
    return {
        ducks: outfitCloudfrontUuids.map((id) => { return {
            id: id,
        }})
    };
}

const outfitCloudfrontUuids: Array<string> = [
    "052b219a-ec0b-430a-a7db-95c5db35dfce",
    "03a4dced-f802-4cc5-b239-e0d4c3be9dcd",
    "182769e6-ff23-4584-a6fd-83d1c71725e8",
]