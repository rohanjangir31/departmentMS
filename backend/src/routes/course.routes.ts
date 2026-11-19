import express from "express";
import {
  createCourse,
  getCourses,
  getLecturerCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getStudentsByCourse,
  enrollStudent,
  disenrollStudent,
  fetchStudentCourses,
} from "../controllers/course.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  createCourseSchema,
  updateCourseSchema,
  courseIdParamSchema,
  courseParamCourseIdSchema,
} from "../validations/course.validation";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(["admin", "lecturer"]),
  validateRequest({ body: createCourseSchema }),
  createCourse
);
router.get("/", authenticate, getCourses);
router.get("/lecturer/:lecturerId", authenticate, getLecturerCourses);
router.get("/students", authenticate, fetchStudentCourses);
router.get("/:id", authenticate, validateRequest({ params: courseIdParamSchema }), getCourseById);
router.get(
  "/:courseId/students",
  authenticate,
  validateRequest({ params: courseParamCourseIdSchema }),
  getStudentsByCourse
);
router.post(
  "/:courseId/enroll",
  authenticate,
  validateRequest({ params: courseParamCourseIdSchema }),
  enrollStudent
);
router.delete(
  "/:courseId/disenroll",
  authenticate,
  validateRequest({ params: courseParamCourseIdSchema }),
  disenrollStudent
);
router.put(
  "/:id",
  authenticate,
  authorize(["admin", "lecturer"]),
  validateRequest({ params: courseIdParamSchema, body: updateCourseSchema }),
  updateCourse
);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateRequest({ params: courseIdParamSchema }),
  deleteCourse
);

export default router;
