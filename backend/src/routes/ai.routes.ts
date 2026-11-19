import { Router } from "express";
import {
  queryCourseMaterial,
  summarizeCourse,
  getCourseRiskAssessment,
} from "../controllers/ai.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  queryCourseMaterialSchema,
  summarizeCourseSchema,
} from "../validations/ai.validation";
import { courseParamCourseIdSchema } from "../validations/course.validation";

const router = Router();

// RAG Q&A Assistant (Students, Lecturers, Admins)
router.post(
  "/query",
  authenticate,
  validateRequest({ body: queryCourseMaterialSchema }),
  queryCourseMaterial
);

// Automated Study Guide & Summary Generator
router.post(
  "/summarize",
  authenticate,
  validateRequest({ body: summarizeCourseSchema }),
  summarizeCourse
);

// Faculty Student Academic Risk & Early Warning Assessment (Lecturers & Admins only)
router.get(
  "/risk-assessment/:courseId",
  authenticate,
  authorize(["admin", "lecturer"]),
  validateRequest({ params: courseParamCourseIdSchema }),
  getCourseRiskAssessment
);

export default router;
