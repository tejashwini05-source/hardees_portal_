import { createApiHandler } from "../../../lib/api-handler.js";
import { requireUser } from "../../../lib/auth.js";
import { ApiError } from "../../../lib/errors.js";
import { readJsonBody, sendJson } from "../../../lib/http.js";
import { menuItemInputSchema } from "../../../lib/schemas.js";
import { validate } from "../../../lib/validation.js";
import { MenuItem } from "../../../models/MenuItem.js";

async function updateMenuItem(req, res) {
    await requireUser(req, ["admin"]);
    const id = typeof req.query?.id === "string" ? req.query.id : "";
    if (!id) {
        throw new ApiError(400, "INVALID_MENU_ID", "A menu item ID is required.");
    }

    if (req.method === "PATCH") {
        const body = validate(menuItemInputSchema, await readJsonBody(req));
        if (body.id && body.id !== id) {
            throw new ApiError(400, "MENU_ID_MISMATCH", "The menu item ID cannot be changed.");
        }
        const fields = { ...body };
        delete fields.id;
        const item = await MenuItem.findOneAndUpdate(
            { id },
            { $set: fields },
            { new: true, runValidators: true }
        )
            .select("-_id -__v -createdAt -updatedAt")
            .lean();
        if (!item) {
            throw new ApiError(404, "MENU_ITEM_NOT_FOUND", "Menu item not found.");
        }
        sendJson(res, 200, { item });
        return;
    }

    if (req.method === "DELETE") {
        const result = await MenuItem.deleteOne({ id });
        if (result.deletedCount === 0) {
            throw new ApiError(404, "MENU_ITEM_NOT_FOUND", "Menu item not found.");
        }
        sendJson(res, 200, { success: true });
        return;
    }

    res.setHeader("Allow", "PATCH, DELETE");
    throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
}

export default createApiHandler(updateMenuItem);
