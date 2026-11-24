import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";
import { connectToDatabase, getMongoose } from "../lib/db.js";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const expectedHost = "cluster01.vi8ncgs.mongodb.net";
const expectedUsername = "hardees481_db_user";
const uri = process.env.MONGODB_URI || "";
const databaseName = process.env.MONGODB_DB_NAME || "";

function inspectEnvFile(fileName) {
    const path = resolve(projectRoot, fileName);
    if (!existsSync(path)) {
        return { present: false, values: {}, counts: {} };
    }

    const content = readFileSync(path, "utf8");
    const values = parseEnv(content);
    const count = (key) =>
        content.split(/\r?\n/).filter((line) =>
            new RegExp(`^\\uFEFF?\\s*(?:export\\s+)?${key}\\s*=`, "i").test(line)
        ).length;

    return {
        present: true,
        values,
        counts: {
            MONGODB_URI: count("MONGODB_URI"),
            MONGODB_DB_NAME: count("MONGODB_DB_NAME"),
        },
    };
}

const envFiles = {
    ".env": inspectEnvFile(".env"),
    ".env.local": inspectEnvFile(".env.local"),
};
const embeddedSchemeMatch = /mongodb(?:\+srv)?:\/\//i.exec(uri);
const startsWithMongoScheme = /^mongodb(?:\+srv)?:\/\//i.test(uri);
const parsedValue = embeddedSchemeMatch
    ? uri.slice(embeddedSchemeMatch.index)
    : "";
let parsedUri;
try {
    if (parsedValue) parsedUri = new URL(parsedValue);
} catch {
    parsedUri = null;
}

let decodedUsername = "";
let decodedPassword = "";
try {
    decodedUsername = decodeURIComponent(parsedUri?.username || "");
    decodedPassword = decodeURIComponent(parsedUri?.password || "");
} catch {
    decodedUsername = "";
    decodedPassword = "";
}

