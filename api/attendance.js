import { z } from "zod";
import { Attendance } from "../models/Attendance.js";
import { User } from "../models/User.js";
import { createApiHandler } from "../lib/api-handler.js";
import { requireUser } from "../lib/auth.js";
import { getDateKey, getWeekStartKey } from "../lib/date.js";
import { ApiError } from "../lib/errors.js";
import { readJsonBody, sendJson } from "../lib/http.js";
import { validate } from "../lib/validation.js";

const attendanceActionSchema = z
    .object({ action: z.enum(["check-in", "check-out"]) })
    .strict();

function workedHours(record, now) {
    const end = record.checkOutAt || now;
    return Math.max(0, (end.getTime() - record.checkInAt.getTime()) / 3_600_000);
}

function serializeRecord(record) {
    return {
        date: record.dateKey,
        checkInAt: record.checkInAt.toISOString(),
        checkOutAt: record.checkOutAt ? record.checkOutAt.toISOString() : null,
    };
}

async function getAttendance(req, res) {
    const requester = await requireUser(req, ["staff", "admin"]);
    let subject = requester;
    if (typeof req.query?.staffId === "string") {
        if (requester.role !== "admin") {
            throw new ApiError(403, "FORBIDDEN", "You do not have access to this resource.");
        }
        subject = await User.findOne({
            staffId: req.query.staffId.toUpperCase(),
            role: "staff",
        }).select("_id");
        if (!subject) {
            throw new ApiError(404, "STAFF_NOT_FOUND", "Staff account not found.");
        }
    }

    if (req.method === "GET") {
        const now = new Date();
        const todayKey = getDateKey(now);
        const [todayRecord, activeRecord, weekRecords, recentRecords] =
            await Promise.all([
                Attendance.findOne({ userId: subject._id, dateKey: todayKey }).lean(),
                Attendance.findOne({ userId: subject._id, checkOutAt: null })
                    .sort({ checkInAt: -1 })
                    .lean(),
                Attendance.find({
                    userId: subject._id,
                    dateKey: { $gte: getWeekStartKey(now) },
                }).lean(),
                Attendance.find({ userId: subject._id })
                    .sort({ dateKey: -1 })
                    .limit(30)
                    .lean(),
            ]);
        const currentRecord = activeRecord || todayRecord;
        const totalWeekHours = weekRecords.reduce(
            (total, record) => total + workedHours(record, now),
            0
        );
        sendJson(res, 200, {
            checkedIn: Boolean(activeRecord),
            today: currentRecord ? serializeRecord(currentRecord) : null,
            todayHours: currentRecord ? workedHours(currentRecord, now) : 0,
            weekHours: totalWeekHours,
            records: recentRecords.map(serializeRecord),
        });
        return;
    }

    if (req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        throw new ApiError(405, "METHOD_NOT_ALLOWED", "This method is not allowed.");
    }
    if (requester.role !== "staff") {
        throw new ApiError(403, "FORBIDDEN", "Only staff accounts can record attendance.");
    }

    const body = validate(attendanceActionSchema, await readJsonBody(req));
    const now = new Date();
    if (body.action === "check-in") {
        if (await Attendance.exists({ userId: requester._id, checkOutAt: null })) {
            throw new ApiError(409, "ALREADY_CHECKED_IN", "You already have an active shift.");
        }
        const dateKey = getDateKey(now);
        if (await Attendance.exists({ userId: requester._id, dateKey })) {
            throw new ApiError(409, "SHIFT_ALREADY_RECORDED", "A shift is already recorded for today.");
        }
        let record;
        try {
            record = await Attendance.create({
                userId: requester._id,
                dateKey,
                checkInAt: now,
            });
        } catch (error) {
            if (error?.code === 11000) {
                throw new ApiError(409, "SHIFT_ALREADY_RECORDED", "A shift is already recorded for today.");
            }
            throw error;
        }
        await User.updateOne(
            { _id: requester._id },
            { $set: { attendanceStatus: "Present" } }
        );
        sendJson(res, 201, {
            checkedIn: true,
            today: serializeRecord(record),
            todayHours: 0,
        });
        return;
    }

    const record = await Attendance.findOneAndUpdate(
        { userId: requester._id, checkOutAt: null },
        { $set: { checkOutAt: now } },
        { new: true, sort: { checkInAt: -1 } }
    );
    if (!record) {
        throw new ApiError(409, "NOT_CHECKED_IN", "Check in before checking out.");
    }
    sendJson(res, 200, {
        checkedIn: false,
        today: serializeRecord(record),
        todayHours: workedHours(record, now),
    });
}

export default createApiHandler(getAttendance);
