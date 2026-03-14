export class ChatError extends Error {
    type;
    surface;
    statusCode;
    constructor(errorCode, cause) {
        super();
        const [type, surface] = errorCode.split(":");
        this.type = type;
        this.cause = cause;
        this.surface = surface;
        this.message = getMessageByErrorCode(errorCode);
        this.statusCode = getStatusCodeByType(this.type);
    }
    toResponse() {
        const code = `${this.type}:${this.surface}`;
        return Response.json({ code, message: this.message, cause: this.cause }, { status: this.statusCode });
    }
}
function getMessageByErrorCode(errorCode) {
    switch (errorCode) {
        case "bad_request:api":
            return "The request couldn't be processed. Please check your input and try again.";
        case "unauthorized:auth":
            return "You need to sign in before continuing.";
        case "unauthorized:chat":
            return "You need to sign in to use the chat. Please sign in and try again.";
        case "forbidden:chat":
            return "This chat belongs to another user.";
        case "rate_limit:chat":
            return "You have exceeded your maximum number of messages. Please try again later.";
        case "not_found:chat":
            return "The requested chat was not found.";
        case "offline:chat":
            return "We're having trouble sending your message. Please check your internet connection and try again.";
        default:
            return "Something went wrong. Please try again later.";
    }
}
function getStatusCodeByType(type) {
    switch (type) {
        case "bad_request":
            return 400;
        case "unauthorized":
            return 401;
        case "forbidden":
            return 403;
        case "not_found":
            return 404;
        case "rate_limit":
            return 429;
        case "offline":
            return 503;
        default:
            return 500;
    }
}