const authority = embeddedSchemeMatch
    ? parsedValue.slice(embeddedSchemeMatch[0].length).split(/[/?#]/, 1)[0]
    : "";
const atIndex = authority.lastIndexOf("@");
const rawCredentials = authority.slice(0, atIndex);
const colonIndex = rawCredentials.indexOf(":");
const rawUsername = colonIndex >= 0 ? rawCredentials.slice(0, colonIndex) : "";
const rawPassword = colonIndex >= 0 ? rawCredentials.slice(colonIndex + 1) : "";
const validEscapes = !/%(?![A-Fa-f0-9]{2})/.test(rawCredentials);
const unescapedSpecialCharacters = (value) =>
    /[^A-Za-z0-9._~-]/.test(value.replace(/%[A-Fa-f0-9]{2}/gi, ""));
const hasPlaceholder =
    /<[^>]*>/.test(uri) ||
    /<[^>]*>/.test(decodedUsername) ||
    /<[^>]*>/.test(decodedPassword) ||
    /\b(?:YOUR_USERNAME|YOUR_PASSWORD|DB_PASSWORD)\b/i.test(uri);
const envUri = envFiles[".env"].values.MONGODB_URI;
const localUri = envFiles[".env.local"].values.MONGODB_URI;
const envDbName = envFiles[".env"].values.MONGODB_DB_NAME;
const localDbName = envFiles[".env.local"].values.MONGODB_DB_NAME;
const leadingPrefix = embeddedSchemeMatch
    ? uri.slice(0, embeddedSchemeMatch.index)
    : "";
const leadingPrefixDescription =
    leadingPrefix === "_"
        ? "one leading underscore"
        : leadingPrefix
            ? "unexpected leading text"
            : "none";
const schemeName = embeddedSchemeMatch
    ? embeddedSchemeMatch[0].slice(0, -3).toLowerCase()
    : "missing";
const checks = {
    uriPresent: Boolean(uri),
    validMongoSchemeAtStart: startsWithMongoScheme,
    noExtraPrefixBeforeScheme: leadingPrefix.length === 0,
    expectedAtlasHost: parsedUri?.hostname.toLowerCase() === expectedHost,
    expectedDatabaseUsername: decodedUsername === expectedUsername,
    passwordPresent: Boolean(decodedPassword),
    placeholdersAbsent: !hasPlaceholder,
    noWhitespaceOrQuotes: !/[\s"']/.test(uri),
    credentialsPercentEncoded:
        atIndex > 0 &&
        authority.indexOf("@") === atIndex &&
        colonIndex > 0 &&
        Boolean(rawPassword) &&
        validEscapes &&
        !unescapedSpecialCharacters(rawUsername) &&
        !unescapedSpecialCharacters(rawPassword),
    databaseNameConfigured:
        Boolean(databaseName.trim()) && databaseName === databaseName.trim(),
    noDuplicateMongoUriInEnv: envFiles[".env"].counts.MONGODB_URI <= 1,
    noDuplicateMongoUriInEnvLocal: envFiles[".env.local"].counts.MONGODB_URI <= 1,
};

console.log("MongoDB configuration report (secret values hidden):");
console.log(`  MONGODB_URI: ${uri ? "present" : "missing"}`);
console.log(
    `  URI scheme: ${startsWithMongoScheme ? schemeName : `${schemeName} (invalid position)`}`
);
console.log(`  URI hostname: ${parsedUri?.hostname || "unparsed"}`);
console.log(
    `  MONGODB_DB_NAME: ${checks.databaseNameConfigured ? "present" : "missing or malformed"}`
);
console.log(`  URI password: ${checks.passwordPresent ? "present" : "missing or unparsed"}`);
console.log(`  Unresolved placeholder: ${hasPlaceholder ? "present" : "not detected"}`);
console.log(`  Password URL encoding: ${checks.credentialsPercentEncoded ? "valid" : "invalid or unparsed"}`);
console.log(`  Leading text before scheme: ${leadingPrefixDescription}`);
console.log(
    `  .env entries (URI / database name): ${envFiles[".env"].counts.MONGODB_URI} / ${envFiles[".env"].counts.MONGODB_DB_NAME}`
);
console.log(
    `  .env.local entries (URI / database name): ${envFiles[".env.local"].counts.MONGODB_URI} / ${envFiles[".env.local"].counts.MONGODB_DB_NAME}`
);
console.log(
    `  URI value differs between files: ${
        envFiles[".env"].present &&
        envFiles[".env.local"].present &&
        envUri !== localUri
    }`
);
console.log(
    `  Database-name value differs between files: ${
        envFiles[".env"].present &&
        envFiles[".env.local"].present &&
        envDbName !== localDbName
    }`
);
console.log("  Environment precedence: inherited process environment, then .env.local, then .env.");

if (Object.values(checks).some((valid) => !valid)) {
    console.log("MongoDB connection result: skipped because validation failed.");
    process.exitCode = 1;
} else if (process.argv.includes("--validate-only")) {
    console.log("MongoDB connection result: not attempted (validation-only mode).");
} else {
    try {
        const connection = await connectToDatabase();
        await connection.connection.db.admin().command({ ping: 1 });
        if (connection.connection.name !== databaseName) {
            console.log("MongoDB connection result: connected, but selected database did not match configuration.");
            process.exitCode = 1;
        } else {
            console.log("MongoDB connection result: successful read-only ping; configured database verified.");
        }
    } catch (error) {
        const cause = error?.cause || error;
        if (cause?.name === "MongoParseError") {
            console.log("MongoDB connection result: failed because the URI could not be parsed.");
        } else if (
            cause?.name === "MongoServerError" &&
            (cause.code === 18 || cause.codeName === "AuthenticationFailed")
        ) {
            console.log("MongoDB connection result: authentication failed; check the Atlas database user and encoded password.");
        } else if (cause?.name === "MongoServerSelectionError") {
            console.log("MongoDB connection result: Atlas was unreachable; check network access and the Atlas IP allow list.");
        } else {
            console.log("MongoDB connection result: failed with a sanitized configuration or server error.");
        }
        process.exitCode = 1;
    } finally {
        await getMongoose().disconnect();
    }
}
