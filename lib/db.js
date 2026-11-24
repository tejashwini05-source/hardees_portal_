import mongoose from "mongoose";
import { ApiError } from "./errors.js";

const cache = globalThis.__hardeesMongoCache || {
    connection: null,
    promise: null,
    listenerAttached: false,
};

globalThis.__hardeesMongoCache = cache;

export async function connectToDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new ApiError(
            503,
            "DATABASE_NOT_CONFIGURED",
            "The database is not configured."
        );
    }
    if (!/^mongodb(?:\+srv)?:\/\//i.test(uri)) {
        throw new ApiError(
            503,
            "DATABASE_CONFIGURATION_INVALID",
            "The database connection string is invalid."
        );
    }

    if (!cache.listenerAttached) {
        mongoose.connection.on("disconnected", () => {
            cache.connection = null;
            cache.promise = null;
        });
        cache.listenerAttached = true;
    }

    if (cache.connection?.connection.readyState === 1) {
        return cache.connection;
    }

    if (cache.connection?.connection.readyState === 0) {
        cache.connection = null;
        cache.promise = null;
    }

    if (!cache.promise) {
        const dbName = process.env.MONGODB_DB_NAME || "hardees_portal";
        cache.promise = mongoose.connect(uri, { dbName });
    }

    try {
        cache.connection = await cache.promise;
        return cache.connection;
    } catch (error) {
        cache.promise = null;
        cache.connection = null;
        const isParseError = error?.name === "MongoParseError";
        console.error("[database] connection failed", {
            errorName: error instanceof Error ? error.name : "UnknownError",
        });
        throw new ApiError(
            503,
            isParseError ? "DATABASE_CONFIGURATION_INVALID" : "DATABASE_UNAVAILABLE",
            isParseError
                ? "The database connection string is invalid."
                : "The database is temporarily unavailable.",
            { cause: error }
        );
    }
}

export function getMongoose() {
    return mongoose;
}
