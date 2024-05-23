import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {

        let token = req.cookies?.accessToken || req.header("Authorization");


        if (!token) {
            throw new ApiError(401, "Unauthorized request!");
        }

        // If using Authorization header, remove "Bearer " prefix
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token!");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new ApiError(401, "Invalid JWT token!");
        } else if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, "JWT token has expired!");
        } else {
            throw new ApiError(500, "Something went wrong while verifying user with token!");
        }
    }
});

