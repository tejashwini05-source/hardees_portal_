import { randomUUID } from "node:crypto";
import { createApiHandler } from "../api-handler.js";
import { requireUser } from "../auth.js";
import { getDateKey } from "../date.js";
import { ApiError } from "../errors.js";
import { readJsonBody, sendJson } from "../http.js";
import { orderCreateSchema } from "../schemas.js";
import { validate } from "../validation.js";
import { Order } from "../../models/Order.js";

function serializeOrder(order) {
    const placedAt = new Date(order.placedAt);
    return {
        id: order.id,
        guest: order.guest,
        channel: order.channel,
        status: order.status,
        dateKey: getDateKey(placedAt),
        placed: placedAt.toLocaleTimeString("en-US", {
            timeZone: process.env.APP_TIMEZONE || "America/New_York",
            hour: "numeric",
            minute: "2-digit",
        }),
        placedAt: placedAt.toISOString(),
        items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        })),
    };
}

async function manageOrders(req, res) {
    const user = await requireUser(req, ["admin"]);

    if (req.method === "GET") {
        const today = getDateKey();
        const orders = await Order.find()
            .sort({ placedAt: -1 })
            .limit(500)
            .lean();
        sendJson(res, 200, { orders: orders.map(serializeOrder), today });
        return;
    }

    if (req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    const body = validate(orderCreateSchema, await readJsonBody(req));
    getDateKey();
    const id = `HD-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const order = await Order.create({
        id,
        guest: body.guest,
        channel: body.channel,
        items: body.items,
        status: "received",
        placedAt: new Date(),
        createdBy: user._id,
    });
    sendJson(res, 201, { order: serializeOrder(order) });
}

export default createApiHandler(manageOrders);
