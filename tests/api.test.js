import assert from "node:assert/strict";
import { after, it } from "node:test";
import apiHandler, { resolveApiRoute } from "../api/[...path].js";

const originalMongoUri = process.env.MONGODB_URI;

after(() => {
    if (originalMongoUri === undefined) {
        delete process.env.MONGODB_URI;
    } else {
        process.env.MONGODB_URI = originalMongoUri;
    }
});

function createResponse() {
    const headers = new Map();
    return {
        headers,
        statusCode: 200,
        body: "",
        setHeader(name, value) {
            headers.set(name.toLowerCase(), value);
        },
        end(value) {
            this.body = value;
        },
    };
}

it("returns a clear configuration error from public API routes without MongoDB", async () => {
    delete process.env.MONGODB_URI;
    const res = createResponse();
    await apiHandler(
        {
            method: "GET",
            url: "/api/menu",
            headers: { host: "localhost:3000" },
        },
        res
    );

    assert.equal(res.statusCode, 503);
    assert.equal(JSON.parse(res.body).error.code, "DATABASE_NOT_CONFIGURED");
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
});

it("rejects admin API access before database queries when no session exists", async () => {
    const res = createResponse();
    await apiHandler(
        {
            method: "GET",
            url: "/api/admin/menu",
            headers: { host: "localhost:3000" },
        },
        res
    );

    assert.equal(res.statusCode, 401);
    assert.equal(JSON.parse(res.body).error.code, "UNAUTHENTICATED");
});

it("routes dynamic API paths and rejects unknown endpoints", async () => {
    const dynamicResponse = createResponse();
    await apiHandler(
        {
            method: "PATCH",
            url: "/api/orders/HD-123",
            headers: { host: "localhost:3000" },
        },
        dynamicResponse
    );
    assert.equal(dynamicResponse.statusCode, 401);
    assert.equal(JSON.parse(dynamicResponse.body).error.code, "UNAUTHENTICATED");

    const missingResponse = createResponse();
    await apiHandler(
        {
            method: "GET",
            url: "/api/not-a-route",
            headers: { host: "localhost:3000" },
        },
        missingResponse
    );
    assert.equal(missingResponse.statusCode, 404);
    assert.equal(JSON.parse(missingResponse.body).error.code, "NOT_FOUND");
});

it("preserves every existing API route, including collection actions and IDs", () => {
    const collectionPaths = [
        "/api/attendance",
        "/api/auth/login",
        "/api/auth/logout",
        "/api/auth/me",
        "/api/menu",
        "/api/promotions",
        "/api/staff",
        "/api/orders",
        "/api/notifications",
        "/api/notifications/read-all",
        "/api/reviews",
        "/api/admin/menu",
        "/api/admin/promotions",
    ];
    const itemPaths = [
        "/api/admin/menu/menu-item-1",
        "/api/admin/promotions/promo-1",
        "/api/staff/staff-1",
        "/api/orders/order-1",
        "/api/notifications/notification-1",
        "/api/reviews/review-1",
    ];

    for (const pathname of collectionPaths) {
        const route = resolveApiRoute(pathname);
        assert.ok(route?.handler, `${pathname} should resolve`);
        if (pathname === "/api/notifications/read-all") {
            assert.equal(route.id, undefined);
        }
    }
    for (const pathname of itemPaths) {
        const route = resolveApiRoute(pathname);
        assert.ok(route?.handler, `${pathname} should resolve`);
        assert.equal(route.id, pathname.split("/").pop());
    }
});
