import mongoose from "mongoose";

const orderLineSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        quantity: { type: Number, required: true, min: 1, max: 100 },
        price: { type: Number, required: true, min: 0, max: 10000 },
    },
    { _id: false, strict: "throw" }
);

const orderSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 80,
        },
        guest: { type: String, required: true, trim: true, maxlength: 120 },
        channel: {
            type: String,
            enum: ["Pickup", "Drive-thru", "Delivery", "Dine-in"],
            required: true,
        },
        status: {
            type: String,
            enum: ["received", "preparing", "ready", "completed", "cancelled"],
            default: "received",
        },
        placedAt: { type: Date, required: true, default: Date.now },
        items: {
            type: [orderLineSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0 && items.length <= 50,
                message: "An order must contain between 1 and 50 items.",
            },
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true, strict: "throw" }
);

orderSchema.index({ status: 1, placedAt: -1 });

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
