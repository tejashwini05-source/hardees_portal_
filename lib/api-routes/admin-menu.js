import { randomUUID } from "node:crypto";
import { createApiHandler } from "../api-handler.js";
import { requireUser } from "../auth.js";
import { ApiError } from "../errors.js";
import { readJsonBody, sendJson } from "../http.js";
import { menuItemInputSchema } from "../schemas.js";
import { validate } from "../validation.js";
import { MenuItem } from "../../models/MenuItem.js";

async function manageMenu(req, res) {
    await requireUser(req, ["admin"]);

    if (req.method === "GET") {
        const items = await MenuItem.find()
            .select("-_id -__v -createdAt -updatedAt")
            .sort({ category: 1, name: 1 })
            .lean();
        sendJson(res, 200, { items });
        return;
    }

    if (req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    const body = validate(menuItemInputSchema, await readJsonBody(req));
    const id = body.id || randomUUID();
    const fields = { ...body };
    delete fields.id;
    try {
        const item = await MenuItem.create({ ...fields, id });
        const serializedItem = item.toObject({ versionKey: false });
        delete serializedItem._id;
        delete serializedItem.createdAt;
        delete serializedItem.updatedAt;
        sendJson(res, 201, { item: serializedItem });
    } catch (error) {
        if (error?.code === 11000) {
            throw new ApiError(409, "MENU_ITEM_CONFLICT", "A menu item with this ID already exists.");
        }
        throw error;
    }
}

export default createApiHandler(manageMenu);
