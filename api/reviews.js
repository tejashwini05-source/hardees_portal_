import { randomUUID } from "node:crypto";
import { createApiHandler } from "../lib/api-handler.js";
import { requireUser } from "../lib/auth.js";
import { getDateKey } from "../lib/date.js";
import { ApiError } from "../lib/errors.js";
import { readJsonBody, sendJson } from "../lib/http.js";
import { reviewCreateSchema } from "../lib/schemas.js";
import { validate } from "../lib/validation.js";
import { Review } from "../models/Review.js";

function serializeReview(review) {
    return {
        id: review.id,
        guest: review.guest,
        orderId: review.orderId,
        date: new Date(review.createdAt).toLocaleDateString("en-US", {
            timeZone: process.env.APP_TIMEZONE || "America/New_York",
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        complaint: review.complaint,
        reply: review.reply,
        resolved: review.resolved,
    };
}

async function manageReviews(req, res) {
    await requireUser(req, ["admin"]);

    if (req.method === "GET") {
        getDateKey();
        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .limit(500)
            .lean();
        sendJson(res, 200, { reviews: reviews.map(serializeReview) });
        return;
    }

    if (req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    const body = validate(reviewCreateSchema, await readJsonBody(req));
    const review = await Review.create({
        id: randomUUID(),
        ...body,
        complaint: body.complaint || body.rating <= 2,
    });
    sendJson(res, 201, { review: serializeReview(review) });
}

export default createApiHandler(manageReviews);
