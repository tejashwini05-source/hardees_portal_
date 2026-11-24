import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 80,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            match: /^[A-Z0-9_-]{3,24}$/,
        },
        name: { type: String, required: true, trim: true, maxlength: 120 },
        discountType: {
            type: String,
            enum: ["percentage", "flat", "free-delivery", "bogo"],
            required: true,
        },
        campaign: {
            type: String,
            enum: ["Standard", "Festive", "First order"],
            required: true,
        },
        discountValue: { type: Number, required: true, min: 0, max: 10000 },
        minimumOrder: { type: Number, min: 0, max: 10000, default: 0 },
        maximumDiscount: { type: Number, min: 0, max: 10000, default: 0 },
        startDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
        endDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
        enabled: { type: Boolean, default: true },
    },
    { timestamps: true, strict: "throw" }
);

export const Promotion =
    mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);
