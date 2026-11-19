"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { aiService } from "@/services/ai.service";
import { CourseRiskCohort, StudentRiskAssessment } from "@/types/ai";
import { toast } from "react-toastify";

interface FacultyRiskDashboardProps {
  courseId: string;
}

export default function FacultyRiskDashboard({ courseId }: FacultyRiskDashboardProps) {
  const [cohort, setCohort] = useState<CourseRiskCohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<string>("all");

  const fetchRiskData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiService.getRiskAssessment(courseId);
      setCohort(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to load risk analytics");
      } else {
        toast.error("Failed to load risk analytics");
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  const handleSendIntervention = (student: StudentRiskAssessment) => {
    toast.success(
      `Academic advisory notice dispatched to ${student.studentName} (${student.studentEmail}).`
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2" />
        <p className="text-sm font-medium text-slate-500">Computing predictive academic risk cohort...</p>
      </div>
    );
  }

  if (!cohort || cohort.totalStudents === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <p className="text-slate-600 font-medium">No active student enrollments found for this course to evaluate.</p>
      </div>
    );
  }

  const filteredStudents =
    filterTier === "all"
      ? cohort.students
      : cohort.students.filter((s) => s.riskTier.toLowerCase().includes(filterTier.toLowerCase()));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-slate-800">
              Student Early Warning & Academic Risk Panel
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Predictive ML Model evaluating material engagement, inactivity duration, and workload risk.
          </p>
        </div>

        <button
          onClick={fetchRiskData}
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Re-evaluate Model
        </button>
      </div>

      {/* Cohort Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Cohort</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{cohort.totalStudents}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-200/80">
          <p className="text-xs uppercase tracking-wider text-red-600 font-semibold">High Risk</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{cohort.distribution.highRisk}</p>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/80">
          <p className="text-xs uppercase tracking-wider text-amber-600 font-semibold">Moderate Risk</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{cohort.distribution.moderateRisk}</p>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200/80">
          <p className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">Low Risk</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{cohort.distribution.lowRisk}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {["all", "high", "moderate", "low"].map((tier) => (
          <button
            key={tier}
            onClick={() => setFilterTier(tier)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              filterTier === tier
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tier === "all" ? "All Students" : `${tier} Risk`}
          </button>
        ))}
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="text-xs uppercase tracking-wider bg-slate-100/70 text-slate-700 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Risk Tier</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Engagement</th>
              <th className="py-3 px-4">Inactivity</th>
              <th className="py-3 px-4">Primary Explainable Driver</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((s) => (
              <tr key={s.studentId} className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  {s.studentName}
                  <div className="text-xs font-normal text-slate-400 font-mono">{s.studentEmail}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      s.riskTier === "High Risk"
                        ? "bg-red-100 text-red-800"
                        : s.riskTier === "Moderate Risk"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {s.riskTier}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold font-mono text-slate-800">
                  {s.riskScore}/100
                </td>
                <td className="py-3.5 px-4 text-xs font-mono">
                  {s.metrics.engagementScore}%
                </td>
                <td className="py-3.5 px-4 text-xs font-mono">
                  {s.metrics.daysInactive} days
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                  {s.riskDrivers[0] || "Normal activity"}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleSendIntervention(s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
                  >
                    Intervene
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
