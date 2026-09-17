import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { AppShell } from '../../components/layout/AppShell';
import {
  Card, Spinner, Table, TableHead, TableBody, TableRow,
  TableHeaderCell, TableCell, Badge, EmptyState
} from '../../components/ui';
import { Users, TrendingUp, Award, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const formatTime = (secs) => {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
};

export const QuizAnalytics = () => {
  const { quizId } = useParams();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['quiz-analytics', quizId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/quiz/${quizId}/summary`);
      return data;
    }
  });

  if (isLoading) return <AppShell title="Analytics"><div className="flex justify-center mt-20"><Spinner /></div></AppShell>;
  if (error || !analytics) return (
    <AppShell title="Analytics">
      <p className="text-slate-500 mt-8 text-center">Analytics not found. No quiz attempts yet.</p>
    </AppShell>
  );

  return (
    <AppShell title="Quiz Analytics">
      {/* Back + Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link to="/teacher/dashboard" className="text-slate-400 hover:text-[#4338ca] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-[#0f172a]">{analytics.quizTitle}</h2>
          <p className="text-sm text-slate-500">{analytics.subjectName}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-2.5 rounded-lg bg-[#4338ca] text-white flex-shrink-0"><Users className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-slate-500">Students Attempted</p>
            <p className="text-2xl font-bold text-[#0f172a]">{analytics.studentsAttempted}</p>
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className={`p-2.5 rounded-lg text-white flex-shrink-0 ${analytics.classAverage >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}><TrendingUp className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-slate-500">Class Average</p>
            <p className="text-2xl font-bold text-[#0f172a]">{analytics.classAverage}%</p>
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-2.5 rounded-lg bg-amber-500 text-white flex-shrink-0"><Award className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-slate-500">Highest Score</p>
            <p className="text-2xl font-bold text-[#0f172a]">{analytics.highestScore}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Per-question accuracy bars */}
        <Card title="Per-Question Accuracy">
          {analytics.perQuestion?.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No data yet" description="Accuracy will appear once students submit." />
          ) : (
            <div className="space-y-5">
              {analytics.perQuestion?.map((q, i) => (
                <div key={q.questionId}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0f172a] line-clamp-1">Q{i + 1}. {q.questionText}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{q.topic}</span>
                        <Badge variant={q.difficulty === 'EASY' ? 'success' : q.difficulty === 'HARD' ? 'danger' : 'warning'} className="text-[10px]">
                          {q.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ${q.accuracyPercent >= 70 ? 'text-emerald-600' : q.accuracyPercent >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                      {q.accuracyPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${q.accuracyPercent >= 70 ? 'bg-emerald-500' : q.accuracyPercent >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${q.accuracyPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Leaderboard */}
        <Card title="Leaderboard">
          {analytics.leaderboard?.length === 0 ? (
            <EmptyState icon={Award} title="No submissions yet" description="Leaderboard appears after students submit." />
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Rank</TableHeaderCell>
                    <TableHeaderCell>Student</TableHeaderCell>
                    <TableHeaderCell>Score</TableHeaderCell>
                    <TableHeaderCell>Time</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.leaderboard?.map((entry, idx) => (
                    <TableRow key={entry.studentId || idx}>
                      <TableCell>
                        <span className={`font-bold text-sm ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-500'}`}>
                          #{idx + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{entry.studentName}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${entry.percentage >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {entry.percentage}%
                        </span>
                        <span className="text-slate-400 text-xs ml-1">({entry.score}/{entry.totalScore})</span>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">{formatTime(entry.timeSpentSeconds)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {/* Gradebook / Student Matrix */}
      {analytics.studentMatrix?.length > 0 && (
        <Card title="Gradebook — Student × Question Matrix">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#f8fafc]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-[#e2e8f0] sticky left-0 bg-[#f8fafc]">
                    Student
                  </th>
                  {analytics.perQuestion?.map((q, i) => (
                    <th key={q.questionId} className="px-3 py-3 text-center text-xs font-semibold text-slate-500 border-b border-[#e2e8f0] min-w-[48px]">
                      Q{i + 1}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-[#e2e8f0]">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.studentMatrix?.map((row, ri) => (
                  <tr key={ri} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-2.5 font-medium text-[#0f172a] border-t border-[#e2e8f0] sticky left-0 bg-white hover:bg-[#f8fafc]">
                      {row.studentName}
                    </td>
                    {analytics.perQuestion?.map((pq, qi) => {
                      const ans = row.answers?.find(a => a.questionId === pq.questionId);
                      return (
                        <td key={qi} className="px-3 py-2.5 text-center border-t border-[#e2e8f0]">
                          {ans ? (
                            ans.isCorrect
                              ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                              : <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 text-center border-t border-[#e2e8f0]">
                      <span className={`font-bold text-sm ${row.percentage >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {row.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppShell>
  );
};
