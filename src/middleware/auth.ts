import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./error";
import { getBearerToken } from "../utils/helpers";

export type AuthPayload = {
  sub: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      admin?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = getBearerToken(req);
    if (!token) {
      throw new AppError("Unauthorized", 401);
    }
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.admin = decoded;
    next();
  } catch {
    next(new AppError("Unauthorized", 401));
  }
}
