import { createApiHandler } from "../../lib/api-handler.js";
import { requireUser } from "../../lib/auth.js";
import { ApiError } from "../../lib/errors.js";
import { sendJson } from "../../lib/http.js";
import { Notification } from "../../models/Notification.js";

async function markAllRead(req, res) {
    await requireUser(req, ["admin"]);
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    const result = await Notification.updateMany(
        { read: false },
        { $set: { read: true } }
    );
    sendJson(res, 200, { updated: result.modifiedCount });
}

export default createApiHandler(markAllRead);
