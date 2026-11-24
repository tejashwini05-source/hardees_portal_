import { createApiHandler } from "../lib/api-handler.js";
import { connectToDatabase } from "../lib/db.js";
import { getDateKey } from "../lib/date.js";
import { ApiError } from "../lib/errors.js";
import { sendJson } from "../lib/http.js";
import { Promotion } from "../models/Promotion.js";

async function getPromotions(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    await connectToDatabase();
    const today = getDateKey();
    const offers = await Promotion.find({
        enabled: true,
        startDate: { $lte: today },
        endDate: { $gte: today },
    })
        .select("-_id -__v -createdAt -updatedAt")
        .sort({ endDate: 1, name: 1 })
        .lean();
    sendJson(res, 200, { offers });
}

export default createApiHandler(getPromotions);
