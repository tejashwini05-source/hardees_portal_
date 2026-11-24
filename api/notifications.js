import { randomUUID } from "node:crypto";
import { createApiHandler } from "../lib/api-handler.js";
import { requireUser } from "../lib/auth.js";
import { getDateKey } from "../lib/date.js";
import { ApiError } from "../lib/errors.js";
import { readJsonBody, sendJson } from "../lib/http.js";
import { notificationInputSchema } from "../lib/schemas.js";
import { validate } from "../lib/validation.js";
import { Notification } from "../models/Notification.js";

function relativeTime(value) {
    const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
    if (elapsed < 60_000) return "Just now";
    if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)} min ago`;
    if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)} hr ago`;
    return new Date(value).toLocaleDateString("en-US", {
        timeZone: process.env.APP_TIMEZONE || "America/New_York",
        month: "short",
        day: "numeric",
    });
}

function serializeNotification(item) {
    return {
        id: item.id,
        type: item.type,
        title: item.title,
        detail: item.detail,
        time: relativeTime(item.createdAt),
        read: item.read,
    };
}

async function manageNotifications(req, res) {
    await requireUser(req, ["admin"]);

    if (req.method === "GET") {
        getDateKey();
        const items = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(200)
            .lean();
        sendJson(res, 200, { notifications: items.map(serializeNotification) });
        return;
    }

    if (req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    const body = validate(notificationInputSchema, await readJsonBody(req));
    const notification = await Notification.create({
        id: randomUUID(),
        ...body,
    });
    sendJson(res, 201, { notification: serializeNotification(notification) });
}

export default createApiHandler(manageNotifications);
