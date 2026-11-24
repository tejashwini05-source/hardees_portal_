import { createApiHandler } from "../api-handler.js";
import { connectToDatabase } from "../db.js";
import { ApiError } from "../errors.js";
import { sendJson } from "../http.js";
import { MenuItem } from "../../models/MenuItem.js";

async function getMenu(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    await connectToDatabase();
    const items = await MenuItem.find()
        .select("-_id -__v -createdAt -updatedAt")
        .sort({ category: 1, name: 1 })
        .lean();
    sendJson(res, 200, { items });
}

export default createApiHandler(getMenu);
