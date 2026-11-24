import assert from "node:assert/strict";
import { after, it } from "node:test";
import menuHandler from "../api/menu.js";
import adminMenuHandler from "../api/admin/menu.js";

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
    await menuHandler(
        { method: "GET", headers: { host: "localhost:3000" } },
        res
    );

    assert.equal(res.statusCode, 503);
    assert.equal(JSON.parse(res.body).error.code, "DATABASE_NOT_CONFIGURED");
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
});

it("rejects admin API access before database queries when no session exists", async () => {
    const res = createResponse();
    await adminMenuHandler(
        { method: "GET", headers: { host: "localhost:3000" } },
        res
    );

    assert.equal(res.statusCode, 401);
    assert.equal(JSON.parse(res.body).error.code, "UNAUTHENTICATED");
});
