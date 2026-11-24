import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { ApiError } from "./errors.js";

export const SESSION_COOKIE = "hardees_session";
const SESSION_ISSUER = "hardees-portal";
const SESSION_AUDIENCE = "hardees-portal";

function getSigningKey() {
    const secret = process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
        throw new ApiError(
            503,
            "AUTH_NOT_CONFIGURED",
            "Authentication is not configured."
        );
    }
    return new TextEncoder().encode(secret);
}

export async function createSessionToken(user, rememberMe = false) {
    return new SignJWT({ sv: user.sessionVersion })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(user._id.toString())
        .setIssuer(SESSION_ISSUER)
        .setAudience(SESSION_AUDIENCE)
        .setIssuedAt()
        .setJti(randomUUID())
        .setExpirationTime(rememberMe ? "30d" : "8h")
        .sign(getSigningKey());
}

export async function verifySessionToken(token) {
    const key = getSigningKey();
    try {
        const { payload } = await jwtVerify(token, key, {
            issuer: SESSION_ISSUER,
            audience: SESSION_AUDIENCE,
            algorithms: ["HS256"],
        });
        if (
            typeof payload.sub !== "string" ||
            !Number.isInteger(payload.sv) ||
            payload.sv < 0
        ) {
            throw new Error("Invalid session claims");
        }
        return payload;
    } catch {
        throw new ApiError(401, "UNAUTHENTICATED", "Please sign in to continue.");
    }
}

export function getSessionToken(req) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        return null;
    }

    for (const part of cookieHeader.split(";")) {
        const separator = part.indexOf("=");
        if (separator < 0) {
            continue;
        }
        if (part.slice(0, separator).trim() === SESSION_COOKIE) {
            const value = part.slice(separator + 1).trim();
            try {
                return decodeURIComponent(value);
            } catch {
                return null;
            }
        }
    }

    return null;
}

export function setSessionCookie(res, token, rememberMe = false) {
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
    const attributes = [
        `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        `Max-Age=${maxAge}`,
    ];
    if (process.env.NODE_ENV === "production") {
        attributes.push("Secure");
    }
    res.setHeader("Set-Cookie", attributes.join("; "));
}

export function clearSessionCookie(res) {
    const attributes = [
        `${SESSION_COOKIE}=`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        "Max-Age=0",
        "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    ];
    if (process.env.NODE_ENV === "production") {
        attributes.push("Secure");
    }
    res.setHeader("Set-Cookie", attributes.join("; "));
}
