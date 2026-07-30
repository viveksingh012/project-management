export const apiResponse = (res, statusCode, success, message = "Success", data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
    });
};
