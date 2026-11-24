import { createApiHandler } from "../lib/api-handler.js";
import { requireUser, serializeStaff } from "../lib/auth.js";
import { ApiError } from "../lib/errors.js";
import { hashPassword } from "../lib/password.js";
import { readJsonBody, sendJson } from "../lib/http.js";
import { staffCreateSchema } from "../lib/schemas.js";
import { validate } from "../lib/validation.js";
import { User } from "../models/User.js";

async function manageStaff(req, res) {
    await requireUser(req, ["admin"]);

    if (req.method === "GET") {
        const users = await User.find({ role: "staff" })
            .select("staffId name phone email position attendanceStatus shift workDays shiftHours hourlyRate performanceScore status")
            .sort({ name: 1 })
            .lean();
        sendJson(res, 200, { staff: users.map(serializeStaff) });
        return;
    }

    if (req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    const body = validate(staffCreateSchema, await readJsonBody(req));
    try {
        const user = await User.create({
            staffId: body.staffId,
            name: body.name,
            phone: body.phone,
            email: body.email,
            role: "staff",
            position: body.role,
            attendanceStatus: body.attendance,
            shift: body.shift,
            workDays: body.workDays,
            shiftHours: body.shiftHours,
            hourlyRate: body.hourlyRate,
            performanceScore: body.performance,
            status: body.status.toLowerCase(),
            passwordHash: await hashPassword(body.password),
        });
        sendJson(res, 201, { staff: serializeStaff(user) });
    } catch (error) {
        if (error?.code === 11000) {
            throw new ApiError(
                409,
                "STAFF_ACCOUNT_CONFLICT",
                "That staff ID or email address is already in use."
            );
        }
        throw error;
    }
}

export default createApiHandler(manageStaff);
