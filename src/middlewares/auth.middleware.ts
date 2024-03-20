import { NextFunction, Response } from "express";
import { CustomRequest } from "../interface";
import jwt from 'jsonwebtoken';
import { apiResponse } from "../utils/apiResponse";

const secretKey = process.env.SECRET_KEY as string;

// Middleware to check JWT token
const authenticateJWT = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.body.accessToken as string;
    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return apiResponse({res, code:403, message: "Invalid Token."})
            }
            req.user = decoded;
            next();
        });
    } else {
        return apiResponse({res, code:401, message: "Token Required."})
    }
};

export default authenticateJWT;