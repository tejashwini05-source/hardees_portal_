import { z } from "zod";
import { createApiHandler } from "../../lib/api-handler.js";
import { serializeUser } from "../../lib/auth.js";
import { connectToDatabase } from "../../lib/db.js";
import { ApiError } from "../../lib/errors.js";
import { enforceLoginRateLimit } from "../../lib/login-rate-limit.js";
import { verifyPassword } from "../../lib/password.js";
import { createSessionToken, setSessionCookie } from "../../lib/session.js";
import { readJsonBody, sendJson } from "../../lib/http.js";
import { validate } from "../../lib/validation.js";
import { User } from "../../models/User.js";

const loginSchema = z
    .object({
        staffId: z.string().trim().min(1).max(40),
        password: z.string().min(1).max(128),
        role: z.enum(["admin", "staff"]),
        rememberMe: z.boolean().default(false),
    })
    .strict();

// Keeps nonexistent-account sign-ins on the same bcrypt verification path.
const DUMMY_PASSWORD_HASH =
    "$2b$12$dOkRgziO5s5Sk1QfZtgrD.Q.foLSVWHg3S.zYseA63X0D66vO.xpm";

async function login(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    const body = validate(loginSchema, await readJsonBody(req));
    const staffId = body.staffId.toUpperCase();
    await connectToDatabase();
    await enforceLoginRateLimit(req, staffId);

    const user = await User.findOne({ staffId }).select("+passwordHash");
    const passwordMatches = await verifyPassword(
        body.password,
        user?.passwordHash || DUMMY_PASSWORD_HASH
    );
    if (
        !user ||
        !passwordMatches ||
        user.role !== body.role ||
        user.status !== "active"
    ) {
        throw new ApiError(401, "INVALID_CREDENTIALS", "Staff ID or password is incorrect.");
    }

    const token = await createSessionToken(user, body.rememberMe);
    setSessionCookie(res, token, body.rememberMe);
    sendJson(res, 200, { user: serializeUser(user) });
}

export default createApiHandler(login);
