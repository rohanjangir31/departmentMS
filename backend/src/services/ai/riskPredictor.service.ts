export interface StudentRiskAssessment {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  riskScore: number; // 0 - 100
  riskTier: "Low Risk" | "Moderate Risk" | "High Risk";
  metrics: {
    engagementScore: number;
    daysInactive: number;
    activeCourseLoad: number;
  };
  riskDrivers: string[];
  recommendedAction: string;
}

export class AcademicRiskPredictor {
  /**
   * Evaluates academic risk for a student in a specific course.
   */
  public static assessStudentRisk(params: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    courseId: string;
    engagementScore: number;
    lastAccessedAt: Date;
    activeCourseLoad: number;
  }): StudentRiskAssessment {
    const {
      studentId,
      studentName,
      studentEmail,
      courseId,
      engagementScore,
      lastAccessedAt,
      activeCourseLoad,
    } = params;

    const now = new Date();
    const msSinceAccess = now.getTime() - new Date(lastAccessedAt).getTime();
    const daysInactive = Math.max(0, Math.floor(msSinceAccess / (1000 * 60 * 60 * 24)));

    // Weights for composite risk index
    // Engagement deficit: 50%
    // Inactivity penalty: 30%
    // Course overload penalty: 20%
    const engagementDeficit = Math.max(0, 100 - engagementScore);
    const inactivityPenalty = Math.min(100, daysInactive * 7);
    const overloadPenalty = activeCourseLoad > 5 ? 30 : activeCourseLoad > 4 ? 15 : 0;

    const rawRisk =
      0.5 * engagementDeficit + 0.3 * inactivityPenalty + 0.2 * overloadPenalty;
    const riskScore = Math.min(100, Math.max(0, Math.round(rawRisk)));

    // Determine Risk Tier & Explainable Drivers
    const riskDrivers: string[] = [];

    if (engagementScore < 35) {
      riskDrivers.push(
        `Critical: Portal engagement score (${engagementScore}/100) is significantly below cohort benchmark.`
      );
    } else if (engagementScore < 60) {
      riskDrivers.push(
        `Notice: Engagement score (${engagementScore}/100) indicates passive material participation.`
      );
    }

    if (daysInactive >= 14) {
      riskDrivers.push(
        `Critical: Zero portal interaction for ${daysInactive} consecutive days.`
      );
    } else if (daysInactive >= 7) {
      riskDrivers.push(
        `Warning: No course material activity for ${daysInactive} days.`
      );
    }

    if (activeCourseLoad >= 5) {
      riskDrivers.push(
        `Workload: Enrolled in ${activeCourseLoad} concurrent courses, creating potential cognitive overload.`
      );
    }

    let riskTier: "Low Risk" | "Moderate Risk" | "High Risk" = "Low Risk";
    let recommendedAction = "Student is performing satisfactorily. Maintain standard academic schedule.";

    if (riskScore >= 70) {
      riskTier = "High Risk";
      recommendedAction =
        "Immediate Action Required: Schedule a 1-on-1 academic counseling session and provide remedial materials.";
    } else if (riskScore >= 40) {
      riskTier = "Moderate Risk";
      recommendedAction =
        "Advisory Check-in: Send an automated course reminder and check on assignment progress.";
    }

    if (riskDrivers.length === 0) {
      riskDrivers.push("Consistent engagement and regular study material access detected.");
    }

    return {
      studentId,
      studentName,
      studentEmail,
      courseId,
      riskScore,
      riskTier,
      metrics: {
        engagementScore,
        daysInactive,
        activeCourseLoad,
      },
      riskDrivers,
      recommendedAction,
    };
  }
}
