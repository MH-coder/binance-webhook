import { NextFunction, Request, Response } from "express";
import { apiResponse } from "../utils/apiResponse";

// Define allowed IP addresses
const allowedIPs:any = ['52.89.214.238', '34.212.75.30', '54.218.53.128', '52.32.178.7', '::1', '127.0.0.1'];

// Custom middleware to restrict access to allowed IP addresses
const restrictAccess = (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip;
    if (allowedIPs.includes(clientIP)) {
        next(); // Continue to the next middleware if IP address is allowed
    } else {
        apiResponse({res, code:403, message:'Forbidden'})
    }
};

export default restrictAccess