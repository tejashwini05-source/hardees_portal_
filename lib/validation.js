import { ApiError } from "./errors.js";

export function validate(schema, input) {
    const result = schema.safeParse(input);
    if (!result.success) {
        const details = result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        }));
        throw new ApiError(
            400,
            "VALIDATION_FAILED",
            "Please check the submitted information.",
            { details }
        );
    }
    return result.data;
}
