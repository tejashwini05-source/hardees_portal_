import { z } from "zod";

const itemId = z.string().trim().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/);
const menuImage = z
    .string()
    .max(2_500_000)
    .refine(
        (value) =>
            /^\/?images\/[A-Za-z0-9_.-]+\.(?:jpg|jpeg|png|webp)$/i.test(value) ||
            /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value),
        "Use an image from the site or a PNG, JPEG, or WebP upload."
    );

export const menuItemInputSchema = z
    .object({
        id: itemId.optional(),
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().min(1).max(1000),
        category: z.enum(["Starters", "Main Course", "Desserts", "Drinks"]),
        price: z.number().finite().min(0.01).max(10000),
        image: menuImage,
        available: z.boolean(),
        foodType: z.enum(["veg", "non-veg"]),
        bestseller: z.boolean(),
        chefSpecial: z.boolean(),
        sizes: z.array(z.string().trim().min(1).max(80)).max(20),
        toppings: z.array(z.string().trim().min(1).max(80)).max(20),
        extras: z.array(z.string().trim().min(1).max(80)).max(20),
        preparationMinutes: z.number().int().min(1).max(1440),
        detailsUrl: z
            .string()
            .url()
            .max(2048)
            .refine((value) => {
                try {
                    return new URL(value).protocol === "https:";
                } catch {
                    return false;
                }
            }, "Use an HTTPS URL.")
            .optional(),
    })
    .strict();

export const promotionInputSchema = z
    .object({
        id: itemId.optional(),
        code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,24}$/),
        name: z.string().trim().min(1).max(120),
        discountType: z.enum(["percentage", "flat", "free-delivery", "bogo"]),
        campaign: z.enum(["Standard", "Festive", "First order"]),
        discountValue: z.number().finite().min(0).max(10000),
        minimumOrder: z.number().finite().min(0).max(10000),
        maximumDiscount: z.number().finite().min(0).max(10000),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        enabled: z.boolean(),
    })
    .strict()
    .superRefine((offer, context) => {
        const validDate = (value) =>
            Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
            new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

        if (!validDate(offer.startDate) || !validDate(offer.endDate)) {
            context.addIssue({
                code: "custom",
                path: ["startDate"],
                message: "Enter valid calendar dates.",
            });
        }
        if (offer.startDate > offer.endDate) {
            context.addIssue({
                code: "custom",
                path: ["endDate"],
                message: "The end date must be on or after the start date.",
            });
        }
        if (
            (offer.discountType === "percentage" &&
                (offer.discountValue <= 0 || offer.discountValue > 100)) ||
            (offer.discountType === "flat" && offer.discountValue <= 0) ||
            (["free-delivery", "bogo"].includes(offer.discountType) &&
                (offer.discountValue !== 0 || offer.maximumDiscount !== 0))
        ) {
            context.addIssue({
                code: "custom",
                path: ["discountValue"],
                message: "The discount value does not match the selected discount type.",
            });
        }
    });

export const staffCreateSchema = z
    .object({
        staffId: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9_-]+$/),
        name: z.string().trim().min(1).max(100),
        phone: z.string().trim().min(1).max(32),
        email: z.string().trim().email().max(254).toLowerCase(),
        role: z.enum(["Chef", "Waiter", "Cashier", "Manager", "Delivery"]),
        attendance: z.enum(["Present", "Absent", "On leave", "Off today"]),
        shift: z.enum(["Opening", "Morning", "Mid", "Evening"]),
        workDays: z.string().trim().min(1).max(60),
        shiftHours: z.string().trim().min(1).max(40),
        hourlyRate: z.number().finite().min(0.01).max(500),
        performance: z.number().int().min(0).max(100),
        status: z.enum(["Active", "Inactive"]),
        password: z.string().min(12).max(128),
    })
    .strict();

export const staffUpdateSchema = staffCreateSchema
    .omit({ staffId: true, password: true })
    .partial()
    .extend({ password: z.string().min(12).max(128).optional() })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
        message: "At least one staff field must be provided.",
    });

export const orderCreateSchema = z
    .object({
        guest: z.string().trim().min(1).max(120),
        channel: z.enum(["Pickup", "Drive-thru", "Delivery", "Dine-in"]),
        items: z
            .array(
                z
                    .object({
                        name: z.string().trim().min(1).max(120),
                        quantity: z.number().int().min(1).max(100),
                        price: z.number().finite().min(0).max(10000),
                    })
                    .strict()
            )
            .min(1)
            .max(50),
    })
    .strict();

export const orderStatusSchema = z
    .object({
        status: z.enum(["received", "preparing", "ready", "completed", "cancelled"]),
    })
    .strict();

export const reviewUpdateSchema = z
    .object({
        reply: z.string().trim().max(280).optional(),
        resolved: z.boolean().optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
        message: "A reply or resolution status is required.",
    });

export const notificationInputSchema = z
    .object({
        type: z.enum([
            "order",
            "reservation",
            "cancellation",
            "low-stock",
            "review",
            "payment",
            "refund",
            "staff",
        ]),
        title: z.string().trim().min(1).max(160),
        detail: z.string().trim().max(1000).default(""),
    })
    .strict();

export const reviewCreateSchema = z
    .object({
        guest: z.string().trim().min(1).max(120),
        orderId: z.string().trim().max(80).default(""),
        rating: z.number().int().min(1).max(5),
        title: z.string().trim().min(1).max(160),
        comment: z.string().trim().min(1).max(4000),
        complaint: z.boolean().default(false),
    })
    .strict();
