import { DEFAULT_MENU_ITEMS } from "../data/default-menu.js";
import { MenuItem } from "../models/MenuItem.js";

export async function seedDefaultMenu() {
    await MenuItem.bulkWrite(
        DEFAULT_MENU_ITEMS.map((item) => ({
            updateOne: {
                filter: { id: item.id },
                update: { $setOnInsert: item },
                upsert: true,
            },
        })),
        { ordered: true }
    );
}
