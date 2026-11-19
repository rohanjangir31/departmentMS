import request from "supertest";
import app from "../app";
import { DocumentProcessor } from "../services/ai/documentProcessor.service";
import { RAGService } from "../services/ai/rag.service";
import { AcademicRiskPredictor } from "../services/ai/riskPredictor.service";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import "./setup";

describe("AcademiQ AI Subsystem", () => {
  describe("DocumentProcessor Unit Tests", () => {
    it("should chunk long text into overlapping sliding-window segments", () => {
      const longText = Array.from({ length: 300 }, (_, i) => `word${i}`).join(" ");
      const chunks = DocumentProcessor.chunkText(longText, "Test Syllabus", 100, 20);

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0].documentTitle).toBe("Test Syllabus");
      expect(chunks[0].chunkIndex).toBe(0);
      expect(chunks[0].wordCount).toBe(100);

      // Verify overlap: words from the end of chunk 0 should exist at the start of chunk 1
      const chunk0Words = chunks[0].content.split(" ");
      const chunk1Words = chunks[1].content.split(" ");
      const overlapWords = chunk0Words.slice(-20);
      const startOfChunk1 = chunk1Words.slice(0, 20);
      expect(overlapWords).toEqual(startOfChunk1);
    });

    it("should handle short text as a single chunk", () => {
      const shortText = "Brief outline of course topics.";
      const chunks = DocumentProcessor.chunkText(shortText, "Short Doc", 150, 30);

      expect(chunks.length).toBe(1);
      expect(chunks[0].chunkIndex).toBe(0);
      expect(chunks[0].content).toBe(shortText);
    });

    it("should return empty array for empty or whitespace text", () => {
      const chunks = DocumentProcessor.chunkText("   ", "Empty Doc");
      expect(chunks).toEqual([]);
    });
  });

  describe("RAGService Unit Tests", () => {
    const sampleChunks = [
      {
        chunkIndex: 0,
        documentTitle: "Operating Systems Notes",
        content:
          "Virtual memory is a memory management technique that provides an idealized abstraction of the storage resources. It uses paging to map virtual addresses to physical RAM frames.",
        wordCount: 26,
      },
      {
        chunkIndex: 1,
        documentTitle: "Operating Systems Notes",
        content:
          "A deadlock occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource held by another process. The four Coffman conditions are mutual exclusion, hold and wait, no preemption, and circular wait.",
        wordCount: 42,
      },
    ];

    it("should retrieve the most relevant chunk and synthesize an answer with citations", async () => {
      const result = await RAGService.queryMaterials("What are the conditions for deadlock?", sampleChunks);

      expect(result.isOutOfScope).toBe(false);
      expect(result.confidence).toBeGreaterThan(0.2);
      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.sources[0].documentTitle).toBe("Operating Systems Notes");
      expect(result.sources[0].chunkIndex).toBe(1);
      expect(result.answer).toContain("Operating Systems Notes");
      expect(result.answer).toContain("Citation:");
    });

    it("should trigger anti-hallucination guardrail for out-of-scope queries", async () => {
      const result = await RAGService.queryMaterials("How do you bake a sourdough bread?", sampleChunks);

      expect(result.isOutOfScope).toBe(true);
      expect(result.answer).toContain("do not contain sufficient information");
      expect(result.sources).toEqual([]);
    });

    it("should generate a structured study guide with key concepts and questions", () => {
      const guide = RAGService.generateStudyGuide("CS301 OS", sampleChunks);

      expect(guide.summary).toContain("CS301 OS");
      expect(guide.keyConcepts.length).toBeGreaterThan(2);
      expect(guide.studyQuestions.length).toBeGreaterThan(1);
    });
  });

  describe("AcademicRiskPredictor Unit Tests", () => {
    it("should evaluate highly engaged active student as Low Risk", () => {
      const assessment = AcademicRiskPredictor.assessStudentRisk({
        studentId: "stu1",
        studentName: "Good Student",
        studentEmail: "good@test.edu",
        courseId: "course1",
        engagementScore: 85,
        lastAccessedAt: new Date(), // accessed today
        activeCourseLoad: 3,
      });

      expect(assessment.riskTier).toBe("Low Risk");
      expect(assessment.riskScore).toBeLessThan(40);
      expect(assessment.recommendedAction).toContain("satisfactorily");
    });

    it("should evaluate disengaged inactive student as High Risk with explainable drivers", () => {
      const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
      const assessment = AcademicRiskPredictor.assessStudentRisk({
        studentId: "stu2",
        studentName: "Struggling Student",
        studentEmail: "struggling@test.edu",
        courseId: "course1",
        engagementScore: 15,
        lastAccessedAt: twentyDaysAgo,
        activeCourseLoad: 6, // high load
      });

      expect(assessment.riskTier).toBe("High Risk");
      expect(assessment.riskScore).toBeGreaterThanOrEqual(70);
      expect(assessment.riskDrivers.some((d) => d.includes("Critical: Portal engagement"))).toBe(true);
      expect(assessment.riskDrivers.some((d) => d.includes("consecutive days"))).toBe(true);
      expect(assessment.recommendedAction).toContain("counseling");
    });
  });

  describe("AI API Endpoints Integration", () => {
    let lecturerToken: string;
    let studentToken: string;
    let studentId: string;
    let courseId: string;

    beforeEach(async () => {
      // Register lecturer
      const lec = await request(app).post("/api/auth/signup").send({
        name: "Prof. AI",
        email: "ai.prof@test.edu",
        password: "password123",
        role: "lecturer",
      });
      lecturerToken = lec.body.data.token;

      // Register student
      const stu = await request(app).post("/api/auth/signup").send({
        name: "Student AI",
        email: "ai.stu@test.edu",
        password: "password123",
        role: "student",
      });
      studentToken = stu.body.data.token;
      studentId = stu.body.data.user._id;

      // Create course
      const courseRes = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({
          title: "Artificial Intelligence & Expert Systems",
          courseCode: "CS402",
          description: "Search algorithms, heuristic search, knowledge representation, and probabilistic reasoning.",
        });
      courseId = courseRes.body.data._id;

      // Enroll student
      await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set("Authorization", `Bearer ${studentToken}`);
    });

    it("POST /api/ai/query - should answer course query using RAG", async () => {
      const res = await request(app)
        .post("/api/ai/query")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          courseId,
          query: "What search algorithms and heuristic methods are covered?",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("answer");
      expect(res.body.data).toHaveProperty("sources");
      expect(res.body.data.generatedBy).toBe("local-semantic-engine");
    });

    it("POST /api/ai/summarize - should generate structured course study guide", async () => {
      const res = await request(app)
        .post("/api/ai/summarize")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ courseId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("summary");
      expect(res.body.data.keyConcepts.length).toBeGreaterThan(0);
    });

    it("GET /api/ai/risk-assessment/:courseId - should allow lecturer to view academic risk cohort", async () => {
      const res = await request(app)
        .get(`/api/ai/risk-assessment/${courseId}`)
        .set("Authorization", `Bearer ${lecturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalStudents).toBe(1);
      expect(res.body.data.students[0].studentEmail).toBe("ai.stu@test.edu");
      expect(res.body.data.students[0]).toHaveProperty("riskScore");
      expect(res.body.data.students[0]).toHaveProperty("riskTier");
    });

    it("GET /api/ai/risk-assessment/:courseId - should forbid student from accessing risk analytics (RBAC 403)", async () => {
      const res = await request(app)
        .get(`/api/ai/risk-assessment/${courseId}`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });
});
