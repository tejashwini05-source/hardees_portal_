import { randomUUID } from "node:crypto";
import { createApiHandler } from "../../lib/api-handler.js";
import { requireUser } from "../../lib/auth.js";
import { ApiError } from "../../lib/errors.js";
import { readJsonBody, sendJson } from "../../lib/http.js";
import { promotionInputSchema } from "../../lib/schemas.js";
import { validate } from "../../lib/validation.js";
import { Promotion } from "../../models/Promotion.js";

async function managePromotions(req, res) {
    await requireUser(req, ["admin"]);

    if (req.method === "GET") {
        const offers = await Promotion.find()
            .select("-_id -__v -createdAt -updatedAt")
            .sort({ endDate: 1, name: 1 })
            .lean();
        sendJson(res, 200, { offers });
        return;
    }

    if (req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    const body = validate(promotionInputSchema, await readJsonBody(req));
    const id = body.id || randomUUID();
    const fields = { ...body };
    delete fields.id;
    try {
        const offer = await Promotion.create({ ...fields, id });
        const serializedOffer = offer.toObject({ versionKey: false });
        delete serializedOffer._id;
        delete serializedOffer.createdAt;
        delete serializedOffer.updatedAt;
        sendJson(res, 201, { offer: serializedOffer });
    } catch (error) {
        if (error?.code === 11000) {
            throw new ApiError(
                409,
                "PROMOTION_CONFLICT",
                "A promotion with this ID or code already exists."
            );
        }
        throw error;
    }
}

export default createApiHandler(managePromotions);
