import { randomUUID } from "node:crypto";
import { ApiError } from "./errors.js";

const MAX_BODY_BYTES = 2 * 1024 * 1024;

export function setSecurityHeaders(req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

    const forwardedProto = req.headers["x-forwarded-proto"];
    if (process.env.NODE_ENV === "production" && forwardedProto === "https") {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
}

export function sendJson(res, status, payload) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
}

export function requestId(req) {
    const incoming = req.headers["x-vercel-id"];
    return typeof incoming === "string" && incoming
        ? incoming.slice(0, 100)
        : randomUUID();
}

export function assertSameOrigin(req) {
    const method = req.method?.toUpperCase();
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        return;
    }

    const fetchSite = req.headers["sec-fetch-site"];
    if (fetchSite === "cross-site") {
        throw new ApiError(403, "CROSS_SITE_REQUEST", "This request is not allowed.");
    }

    const origin = req.headers.origin;
    if (!origin) {
        return;
    }

    const expectedHost =
        req.headers["x-forwarded-host"] || req.headers.host;
    let originHost;
    try {
        originHost = new URL(origin).host;
    } catch {
        throw new ApiError(403, "INVALID_ORIGIN", "This request is not allowed.");
    }

    if (!expectedHost || originHost.toLowerCase() !== expectedHost.toLowerCase()) {
        throw new ApiError(403, "CROSS_ORIGIN_REQUEST", "This request is not allowed.");
    }
}

export async function readJsonBody(req) {
    if (req.body !== undefined) {
        if (typeof req.body === "string") {
            return parseJson(req.body);
        }
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            throw new ApiError(400, "INVALID_BODY", "A JSON object is required.");
        }
        if (Buffer.byteLength(JSON.stringify(req.body), "utf8") > MAX_BODY_BYTES) {
            throw new ApiError(413, "BODY_TOO_LARGE", "The request body is too large.");
        }
        return req.body;
    }

    const contentLength = Number(req.headers["content-length"] || 0);
    if (contentLength > MAX_BODY_BYTES) {
        throw new ApiError(413, "BODY_TOO_LARGE", "The request body is too large.");
    }

    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
            throw new ApiError(413, "BODY_TOO_LARGE", "The request body is too large.");
        }
        chunks.push(chunk);
    }

    return parseJson(Buffer.concat(chunks).toString("utf8"));
}

function parseJson(value) {
    try {
        const parsed = JSON.parse(value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error("Expected an object");
        }
        return parsed;
    } catch {
        throw new ApiError(400, "INVALID_JSON", "A valid JSON object is required.");
    }
}

export function methodNotAllowed(res, allowed) {
    res.setHeader("Allow", allowed.join(", "));
    throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
}
