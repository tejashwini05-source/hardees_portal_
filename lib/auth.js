import mongoose from "mongoose";
import { connectToDatabase } from "./db.js";
import { ApiError } from "./errors.js";
import {
    clearSessionCookie,
    getSessionToken,
    verifySessionToken,
} from "./session.js";
import { User } from "../models/User.js";

export async function requireUser(req, allowedRoles = []) {
    const token = getSessionToken(req);
    if (!token) {
        throw new ApiError(401, "UNAUTHENTICATED", "Please sign in to continue.");
    }

    const claims = await verifySessionToken(token);
    if (!mongoose.isValidObjectId(claims.sub)) {
        throw new ApiError(401, "UNAUTHENTICATED", "Please sign in to continue.");
    }

    await connectToDatabase();
    const user = await User.findById(claims.sub).select(
        "staffId name email phone role position shift workDays shiftHours attendanceStatus attendanceRate hourlyRate performanceScore status sessionVersion"
    );
    if (
        !user ||
        user.status !== "active" ||
        user.sessionVersion !== claims.sv
    ) {
        throw new ApiError(401, "UNAUTHENTICATED", "Please sign in to continue.");
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        throw new ApiError(403, "FORBIDDEN", "You do not have access to this resource.");
    }

    return user;
}

export function serializeUser(user) {
    return {
        id: user._id.toString(),
        staffId: user.staffId,
        name: user.name,
        email: user.email || "",
        phone: user.phone,
        role: user.role,
        position: user.position,
        shift: user.shift,
        workDays: user.workDays,
        shiftHours: user.shiftHours,
        attendanceStatus: user.attendanceStatus,
        attendanceRate: user.attendanceRate,
        hourlyRate: user.hourlyRate,
        performanceScore: user.performanceScore,
        status: user.status,
    };
}

export function serializeStaff(user) {
    return {
        id: user.staffId,
        name: user.name,
        phone: user.phone,
        email: user.email || "",
        role: user.position,
        attendance: user.attendanceStatus,
        shift: user.shift,
        workDays: user.workDays,
        shiftHours: user.shiftHours,
        hourlyRate: user.hourlyRate,
        performance: user.performanceScore,
        status: user.status === "active" ? "Active" : "Inactive",
    };
}

export async function invalidateSession(req, res) {
    const token = getSessionToken(req);
    clearSessionCookie(res);
    if (!token) {
        return;
    }

    let claims;
    try {
        claims = await verifySessionToken(token);
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return;
        }
        throw error;
    }

    if (!mongoose.isValidObjectId(claims.sub)) {
        return;
    }
    await connectToDatabase();
    await User.updateOne(
        { _id: claims.sub, sessionVersion: claims.sv },
        { $inc: { sessionVersion: 1 } }
    );
}
