import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 80,
        },
        guest: { type: String, required: true, trim: true, maxlength: 120 },
        orderId: { type: String, trim: true, maxlength: 80, default: "" },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, required: true, trim: true, maxlength: 160 },
        comment: { type: String, required: true, trim: true, maxlength: 4000 },
        complaint: { type: Boolean, default: false },
        reply: { type: String, trim: true, maxlength: 280, default: "" },
        resolved: { type: Boolean, default: false },
    },
    { timestamps: true, strict: "throw" }
);

reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: 1, resolved: 1 });

export const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
