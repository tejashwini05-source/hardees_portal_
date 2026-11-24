import mongoose from "mongoose";

const loginRateLimitSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true },
        attempts: { type: Number, required: true, min: 1 },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true, strict: "throw" }
);

loginRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const LoginRateLimit =
    mongoose.models.LoginRateLimit ||
    mongoose.model("LoginRateLimit", loginRateLimitSchema);
