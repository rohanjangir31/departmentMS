import axios from "../lib/axios";
import { ApiResponse } from "@/types/api";
import { RAGResponse, StudyGuide, CourseRiskCohort } from "@/types/ai";

export const aiService = {
  /**
   * Submit a student question to the grounded course RAG assistant.
   */
  queryMaterial: async (courseId: string, query: string): Promise<ApiResponse<RAGResponse>> => {
    const response = await axios.post("/ai/query", { courseId, query });
    return response.data;
  },

  /**
   * Generate an automated study guide and key concepts from course documents.
   */
  summarizeCourse: async (courseId: string): Promise<ApiResponse<StudyGuide>> => {
    const response = await axios.post("/ai/summarize", { courseId });
    return response.data;
  },

  /**
   * Fetch predictive academic risk analytics for a course (faculty only).
   */
  getRiskAssessment: async (courseId: string): Promise<ApiResponse<CourseRiskCohort>> => {
    const response = await axios.get(`/ai/risk-assessment/${courseId}`);
    return response.data;
  },
};
