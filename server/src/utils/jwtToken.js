import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const accessToken = (id) => {
    return jwt.sign(
        { id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
};

const refressToken = (id) => {
    return jwt.sign(
        { id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
    );
};

export { accessToken, refressToken };
