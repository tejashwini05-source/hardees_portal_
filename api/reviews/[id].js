import { createApiHandler } from "../../lib/api-handler.js";
import { requireUser } from "../../lib/auth.js";
import { ApiError } from "../../lib/errors.js";
import { readJsonBody, sendJson } from "../../lib/http.js";
import { reviewUpdateSchema } from "../../lib/schemas.js";
import { validate } from "../../lib/validation.js";
import { Review } from "../../models/Review.js";

async function updateReview(req, res) {
    await requireUser(req, ["admin"]);
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }
    const id = typeof req.query?.id === "string" ? req.query.id : "";
    if (!id) {
        throw new ApiError(400, "INVALID_REVIEW_ID", "A review ID is required.");
    }

    const fields = validate(reviewUpdateSchema, await readJsonBody(req));
    const review = await Review.findOneAndUpdate(
        { id },
        { $set: fields },
        { new: true, runValidators: true }
    ).select("-_id -__v");
    if (!review) {
        throw new ApiError(404, "REVIEW_NOT_FOUND", "Review not found.");
    }
    sendJson(res, 200, { review });
}

export default createApiHandler(updateReview);
