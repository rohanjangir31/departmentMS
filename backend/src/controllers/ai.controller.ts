import { RequestHandler } from "express";
import { Course } from "../models/Course";
import { Material } from "../models/Material";
import { Enrollment } from "../models/Enrollment";
import { DocumentProcessor, DocumentChunk } from "../services/ai/documentProcessor.service";
import { RAGService } from "../services/ai/rag.service";
import { AcademicRiskPredictor } from "../services/ai/riskPredictor.service";
import { sendResponse } from "../utils/responseHandler";

/**
 * Helper to build document chunks for a course.
 */
async function getCourseChunks(courseId: string, courseTitle: string): Promise<DocumentChunk[]> {
  const materials = await Material.find({ courseId });
  const allChunks: DocumentChunk[] = [];

  if (materials.length === 0) {
    // Generate syllabus chunk from course metadata
    const course = await Course.findById(courseId);
    const syllabusText = `${courseTitle} Syllabus: ${course?.description || "Course details and curriculum."}`;
    return DocumentProcessor.chunkText(syllabusText, `${courseTitle} Syllabus`, 120, 20);
  }

  for (const mat of materials) {
    const text = DocumentProcessor.extractTextFromFile(mat.fileUrl, mat.title);
    const chunks = DocumentProcessor.chunkText(text, mat.title, 150, 30);
    allChunks.push(...chunks);
  }

  return allChunks;
}

/**
 * Handles student RAG queries against course materials.
 */
export const queryCourseMaterial: RequestHandler = async (req, res) => {
  try {
    const { courseId, query } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      sendResponse(res, 404, false, "Course not found", null);
      return;
    }

    // Build chunks from course materials
    const chunks = await getCourseChunks(courseId, course.title);

    // Execute grounded RAG query
    const ragResult = await RAGService.queryMaterials(query, chunks);

    sendResponse(res, 200, true, "RAG query answered successfully", ragResult);
    return;
  } catch (error) {
    console.error("RAG Query Error:", error);
    sendResponse(res, 500, false, "Failed to process AI query", null);
    return;
  }
};

/**
 * Generates an automated study guide and key concepts from course documents.
 */
export const summarizeCourse: RequestHandler = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      sendResponse(res, 404, false, "Course not found", null);
      return;
    }

    const chunks = await getCourseChunks(courseId, course.title);
    const studyGuide = RAGService.generateStudyGuide(course.title, chunks);

    sendResponse(res, 200, true, "Study guide generated successfully", studyGuide);
    return;
  } catch (error) {
    console.error("Summarize Error:", error);
    sendResponse(res, 500, false, "Failed to generate study guide", null);
    return;
  }
};

/**
 * Computes predictive academic risk indicators for all students enrolled in a course.
 */
export const getCourseRiskAssessment: RequestHandler = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      sendResponse(res, 404, false, "Course not found", null);
      return;
    }

    // Find all active enrollments for this course
    const enrollments = await Enrollment.find({
      course: courseId,
      status: "active",
    }).populate("student", "name email");

    const studentAssessments = [];
    let highRiskCount = 0;
    let moderateRiskCount = 0;
    let lowRiskCount = 0;

    for (const enrollment of enrollments) {
      const student = enrollment.student as any;
      if (!student) continue;

      // Count total courses student is enrolled in
      const activeCourseLoad = await Enrollment.countDocuments({
        student: student._id,
        status: "active",
      });

      const assessment = AcademicRiskPredictor.assessStudentRisk({
        studentId: student._id.toString(),
        studentName: student.name || "Student",
        studentEmail: student.email || "student@test.edu",
        courseId,
        engagementScore: enrollment.engagementScore ?? 50,
        lastAccessedAt: enrollment.lastAccessedAt || enrollment.enrolledAt,
        activeCourseLoad,
      });

      if (assessment.riskTier === "High Risk") highRiskCount++;
      else if (assessment.riskTier === "Moderate Risk") moderateRiskCount++;
      else lowRiskCount++;

      studentAssessments.push(assessment);
    }

    const totalStudents = studentAssessments.length;
    const cohortRiskIndex =
      totalStudents > 0
        ? Math.round(
            studentAssessments.reduce((acc, s) => acc + s.riskScore, 0) / totalStudents
          )
        : 0;

    sendResponse(res, 200, true, "Course academic risk analysis retrieved", {
      courseId,
      courseTitle: course.title,
      totalStudents,
      cohortRiskIndex,
      distribution: {
        highRisk: highRiskCount,
        moderateRisk: moderateRiskCount,
        lowRisk: lowRiskCount,
      },
      students: studentAssessments,
    });
    return;
  } catch (error) {
    console.error("Risk Assessment Error:", error);
    sendResponse(res, 500, false, "Failed to compute risk assessment", null);
    return;
  }
};
