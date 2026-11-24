import { ApiError } from "./errors.js";

export function getDateKey(date = new Date()) {
    const timeZone = process.env.APP_TIMEZONE || "America/New_York";
    let parts;
    try {
        parts = new Intl.DateTimeFormat("en-US", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(date);
    } catch (error) {
        if (error instanceof RangeError) {
            throw new ApiError(
                503,
                "INVALID_TIME_ZONE",
                "The application time zone is not configured correctly."
            );
        }
        throw error;
    }

    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
}

export function getWeekStartKey(date = new Date()) {
    const [year, month, day] = getDateKey(date).split("-").map(Number);
    const weekStart = new Date(Date.UTC(year, month - 1, day));
    const daysFromMonday = (weekStart.getUTCDay() + 6) % 7;
    weekStart.setUTCDate(weekStart.getUTCDate() - daysFromMonday);
    return weekStart.toISOString().slice(0, 10);
}
