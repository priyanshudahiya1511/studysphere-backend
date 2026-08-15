import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token =
            req.cookies.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res
                .status(401)
                .json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res
                .status(401)
                .json({ message: "Unauthorized: Invalid token" });
        }

        const user = await User.findById(decoded._id).select(
            "-password -refreshToken"
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;

        next();
    } catch (error) {
        console.log("Error in protectRoute Middleware", error);
        return res
            .status(401)
            .json({ message: "Unauthorized: Token expired or invalid" });
    }
};
