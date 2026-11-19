"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { courseService } from "@/services/course.service";
import { materialService } from "@/services/material.service";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { formatDate } from "../../../../../utils/formatDate";
import { toast } from "react-toastify";
import { CourseWithDetails } from "@/types/course";
import { Material } from "@/types/material";
import { User } from "@/types/user";
import { useApiError } from "@/hooks/useApiError";
import AIAssistantDrawer from "@/components/AIAssistantDrawer";
import FacultyRiskDashboard from "@/components/FacultyRiskDashboard";

interface Params {
  id: string;
}

export default function CourseDetailsPage() {
  const { id } = useParams() as unknown as Params;
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState<"materials" | "ai-assistant" | "students" | "risk-analytics">("materials");
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { error, handleError } = useApiError();

  const fetchCourseDetails = useCallback(async () => {
    try {
      const courseResponse = await courseService.getCourseById(id);
      setCourse(courseResponse.data);

      const materialsResponse = await materialService.getMaterialsByCourse(id);
      setMaterials(materialsResponse.data);

      const studentsResponse = await courseService.getStudentsByCourse(id);
      setStudents(studentsResponse.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [id, handleError]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      await materialService.deleteMaterial(materialId);
      toast.info("Material has been successfully deleted!");
      setMaterials((prev) => prev.filter((m) => m._id !== materialId));
    } catch (err) {
      handleError(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) return <div className="p-6 bg-red-50 text-red-700 rounded-xl">Error: {error}</div>;

  if (!course) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
        <p className="text-lg text-slate-600">Course not found.</p>
        <Link href="/dashboard/courses" className="btn-primary mt-4 inline-block">
          Back to Courses
        </Link>
      </div>
    );
  }

  const isFaculty = user?.role === "lecturer" || user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold font-mono uppercase tracking-wider">
                {course?.courseCode}
              </span>
              <h1 className="text-2xl font-bold text-slate-800">{course?.title}</h1>
            </div>
            <p className="text-slate-600 text-sm mt-2 max-w-3xl leading-relaxed">
              {course?.description}
            </p>
          </div>

          {user?.role === "lecturer" && (
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/courses/${course._id}/edit`}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold transition"
              >
                Edit Course
              </Link>
              <Link
                href={`/dashboard/courses/${course._id}/materials/upload`}
                className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center shadow-sm"
              >
                Upload Material
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Enrolled Students: <strong className="text-slate-700">{course?.students?.length || 0}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Materials: <strong className="text-slate-700">{materials?.length || 0}</strong>
          </span>
        </div>
      </div>

      {/* Course Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="flex border-b border-slate-200 px-4 bg-slate-50/50 overflow-x-auto">
          <button
            className={`px-5 py-3.5 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === "materials"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setActiveTab("materials")}
          >
            <span>📁</span> Course Materials ({materials?.length || 0})
          </button>

          <button
            className={`px-5 py-3.5 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === "ai-assistant"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setActiveTab("ai-assistant")}
          >
            <span>🤖</span> AI Study Assistant (RAG)
          </button>

          <button
            className={`px-5 py-3.5 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === "students"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setActiveTab("students")}
          >
            <span>👥</span> Enrolled Students ({students?.length || 0})
          </button>

          {isFaculty && (
            <button
              className={`px-5 py-3.5 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
                activeTab === "risk-analytics"
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-amber-600 hover:text-amber-800"
              }`}
              onClick={() => setActiveTab("risk-analytics")}
            >
              <span>📊</span> Early Warning & Risk
            </button>
          )}
        </div>

        <div className="p-6">
          {/* AI Study Assistant Tab */}
          {activeTab === "ai-assistant" && (
            <AIAssistantDrawer courseId={course._id} courseTitle={course.title} />
          )}

          {/* Academic Risk Analytics Tab (Faculty Only) */}
          {activeTab === "risk-analytics" && isFaculty && (
            <FacultyRiskDashboard courseId={course._id} />
          )}

          {/* Materials Tab */}
          {activeTab === "materials" && (
            <div>
              {materials?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Title</th>
                        <th className="px-6 py-3 text-left font-semibold">Uploaded</th>
                        <th className="px-6 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {materials.map((material) => (
                        <tr key={material._id} className="hover:bg-slate-50/70 transition">
                          <td className="px-6 py-4 font-semibold text-slate-800">
                            📄 {material.title}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {material.updatedAt && formatDate(material.updatedAt)}
                          </td>
                          <td className="px-6 py-4 text-right space-x-3">
                            <a
                              href={material.fileUrl}
                              download
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                            >
                              Download
                            </a>
                            {user?.role === "lecturer" && (
                              <button
                                onClick={() => handleDeleteMaterial(material._id)}
                                className="text-rose-600 hover:text-rose-800 font-semibold text-xs"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <p className="text-slate-500 text-sm">No learning materials uploaded for this course yet.</p>
                  {user?.role === "lecturer" && (
                    <Link
                      href={`/dashboard/courses/${course?._id}/materials/upload`}
                      className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold inline-block"
                    >
                      Upload First Material
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-4">
                Enrolled Students ({students?.length || 0})
              </h2>
              {students?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Name</th>
                        <th className="px-6 py-3 text-left font-semibold">Email</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {students.map((student) => (
                        <tr key={student._id} className="hover:bg-slate-50/70 transition">
                          <td className="px-6 py-4 font-semibold text-slate-800">{student.name}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs font-mono">{student.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No students currently enrolled in this course.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
