import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const queryCourseMaterialSchema = z.object({
  courseId: z.string().regex(objectIdRegex, "Invalid course ID format"),
  query: z
    .string()
    .trim()
    .min(3, "Query must be at least 3 characters long")
    .max(500, "Query cannot exceed 500 characters"),
});

export const summarizeCourseSchema = z.object({
  courseId: z.string().regex(objectIdRegex, "Invalid course ID format"),
});
