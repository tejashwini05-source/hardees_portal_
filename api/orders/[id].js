import { createApiHandler } from "../../lib/api-handler.js";
import { requireUser } from "../../lib/auth.js";
import { ApiError } from "../../lib/errors.js";
import { readJsonBody, sendJson } from "../../lib/http.js";
import { orderStatusSchema } from "../../lib/schemas.js";
import { validate } from "../../lib/validation.js";
import { Order } from "../../models/Order.js";

const allowedTransitions = {
    received: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};

async function updateOrder(req, res) {
    await requireUser(req, ["admin"]);
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    const id = typeof req.query?.id === "string" ? req.query.id : "";
    if (!id) {
        throw new ApiError(400, "INVALID_ORDER_ID", "An order ID is required.");
    }
    const { status } = validate(orderStatusSchema, await readJsonBody(req));
    const current = await Order.findOne({ id }).select("status");
    if (!current) {
        throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
    }
    if (!allowedTransitions[current.status].includes(status)) {
        throw new ApiError(409, "INVALID_ORDER_TRANSITION", "This order status cannot be changed that way.");
    }

    const order = await Order.findOneAndUpdate(
        { id, status: current.status },
        { $set: { status } },
        { new: true }
    );
    if (!order) {
        throw new ApiError(409, "ORDER_CHANGED", "The order changed; refresh and try again.");
    }
    sendJson(res, 200, {
        order: {
            id: order.id,
            guest: order.guest,
            channel: order.channel,
            status: order.status,
        },
    });
}

export default createApiHandler(updateOrder);
