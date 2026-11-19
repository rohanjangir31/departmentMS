import request from "supertest";
import app from "../app";
import { Enrollment } from "../models/Enrollment";
import "./setup";

describe("Course & Enrollment API", () => {
  let lecturerToken: string;
  let lecturerId: string;
  let studentToken: string;
  let studentId: string;

  beforeEach(async () => {
    // Register lecturer
    const lecRes = await request(app).post("/api/auth/signup").send({
      name: "Dr. Alan Turing",
      email: "turing@test.edu",
      password: "password123",
      role: "lecturer",
    });
    lecturerToken = lecRes.body.data.token;
    lecturerId = lecRes.body.data.user._id;

    // Register student
    const stuRes = await request(app).post("/api/auth/signup").send({
      name: "Student Ada",
      email: "ada@test.edu",
      password: "password123",
      role: "student",
    });
    studentToken = stuRes.body.data.token;
    studentId = stuRes.body.data.user._id;
  });

  describe("POST /api/courses (Create Course)", () => {
    it("should allow a lecturer to create a valid course", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({
          title: "Operating Systems Principles",
          courseCode: "CS301",
          description: "Comprehensive study of kernels, processes, threads, and memory management.",
          credits: 4,
          semester: "First Semester",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.courseCode).toBe("CS301");
      expect(res.body.data.lecturer).toBe(lecturerId);
    });

    it("should disallow a student from creating a course (RBAC 403)", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          title: "Unauthorized Course",
          courseCode: "CS999",
          description: "Students should not be permitted to create courses.",
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });

    it("should reject course creation with missing fields (Validation 400)", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({
          title: "AB", // Too short (min 3)
          // Missing courseCode & description
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should reject duplicate courseCode with HTTP 400", async () => {
      await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({
          title: "Algorithms First Edition",
          courseCode: "CS201",
          description: "Design and analysis of efficient algorithmic paradigms.",
        });

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({
          title: "Algorithms Duplicate Code",
          courseCode: "CS201",
          description: "Duplicate code should be rejected by uniqueness constraint.",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/courses/:courseId/enroll & disenroll (Data Normalization)", () => {
    let courseId: string;

    beforeEach(async () => {
      const courseRes = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({
          title: "Database Management Systems",
          courseCode: "CS401",
          description: "Relational algebra, normalization, query optimization, and transactions.",
        });
      courseId = courseRes.body.data._id;
    });

    it("should enroll student and write to both Course and normalized Enrollment collection", async () => {
      const res = await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify normalized Enrollment record in MongoDB
      const enrollmentRecord = await Enrollment.findOne({
        student: studentId,
        course: courseId,
      });

      expect(enrollmentRecord).not.toBeNull();
      expect(enrollmentRecord?.status).toBe("active");
      expect(enrollmentRecord?.engagementScore).toBe(50);
    });

    it("should disenroll student and update normalized Enrollment status to dropped", async () => {
      // First enroll
      await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set("Authorization", `Bearer ${studentToken}`);

      // Now disenroll
      const res = await request(app)
        .delete(`/api/courses/${courseId}/disenroll`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify normalized Enrollment status updated to dropped
      const enrollmentRecord = await Enrollment.findOne({
        student: studentId,
        course: courseId,
      });

      expect(enrollmentRecord?.status).toBe("dropped");
    });
  });
});
