import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const courseIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid course ID format"),
});

export const courseParamCourseIdSchema = z.object({
  courseId: z.string().regex(objectIdRegex, "Invalid course ID format"),
});

export const createCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long")
    .max(150, "Title cannot exceed 150 characters"),
  courseCode: z
    .string()
    .trim()
    .min(3, "Course code must be at least 3 characters long")
    .max(20, "Course code cannot exceed 20 characters")
    .toUpperCase(),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long"),
  credits: z.number().int().min(1).max(6).optional().default(3),
  semester: z.string().trim().optional().default("First Semester"),
});

export const updateCourseSchema = createCourseSchema.partial();
