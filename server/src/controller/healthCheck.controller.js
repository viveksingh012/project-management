export const healthCheck = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
};
