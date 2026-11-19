"use client";

import { useState } from "react";
import axios from "axios";
import { aiService } from "@/services/ai.service";
import { RAGResponse, StudyGuide } from "@/types/ai";
import { toast } from "react-toastify";

interface AIAssistantDrawerProps {
  courseId: string;
  courseTitle: string;
}

export default function AIAssistantDrawer({ courseId, courseTitle }: AIAssistantDrawerProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [ragResult, setRagResult] = useState<RAGResponse | null>(null);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [generatingGuide, setGeneratingGuide] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setRagResult(null);

    try {
      const res = await aiService.queryMaterial(courseId, query);
      setRagResult(res.data);
      if (res.data.isOutOfScope) {
        toast.info("Query was outside current course material scope.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to process AI query");
      } else {
        toast.error("Failed to process AI query");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStudyGuide = async () => {
    setGeneratingGuide(true);
    try {
      const res = await aiService.summarizeCourse(courseId);
      setStudyGuide(res.data);
      toast.success("Study guide synthesized from course documents!");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Failed to generate study guide");
      } else {
        toast.error("Failed to generate study guide");
      }
    } finally {
      setGeneratingGuide(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-slate-800">
              AcademiQ AI Study Assistant
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Grounded RAG Assistant — answers strictly cited from <span className="font-medium text-slate-700">{courseTitle}</span> materials.
          </p>
        </div>

        <button
          onClick={handleGenerateStudyGuide}
          disabled={generatingGuide}
          className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all duration-150 disabled:opacity-50"
        >
          {generatingGuide ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Synthesizing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Study Guide
            </>
          )}
        </button>
      </div>

      {/* Query Input */}
      <form onSubmit={handleAsk} className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          Ask a conceptual question about this course:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What are the conditions for a process deadlock? Explain virtual memory paging."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition duration-150 text-sm disabled:opacity-50 inline-flex items-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
            ) : (
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            Ask AI
          </button>
        </div>
      </form>

      {/* RAG Answer Display */}
      {ragResult && (
        <div
          className={`p-5 rounded-xl border transition-all ${
            ragResult.isOutOfScope
              ? "bg-amber-50/70 border-amber-200"
              : "bg-slate-50/90 border-slate-200/90"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Grounded Answer
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Engine: {ragResult.generatedBy}
              </span>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                ragResult.confidence > 0.4
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              Confidence: {Math.round(ragResult.confidence * 100)}%
            </span>
          </div>

          <div className="text-slate-800 text-sm whitespace-pre-line leading-relaxed font-sans">
            {ragResult.answer}
          </div>

          {/* Citations Accordion */}
          {ragResult.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200/70">
              <button
                type="button"
                onClick={() => setShowSources(!showSources)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${showSources ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                {showSources ? "Hide Cited Material Sources" : `View ${ragResult.sources.length} Cited Sources`}
              </button>

              {showSources && (
                <div className="mt-2.5 space-y-2">
                  {ragResult.sources.map((src, i) => (
                    <div
                      key={i}
                      className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600"
                    >
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>📄 {src.documentTitle} (Chunk #{src.chunkIndex + 1})</span>
                        <span className="text-blue-600">Relevance: {(src.relevanceScore * 100).toFixed(1)}%</span>
                      </div>
                      <p className="italic text-slate-500 font-mono">{src.snippet}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Study Guide Display */}
      {studyGuide && (
        <div className="p-5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-indigo-950 text-base">
              📚 Synthesized Course Study Guide
            </h3>
            <button
              onClick={() => setStudyGuide(null)}
              className="text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              Dismiss
            </button>
          </div>

          <p className="text-sm text-indigo-900 leading-relaxed font-sans">
            {studyGuide.summary}
          </p>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-2">
              Key Core Concepts:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {studyGuide.keyConcepts.map((c, i) => (
                <div key={i} className="bg-white px-3 py-2 rounded-lg border border-indigo-100 text-xs font-medium text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  {c}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-2">
              Self-Assessment Revision Questions:
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700">
              {studyGuide.studyQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
