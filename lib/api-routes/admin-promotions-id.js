import { createApiHandler } from "../api-handler.js";
import { requireUser } from "../auth.js";
import { ApiError } from "../errors.js";
import { readJsonBody, sendJson } from "../http.js";
import { promotionInputSchema } from "../schemas.js";
import { validate } from "../validation.js";
import { Promotion } from "../../models/Promotion.js";

async function updatePromotion(req, res) {
    await requireUser(req, ["admin"]);
    const id = typeof req.query?.id === "string" ? req.query.id : "";
    if (!id) {
        throw new ApiError(400, "INVALID_PROMOTION_ID", "A promotion ID is required.");
    }

    if (req.method === "PATCH") {
        const body = validate(promotionInputSchema, await readJsonBody(req));
        if (body.id && body.id !== id) {
            throw new ApiError(400, "PROMOTION_ID_MISMATCH", "The promotion ID cannot be changed.");
        }
        const fields = { ...body };
        delete fields.id;
        try {
            const offer = await Promotion.findOneAndUpdate(
                { id },
                { $set: fields },
                { new: true, runValidators: true }
            )
                .select("-_id -__v -createdAt -updatedAt")
                .lean();
            if (!offer) {
                throw new ApiError(404, "PROMOTION_NOT_FOUND", "Promotion not found.");
            }
            sendJson(res, 200, { offer });
        } catch (error) {
            if (error?.code === 11000) {
                throw new ApiError(409, "PROMOTION_CODE_CONFLICT", "That promotion code is already in use.");
            }
            throw error;
        }
        return;
    }

    if (req.method === "DELETE") {
        const result = await Promotion.deleteOne({ id });
        if (result.deletedCount === 0) {
            throw new ApiError(404, "PROMOTION_NOT_FOUND", "Promotion not found.");
        }
        sendJson(res, 200, { success: true });
        return;
    }

    res.setHeader("Allow", "PATCH, DELETE");
    throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
}

export default createApiHandler(updatePromotion);
