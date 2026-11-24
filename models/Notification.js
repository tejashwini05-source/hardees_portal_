import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 80,
        },
        type: {
            type: String,
            enum: [
                "order",
                "reservation",
                "cancellation",
                "low-stock",
                "review",
                "payment",
                "refund",
                "staff",
            ],
            required: true,
        },
        title: { type: String, required: true, trim: true, maxlength: 160 },
        detail: { type: String, trim: true, maxlength: 1000, default: "" },
        read: { type: Boolean, default: false },
    },
    { timestamps: true, strict: "throw" }
);

notificationSchema.index({ read: 1, createdAt: -1 });

export const Notification =
    mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);
