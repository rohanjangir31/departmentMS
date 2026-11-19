"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import CourseCard from "@/components/CourseCard";
import { Course } from "@/types/course";
import { courseService } from "../../services/course.service";
import Link from "next/link";
import { useApiError } from "@/hooks/useApiError";
import { toast } from "react-toastify";

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { error, handleError } = useApiError();

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    try {
      let response;
      if (user.role === "lecturer") {
        response = await courseService.getLecturerCourses(user._id);
      } else if (user.role === "student") {
        response = await courseService.getEnrolledCourses();
      } else if (user.role === "admin") {
        response = await courseService.getAllCourses();
      }
      setCourses(response?.data || []);
    } catch (err) {
      handleError(err);
      toast.info(error);
    } finally {
      setLoading(false);
    }
  }, [user, handleError, error]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.courseCode.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome back, {user?.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
              {user?.role}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Department of Computer Science & Engineering • AcademiQ Workspace
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === "lecturer" && (
            <Link
              href="/dashboard/courses/new"
              className="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Course
            </Link>
          )}

          {user?.role === "student" && (
            <Link
              href="/dashboard/courses"
              className="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm inline-flex items-center"
            >
              Browse Course Catalog
            </Link>
          )}
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              {user?.role === "student" ? "Enrolled Courses" : "Managed Courses"}
            </p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{courses.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">AI Study Engine</p>
            <p className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              RAG Online & Grounded
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Academic Status</p>
            <p className="text-sm font-bold text-slate-700 mt-2">Active Semester</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Institution</p>
            <p className="text-sm font-bold text-slate-700 mt-2">CSE Department</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Course Section Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {user?.role === "student" ? "My Enrolled Courses" : "Assigned Courses"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click on any course to access learning materials, the AI Study Assistant, and syllabus notes.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by code or title..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              actionButton={{
                label: "Open Course Hub →",
                action: `/dashboard/courses/${course._id}`,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 text-xl">
            📚
          </div>
          <h3 className="text-base font-bold text-slate-700">No Courses Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {user?.role === "student"
              ? "You are not enrolled in any courses yet. Browse the course catalog to enroll in upcoming classes."
              : "No courses are currently assigned. Click Create New Course to set up a new academic module."}
          </p>
          {user?.role === "student" && (
            <Link
              href="/dashboard/courses"
              className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-block"
            >
              Browse Course Catalog
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
