import { createHmac } from "node:crypto";
import { ApiError } from "./errors.js";
import { LoginRateLimit } from "../models/LoginRateLimit.js";

const WINDOW_MS = 15 * 60 * 1000;
const ACCOUNT_LIMIT = 8;
const ADDRESS_LIMIT = 25;

function hashKey(value) {
    const secret = process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
        throw new ApiError(
            503,
            "AUTH_NOT_CONFIGURED",
            "Authentication is not configured."
        );
    }
    return createHmac("sha256", secret).update(value).digest("hex");
}

async function recordAttempt(key, windowEnd) {
    const update = {
        $inc: { attempts: 1 },
        $setOnInsert: { expiresAt: new Date(windowEnd + WINDOW_MS) },
    };
    try {
        return await LoginRateLimit.findOneAndUpdate(
            { key },
            update,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    } catch (error) {
        if (error?.code !== 11000) {
            throw error;
        }
        return LoginRateLimit.findOneAndUpdate(
            { key },
            update,
            { upsert: false, new: true }
        );
    }
}

export async function enforceLoginRateLimit(req, staffId) {
    const now = Date.now();
    const windowStart = Math.floor(now / WINDOW_MS) * WINDOW_MS;
    const windowEnd = windowStart + WINDOW_MS;
    const forwardedFor = req.headers["x-forwarded-for"];
    const address =
        typeof forwardedFor === "string"
            ? forwardedFor.split(",")[0].trim().slice(0, 80)
            : "unknown";
    const accountKey = hashKey(`account:${staffId.toUpperCase()}:${windowStart}`);
    const addressKey = hashKey(`address:${address}:${windowStart}`);

    const accountLimit = await recordAttempt(accountKey, windowEnd);
    const addressLimit = await recordAttempt(addressKey, windowEnd);
    if (
        accountLimit.attempts > ACCOUNT_LIMIT ||
        addressLimit.attempts > ADDRESS_LIMIT
    ) {
        throw new ApiError(
            429,
            "TOO_MANY_LOGIN_ATTEMPTS",
            "Too many sign-in attempts. Please wait and try again."
        );
    }
}
