import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        staffId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: 40,
        },
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: 254,
            sparse: true,
            unique: true,
        },
        phone: { type: String, trim: true, maxlength: 32, default: "" },
        role: { type: String, enum: ["admin", "staff"], required: true },
        position: { type: String, trim: true, maxlength: 80, default: "" },
        shift: { type: String, trim: true, maxlength: 80, default: "" },
        workDays: { type: String, trim: true, maxlength: 60, default: "" },
        shiftHours: { type: String, trim: true, maxlength: 40, default: "" },
        attendanceStatus: {
            type: String,
            enum: ["Present", "Absent", "On leave", "Off today"],
            default: "Off today",
        },
        attendanceRate: { type: Number, min: 0, max: 100, default: 0 },
        hourlyRate: { type: Number, min: 0, max: 1000, default: 0 },
        performanceScore: { type: Number, min: 0, max: 100, default: 0 },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
        passwordHash: { type: String, required: true, select: false },
        sessionVersion: { type: Number, min: 0, default: 0 },
    },
    { timestamps: true, strict: "throw" }
);

userSchema.index({ name: 1 });

export const User =
    mongoose.models.User || mongoose.model("User", userSchema);
