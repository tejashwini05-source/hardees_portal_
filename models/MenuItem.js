import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 80,
        },
        name: { type: String, required: true, trim: true, maxlength: 120 },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        category: {
            type: String,
            enum: ["Starters", "Main Course", "Desserts", "Drinks"],
            required: true,
        },
        price: { type: Number, required: true, min: 0.01, max: 10000 },
        image: { type: String, required: true, maxlength: 2_500_000 },
        available: { type: Boolean, default: true },
        foodType: { type: String, enum: ["veg", "non-veg"], required: true },
        bestseller: { type: Boolean, default: false },
        chefSpecial: { type: Boolean, default: false },
        sizes: { type: [String], default: [] },
        toppings: { type: [String], default: [] },
        extras: { type: [String], default: [] },
        preparationMinutes: { type: Number, required: true, min: 1, max: 1440 },
        detailsUrl: { type: String, trim: true, maxlength: 2048 },
    },
    { timestamps: true, strict: "throw" }
);

export const MenuItem =
    mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);
