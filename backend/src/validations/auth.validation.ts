import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
  role: z
    .enum(["student", "lecturer"])
    .default("student"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
});
