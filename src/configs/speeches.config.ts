import { constents } from "./constents.config";

export const speeches = {
    WELCOME_MESSAGE: "Welcome to the Unisolve APIs",
    UNABLE_TO_CREATE_TOKEN: "Unable to create token",
    INVALID_DATA_SEND_TO_CREATE_TOKEN: "Invalid data send to create token",
    INVALID_TOKEN: "Invalid token! Kindly provide a valid token",
    UNAUTHORIZED_ACCESS: "Unauthorized Access! Kindly provide a valid token",
    TOKEN_EXPIRED: "Token Expired! Kindly provide a valid token",
    BAD_REQUEST: "Bad Request",
    NOT_ACCEPTABLE: "Not Acceptable",
    DATA_NOT_FOUND: "Data not found",
    UPLOAD_FAILD: "File upload failed",

    USER_NOT_FOUND: "User not found",
    USER_RISTRICTED: "Unauthorized Access!",
    USER_DELETED: "User is ditected as deleted. Kindly contact your administrator.",
    USER_LOCKED: "User is ditected as locked. Kindly contact your administrator.",
    USER_INACTIVE: "User is ditected as inactive. Kindly contact your administrator.",
    USER_ALREADY_EXISTED: "User already existed with the Email and Phone Number.",
    USER_REGISTERED_SUCCESSFULLY: "User registered successfully",
    USER_LOGIN_SUCCESS: "Login Successful",
    LOGOUT_SUCCESS: "Logout Successful",
    USER_EMAIL_REQUIRED: "Email is required, it should not be empty.",
    USER_EMAIL_INVALID: "Email is invalid, it should be a valid email.",
    USER_PWD_REQUIRED: "Password is required, it should not be empty.",

    NOTIFICATION_TYPE_INVALID: `Notification type is invalid, it should be one from ${Object.values(constents.notification_types.list).join(", ")}.`,
    NOTIFICATION_TYPE_REQUIRED: `Notification type is required, it should be one from ${Object.values(constents.notification_types.list).join(", ")}.`,
    NOTIFICATION_TARGET_AUDIENCE_REQUIRED: "Target audience is required, it should be either 'All' or user_id(s) with ',' seperated.",
    NOTIFICATION_TITLE_REQUIRED: "Title is required, it should not be empty.",
    NOTIFICATION_MESSAGE_REQUIRED: "Message is required, it should not be empty.",
    NOTIFICATION_STATUS_INVALID: `Status is invalid, it should be one from ${Object.values(constents.notification_status_flags.list).join(", ")}.`,
    NOTIFICATION_STATUS_REQUIRED: `Status is required, it should be one from ${Object.values(constents.notification_status_flags.list).join(", ")}.`,
    NOTIFICATION_CREATED_SUCCESSFULLY: "Notification created successfully",
    NOTIFICATION_UPDATED_SUCCESSFULLY: "Notification updated successfully",
    NOTIFICATION_DELETED_SUCCESSFULLY: "Notification deleted successfully",

}
