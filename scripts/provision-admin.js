import { connectToDatabase } from "../lib/db.js";
import { hashPassword } from "../lib/password.js";
import { seedDefaultMenu } from "../lib/seed-default-menu.js";
import { User } from "../models/User.js";
import { ApiError } from "../lib/errors.js";

async function provisionAdmin() {
    const staffId = process.env.ADMIN_ID?.trim().toUpperCase();
    const password = process.env.ADMIN_PASSWORD;

    if (
        !staffId ||
        staffId.length < 3 ||
        staffId.length > 40
    ) {
        throw new ApiError(
            400,
            "INVALID_ADMIN_ID",
            "Set ADMIN_ID to an ID between 3 and 40 characters."
        );
    }
    if (!password || password.length < 12 || password.length > 128) {
        throw new ApiError(
            400,
            "INVALID_ADMIN_PASSWORD",
            "Set ADMIN_PASSWORD to a password between 12 and 128 characters."
        );
    }

    await connectToDatabase();
    await seedDefaultMenu();
    if (await User.exists({ staffId })) {
        console.log(
            "An account with ADMIN_ID already exists; no account was changed. Default menu items were seeded."
        );
        return;
    }

    try {
        await User.create({
            staffId,
            name: "Portal Administrator",
            role: "admin",
            status: "active",
            passwordHash: await hashPassword(password),
        });
    } catch (error) {
        if (error?.code === 11000 && (await User.exists({ staffId }))) {
            console.log(
                "An account with ADMIN_ID already exists; no account was changed. Default menu items were seeded."
            );
            return;
        }
        throw error;
    }

    console.log("Admin account provisioned and default menu items seeded.");
}

provisionAdmin().catch((error) => {
    if (error instanceof ApiError) {
        console.error(`Admin provisioning failed: ${error.message}`);
    } else {
        console.error("Admin provisioning failed.", {
            errorName: error instanceof Error ? error.name : "UnknownError",
        });
    }
    process.exitCode = 1;
});
