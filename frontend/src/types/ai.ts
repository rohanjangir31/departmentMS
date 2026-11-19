export interface RAGSource {
  documentTitle: string;
  chunkIndex: number;
  snippet: string;
  relevanceScore: number;
}

export interface RAGResponse {
  answer: string;
  confidence: number;
  sources: RAGSource[];
  isOutOfScope: boolean;
  generatedBy: "cloud-llm" | "local-semantic-engine";
}

export interface StudyGuide {
  summary: string;
  keyConcepts: string[];
  studyQuestions: string[];
}

export interface StudentRiskMetric {
  engagementScore: number;
  daysInactive: number;
  activeCourseLoad: number;
}

export interface StudentRiskAssessment {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  riskScore: number;
  riskTier: "Low Risk" | "Moderate Risk" | "High Risk";
  metrics: StudentRiskMetric;
  riskDrivers: string[];
  recommendedAction: string;
}

export interface CourseRiskCohort {
  courseId: string;
  courseTitle: string;
  totalStudents: number;
  cohortRiskIndex: number;
  distribution: {
    highRisk: number;
    moderateRisk: number;
    lowRisk: number;
  };
  students: StudentRiskAssessment[];
}
