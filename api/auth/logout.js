import { createApiHandler } from "../../lib/api-handler.js";
import { invalidateSession } from "../../lib/auth.js";
import { ApiError } from "../../lib/errors.js";
import { sendJson } from "../../lib/http.js";

async function logout(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    await invalidateSession(req, res);
    sendJson(res, 200, { success: true });
}

export default createApiHandler(logout);
