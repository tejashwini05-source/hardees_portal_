import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        dateKey: {
            type: String,
            required: true,
            match: /^\d{4}-\d{2}-\d{2}$/,
        },
        checkInAt: { type: Date, required: true },
        checkOutAt: { type: Date, default: null },
    },
    { timestamps: true, strict: "throw" }
);

attendanceSchema.index({ userId: 1, dateKey: 1 }, { unique: true });
attendanceSchema.index(
    { userId: 1 },
    { unique: true, partialFilterExpression: { checkOutAt: null } }
);

export const Attendance =
    mongoose.models.Attendance ||
    mongoose.model("Attendance", attendanceSchema);
