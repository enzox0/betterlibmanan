import { Request, Response, NextFunction } from "express";
import { verifyUserToken, UserTokenPayload } from "./user.service";

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
    }
  }
}

/** Verifies the public user Bearer token and populates req.user. */
export function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authorization header missing or malformed",
    });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyUserToken(token);
    if (payload.type !== "user-access") {
      res.status(401).json({ success: false, message: "Invalid token type" });
      return;
    }
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
      return;
    }
    res.status(401).json({ success: false, message: "Invalid token" });
  }
}
