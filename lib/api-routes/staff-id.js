import { createApiHandler } from "../api-handler.js";
import { requireUser, serializeStaff } from "../auth.js";
import { ApiError } from "../errors.js";
import { hashPassword } from "../password.js";
import { readJsonBody, sendJson } from "../http.js";
import { staffUpdateSchema } from "../schemas.js";
import { validate } from "../validation.js";
import { User } from "../../models/User.js";

async function updateStaff(req, res) {
    await requireUser(req, ["admin"]);
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }

    const staffId = typeof req.query?.id === "string" ? req.query.id.toUpperCase() : "";
    if (!staffId) {
        throw new ApiError(400, "INVALID_STAFF_ID", "A staff ID is required.");
    }

    const body = validate(staffUpdateSchema, await readJsonBody(req));
    const fields = {};
    if (body.name !== undefined) fields.name = body.name;
    if (body.phone !== undefined) fields.phone = body.phone;
    if (body.email !== undefined) fields.email = body.email;
    if (body.role !== undefined) fields.position = body.role;
    if (body.attendance !== undefined) fields.attendanceStatus = body.attendance;
    if (body.shift !== undefined) fields.shift = body.shift;
    if (body.workDays !== undefined) fields.workDays = body.workDays;
    if (body.shiftHours !== undefined) fields.shiftHours = body.shiftHours;
    if (body.hourlyRate !== undefined) fields.hourlyRate = body.hourlyRate;
    if (body.performance !== undefined) fields.performanceScore = body.performance;
    if (body.status !== undefined) fields.status = body.status.toLowerCase();
    if (body.password) {
        fields.passwordHash = await hashPassword(body.password);
    }

    const shouldRevokeSessions =
        Boolean(body.password) || body.status === "Inactive";
    try {
        const user = await User.findOneAndUpdate(
            { staffId, role: "staff" },
            {
                $set: fields,
                ...(shouldRevokeSessions ? { $inc: { sessionVersion: 1 } } : {}),
            },
            { new: true, runValidators: true }
        ).select(
            "staffId name phone email position attendanceStatus shift workDays shiftHours hourlyRate performanceScore status"
        );
        if (!user) {
            throw new ApiError(404, "STAFF_NOT_FOUND", "Staff account not found.");
        }
        sendJson(res, 200, { staff: serializeStaff(user) });
    } catch (error) {
        if (error?.code === 11000) {
            throw new ApiError(409, "STAFF_EMAIL_CONFLICT", "That email address is already in use.");
        }
        throw error;
    }
}

export default createApiHandler(updateStaff);
