import { createApiHandler } from "../lib/api-handler.js";
import { ApiError } from "../lib/errors.js";
import adminMenuHandler from "../lib/api-routes/admin-menu.js";
import adminMenuItemHandler from "../lib/api-routes/admin-menu-id.js";
import adminPromotionsHandler from "../lib/api-routes/admin-promotions.js";
import adminPromotionHandler from "../lib/api-routes/admin-promotions-id.js";
import attendanceHandler from "../lib/api-routes/attendance.js";
import loginHandler from "../lib/api-routes/auth-login.js";
import logoutHandler from "../lib/api-routes/auth-logout.js";
import currentUserHandler from "../lib/api-routes/auth-me.js";
import menuHandler from "../lib/api-routes/menu.js";
import notificationsHandler from "../lib/api-routes/notifications.js";
import notificationHandler from "../lib/api-routes/notifications-id.js";
import readAllNotificationsHandler from "../lib/api-routes/notifications-read-all.js";
import ordersHandler from "../lib/api-routes/orders.js";
import orderHandler from "../lib/api-routes/orders-id.js";
import promotionsHandler from "../lib/api-routes/promotions.js";
import reviewsHandler from "../lib/api-routes/reviews.js";
import reviewHandler from "../lib/api-routes/reviews-id.js";
import staffHandler from "../lib/api-routes/staff.js";
import staffMemberHandler from "../lib/api-routes/staff-id.js";

const exactRoutes = new Map([
    ["/api/attendance", attendanceHandler],
    ["/api/auth/login", loginHandler],
    ["/api/auth/logout", logoutHandler],
    ["/api/auth/me", currentUserHandler],
    ["/api/menu", menuHandler],
    ["/api/promotions", promotionsHandler],
    ["/api/staff", staffHandler],
    ["/api/orders", ordersHandler],
    ["/api/notifications", notificationsHandler],
    ["/api/notifications/read-all", readAllNotificationsHandler],
    ["/api/reviews", reviewsHandler],
    ["/api/admin/menu", adminMenuHandler],
    ["/api/admin/promotions", adminPromotionsHandler],
]);

const parameterRoutes = [
    ["/api/admin/menu", adminMenuItemHandler],
    ["/api/admin/promotions", adminPromotionHandler],
    ["/api/staff", staffMemberHandler],
    ["/api/orders", orderHandler],
    ["/api/notifications", notificationHandler],
    ["/api/reviews", reviewHandler],
];

export function resolveApiRoute(pathname) {
    const exactHandler = exactRoutes.get(pathname);
    if (exactHandler) {
        return { handler: exactHandler };
    }

    for (const [basePath, handler] of parameterRoutes) {
        if (pathname.startsWith(`${basePath}/`)) {
            const id = pathname.slice(basePath.length + 1);
            if (id && !id.includes("/")) {
                return { handler, id };
            }
        }
    }

    return null;
}

async function dispatchApiRequest(req, res) {
    let pathname;
    try {
        pathname = new URL(req.url || "/", "http://localhost").pathname
            .split("/")
            .map((segment) => decodeURIComponent(segment))
            .join("/");
    } catch {
        throw new ApiError(400, "INVALID_PATH", "The request path is invalid.");
    }

    const route = resolveApiRoute(pathname);
    if (!route) {
        throw new ApiError(404, "NOT_FOUND", "This API endpoint was not found.");
    }
    if (route.id !== undefined) {
        req.query = { ...(req.query || {}), id: route.id };
    }
    await route.handler(req, res);
}

export default createApiHandler(dispatchApiRequest);
