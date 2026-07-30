const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
    if (statusCode === 500 && process.env.NODE_ENV !== "production") {
        console.error(err);
    }
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error",
        errors: err.errors || [],
    });
};

export default errorHandler;
