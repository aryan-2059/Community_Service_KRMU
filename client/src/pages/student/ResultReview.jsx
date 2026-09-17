import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { AppShell } from '../../components/layout/AppShell';
import { Card, Badge, Spinner } from '../../components/ui';
import { ArrowLeft, Clock, Target, CheckCircle2, XCircle } from 'lucide-react';

const formatTime = (secs) => {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
};

export const ResultReview = () => {
  const { attemptId } = useParams();
  const [expandedQ, setExpandedQ] = useState(null);

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: async () => {
      const { data } = await api.get(`/attempts/${attemptId}`);
      return data;
    }
  });

  if (isLoading) return <AppShell title="Quiz Review"><div className="flex justify-center mt-20"><Spinner /></div></AppShell>;
  if (error || !result) return <AppShell title="Not Found"><p className="text-slate-500 mt-8 text-center">Result not found.</p></AppShell>;

  const pct = result.totalScore > 0 ? (result.score / result.totalScore) * 100 : 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (pct / 100) * circumference;
  const strokeColor = pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626';

  return (
    <AppShell title="Quiz Review">
      <div className="mb-6">
        <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-[#4338ca] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Score summary */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 flex flex-col md:flex-row items-center gap-10 mb-8 shadow-sm">
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} stroke="#f1f5f9" strokeWidth="12" fill="none" />
            <circle
              cx="70" cy="70" r={radius}
              stroke={strokeColor}
              strokeWidth="12" fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[#0f172a]">{pct.toFixed(0)}%</span>
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Score</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <h2 className="text-2xl font-bold text-[#0f172a]">{result.quiz?.title}</h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Badge variant={pct >= 70 ? 'success' : 'danger'}>
              {pct >= 70 ? '✓ Pass' : '✗ Needs Review'}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              <Target className="w-3.5 h-3.5" />
              {result.score} / {result.totalScore} marks
            </div>
            {result.timeSpentSeconds && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(result.timeSpentSeconds)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question review */}
      <h3 className="text-base font-bold text-[#0f172a] mb-4">Question-by-Question Review</h3>
      <div className="space-y-4">
        {result.studentAnswers?.map((q, idx) => (
          <div
            key={q.questionId}
            className={`bg-white border rounded-xl overflow-hidden shadow-sm border-l-4 ${q.isCorrect ? 'border-l-[#16a34a]' : 'border-l-[#dc2626]'} border-[#e2e8f0]`}
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {q.isCorrect
                    ? <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
                    : <XCircle className="w-5 h-5 text-[#dc2626]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0f172a] mb-4">
                    <span className="text-slate-400 mr-1">Q{idx + 1}.</span>
                    {q.questionText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className={`p-3 rounded-lg border ${q.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-xs font-bold uppercase mb-1 text-slate-500">Your Answer</p>
                      <p className={`text-sm font-medium ${q.isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                        {q.selectedOption}. {q.options?.[q.selectedOption]}
                      </p>
                    </div>
                    {!q.isCorrect && (
                      <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200">
                        <p className="text-xs font-bold uppercase mb-1 text-emerald-600">Correct Answer</p>
                        <p className="text-sm font-medium text-emerald-800">
                          {q.correctOption}. {q.options?.[q.correctOption]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Explanation accordion */}
                  {expandedQ === q.questionId ? (
                    <div className="bg-indigo-50 border-l-4 border-[#4338ca] p-4 rounded-r-lg">
                      <p className="text-xs font-bold text-[#4338ca] uppercase mb-1 tracking-wide">Explanation</p>
                      <p className="text-sm text-indigo-900 leading-relaxed">{q.explanation || 'No explanation provided.'}</p>
                      <button
                        onClick={() => setExpandedQ(null)}
                        className="text-xs font-medium text-[#4338ca] mt-2 hover:underline"
                      >
                        Hide Explanation
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setExpandedQ(q.questionId)}
                      className="text-sm font-medium text-[#4338ca] hover:underline"
                    >
                      See Explanation →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
};
