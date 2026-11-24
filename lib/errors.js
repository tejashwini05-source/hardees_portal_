export class ApiError extends Error {
    constructor(status, code, message, options = {}) {
        super(message, options);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = options.details;
    }
}
