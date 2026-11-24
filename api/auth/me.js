import { createApiHandler } from "../../lib/api-handler.js";
import { requireUser, serializeUser } from "../../lib/auth.js";
import { ApiError } from "../../lib/errors.js";
import { sendJson } from "../../lib/http.js";

async function getCurrentUser(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    const user = await requireUser(req);
    sendJson(res, 200, { user: serializeUser(user) });
}

export default createApiHandler(getCurrentUser);
