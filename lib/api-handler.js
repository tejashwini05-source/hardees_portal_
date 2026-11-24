import { ApiError } from "./errors.js";
import {
    assertSameOrigin,
    requestId,
    sendJson,
    setSecurityHeaders,
} from "./http.js";

export function createApiHandler(dispatch) {
    return async function handleApiRequest(req, res) {
        const id = requestId(req);
        setSecurityHeaders(req, res);

        try {
            assertSameOrigin(req);
            await dispatch(req, res);
        } catch (error) {
            const apiError =
                error instanceof ApiError
                    ? error
                    : new ApiError(
                          500,
                          "INTERNAL_ERROR",
                          "The request could not be completed."
                      );

            if (!(error instanceof ApiError)) {
                console.error("[api] request failed", {
                    requestId: id,
                    errorName: error instanceof Error ? error.name : "UnknownError",
                });
            }

            sendJson(res, apiError.status, {
                error: {
                    code: apiError.code,
                    message: apiError.message,
                    requestId: id,
                    ...(apiError.details ? { details: apiError.details } : {}),
                },
            });
        }
    };
}
