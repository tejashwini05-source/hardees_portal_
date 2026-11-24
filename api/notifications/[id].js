import { z } from "zod";
import { createApiHandler } from "../../lib/api-handler.js";
import { requireUser } from "../../lib/auth.js";
import { ApiError } from "../../lib/errors.js";
import { readJsonBody, sendJson } from "../../lib/http.js";
import { validate } from "../../lib/validation.js";
import { Notification } from "../../models/Notification.js";

const readStateSchema = z.object({ read: z.boolean() }).strict();

async function updateNotification(req, res) {
    await requireUser(req, ["admin"]);
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }
    const id = typeof req.query?.id === "string" ? req.query.id : "";
    if (!id) {
        throw new ApiError(400, "INVALID_NOTIFICATION_ID", "A notification ID is required.");
    }

    const { read } = validate(readStateSchema, await readJsonBody(req));
    const notification = await Notification.findOneAndUpdate(
        { id },
        { $set: { read } },
        { new: true }
    ).lean();
    if (!notification) {
        throw new ApiError(404, "NOTIFICATION_NOT_FOUND", "Notification not found.");
    }
    sendJson(res, 200, { notification: { id: notification.id, read: notification.read } });
}

export default createApiHandler(updateNotification);
