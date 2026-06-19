import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, AccessTokenPayload } from "./auth.service";

// Augment Express Request so downstream handlers can read `req.admin`
declare global {
  namespace Express {
    interface Request {
      admin?: AccessTokenPayload;
    }
  }
}

/**
 * requireAuth — verifies the Bearer access token attached to the request.
 *
 * On success:  populates `req.admin` and calls `next()`.
 * On failure:  returns 401 JSON without calling `next()`.
 *
 * Usage:
 *   router.get('/protected', requireAuth, handler);
 *   router.use('/admin', requireAuth);
 */
export function requireAuth(
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

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== "access") {
      res.status(401).json({ success: false, message: "Invalid token type" });
      return;
    }

    req.admin = payload;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Access token expired",
        code: "TOKEN_EXPIRED",
      });
      return;
    }
    res.status(401).json({ success: false, message: "Invalid access token" });
  }
}

/**
 * requireRole — factory that creates a role guard.
 * Must be used after `requireAuth` (relies on `req.admin` being populated).
 *
 * Usage:
 *   router.delete('/admins/:id', requireAuth, requireRole('superadmin'), handler);
 */
export function requireRole(
  ...roles: Array<"superadmin" | "admin" | "editor">
) {
  return function (req: Request, res: Response, next: NextFunction): void {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }
    if (!roles.includes(req.admin.role)) {
      res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
      return;
    }
    next();
  };
}
