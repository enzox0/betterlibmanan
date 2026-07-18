import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getPublishedQuiz,
  getAdminQuiz,
  createAdminQuiz,
  updateAdminQuiz,
  deleteAdminQuiz,
  bulkImportAdminQuiz,
} from "./quiz.controller";

export const quizRouter: Router = Router();

quizRouter.get("/", getPublishedQuiz);
quizRouter.get("/admin", requireAuth, getAdminQuiz);
quizRouter.post("/", requireAuth, createAdminQuiz);
quizRouter.post("/bulk-import", requireAuth, bulkImportAdminQuiz);
quizRouter.patch("/:id", requireAuth, updateAdminQuiz);
quizRouter.delete("/:id", requireAuth, deleteAdminQuiz);
