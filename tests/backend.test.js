import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { z } from "zod";
import { connectToDatabase } from "../lib/db.js";
import { ApiError } from "../lib/errors.js";
import { assertSameOrigin, readJsonBody } from "../lib/http.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { menuItemInputSchema, promotionInputSchema } from "../lib/schemas.js";
import {
    createSessionToken,
    getSessionToken,
    verifySessionToken,
} from "../lib/session.js";
import { validate } from "../lib/validation.js";
import { DEFAULT_MENU_ITEMS } from "../data/default-menu.js";

const originalEnvironment = {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
};

after(() => {
    if (originalEnvironment.MONGODB_URI === undefined) {
        delete process.env.MONGODB_URI;
    } else {
        process.env.MONGODB_URI = originalEnvironment.MONGODB_URI;
    }

    if (originalEnvironment.JWT_SECRET === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalEnvironment.JWT_SECRET;
    }
});

describe("API request validation", () => {
    it("accepts every seeded menu item and rejects unsafe menu image paths", () => {
        for (const item of DEFAULT_MENU_ITEMS) {
            assert.equal(menuItemInputSchema.safeParse(item).success, true);
        }
        assert.equal(
            menuItemInputSchema.safeParse({
                ...DEFAULT_MENU_ITEMS[0],
                image: "images/../../private.svg",
            }).success,
            false
        );
    });

    it("validates promotion dates and discount values", () => {
        const offer = {
            id: "summer-offer",
            code: "SUMMER10",
            name: "Summer offer",
            discountType: "percentage",
            campaign: "Standard",
            discountValue: 10,
            minimumOrder: 0,
            maximumDiscount: 20,
            startDate: "2026-06-01",
            endDate: "2026-06-30",
            enabled: true,
        };
        assert.equal(promotionInputSchema.safeParse(offer).success, true);
        assert.equal(
            promotionInputSchema.safeParse({
                ...offer,
                startDate: "2026-02-31",
                discountValue: 101,
            }).success,
            false
        );
    });

    it("accepts same-origin mutations and rejects cross-origin mutations", () => {
        assert.doesNotThrow(() =>
            assertSameOrigin({
                method: "POST",
                headers: { origin: "https://portal.example", host: "portal.example" },
            })
        );
        assert.throws(
            () =>
                assertSameOrigin({
                    method: "POST",
                    headers: { origin: "https://outside.example", host: "portal.example" },
                }),
            (error) => error instanceof ApiError && error.status === 403
        );
    });

    it("requires a JSON object and reports schema issues without echoing input", async () => {
        assert.deepEqual(
            await readJsonBody({ body: { value: "ok" }, headers: {} }),
            { value: "ok" }
        );

        assert.throws(
            () => validate(z.object({ staffId: z.string().min(1) }), { staffId: "" }),
            (error) =>
                error instanceof ApiError &&
                error.status === 400 &&
                error.code === "VALIDATION_FAILED" &&
                !JSON.stringify(error.details).includes("password")
        );
    });

    it("returns an explicit configuration error if MongoDB is not configured", async () => {
        delete process.env.MONGODB_URI;
        await assert.rejects(
            connectToDatabase(),
            (error) =>
                error instanceof ApiError &&
                error.status === 503 &&
                error.code === "DATABASE_NOT_CONFIGURED"
        );
    });

    it("rejects an invalid MongoDB URI scheme without attempting a connection", async () => {
        process.env.MONGODB_URI = "not-a-mongodb-uri";
        await assert.rejects(
            connectToDatabase(),
            (error) =>
                error instanceof ApiError &&
                error.status === 503 &&
                error.code === "DATABASE_CONFIGURATION_INVALID"
        );
    });
});

describe("authentication primitives", () => {
    it("hashes passwords and verifies only the matching value", async () => {
        const password = "A sufficiently long test password";
        const passwordHash = await hashPassword(password);
        assert.notEqual(passwordHash, password);
        assert.equal(await verifyPassword(password, passwordHash), true);
        assert.equal(await verifyPassword("another password", passwordHash), false);
    });

    it("signs and verifies a session token with a required secret", async () => {
        process.env.JWT_SECRET = "test-only-signing-key-with-at-least-32-bytes";
        const token = await createSessionToken(
            { _id: { toString: () => "staff-record-id" }, sessionVersion: 2 },
            false
        );
        const payload = await verifySessionToken(token);
        assert.equal(payload.sub, "staff-record-id");
        assert.equal(payload.sv, 2);

        const [header, claims, signature] = token.split(".");
        const replacement = signature[0] === "a" ? "b" : "a";
        await assert.rejects(
            verifySessionToken(`${header}.${claims}.${replacement}${signature.slice(1)}`),
            (error) => error instanceof ApiError && error.status === 401
        );
    });

    it("does not disguise missing signing configuration as an invalid session", async () => {
        delete process.env.JWT_SECRET;
        await assert.rejects(
            verifySessionToken("invalid"),
            (error) =>
                error instanceof ApiError &&
                error.status === 503 &&
                error.code === "AUTH_NOT_CONFIGURED"
        );
    });

    it("reads only the named session cookie", () => {
        assert.equal(
            getSessionToken({
                headers: { cookie: "theme=dark; hardees_session=abc%2F123" },
            }),
            "abc/123"
        );
        assert.equal(getSessionToken({ headers: { cookie: "theme=dark" } }), null);
    });
});
