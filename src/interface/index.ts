
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface ApiResponseInterface {
  res: Response;
  message?: string;
  code?: number;
  err?: Error;
  errors?: any;
  success?: boolean;
  data?: any;
}

export interface CustomRequest extends Request {
    user?: User | string | undefined | JwtPayload;
    [x:string]:any;
}

export interface User {
    email: string;
    password: string;
}
