import { Router } from "express";
import rateLimit from "express-rate-limit";
import { handleRegister, handleLogin, handleGetMe } from "./user.controller";
import { requireUser } from "./user.middleware";

export const userRouter: Router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Public
userRouter.post("/register", authLimiter, handleRegister);
userRouter.post("/login", authLimiter, handleLogin);

// Protected
userRouter.get("/me", requireUser, handleGetMe);
