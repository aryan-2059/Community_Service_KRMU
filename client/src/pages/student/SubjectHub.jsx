import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { AppShell } from '../../components/layout/AppShell';
import {
  Card, Badge, Spinner, Table, TableHead, TableBody,
  TableRow, TableHeaderCell, TableCell, EmptyState
} from '../../components/ui';
import { BookOpen, TrendingUp, Award, Target, ArrowLeft } from 'lucide-react';

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const SubjectHub = () => {
  const { subjectId } = useParams();

  const { data: subjectInfo, isLoading, error } = useQuery({
    queryKey: ['subject-hub', subjectId],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/subject/${subjectId}/trend`);
      return data;
    }
  });

  if (isLoading) return <AppShell title="Subject Hub"><div className="flex justify-center mt-20"><Spinner /></div></AppShell>;
  if (error || !subjectInfo) return (
    <AppShell title="Subject Hub">
      <p className="text-slate-500 mt-8 text-center">Subject data not found.</p>
    </AppShell>
  );

  const trend = subjectInfo.trend || [];
  const history = subjectInfo.history || [];

  // SVG line chart from percentage data
  const chartW = 300;
  const chartH = 100;
  const points = trend.length > 1
    ? trend.map((pct, i) => {
        const x = (i / (trend.length - 1)) * chartW;
        const y = chartH - (pct / 100) * chartH;
        return { x, y };
      })
    : [];

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <AppShell title="Subject Hub">
      {/* Back + header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/student/classrooms" className="text-slate-400 hover:text-[#4338ca] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0f172a]">{subjectInfo.subjectName}</h1>
            <Badge variant="info">{subjectInfo.subjectCode}</Badge>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{subjectInfo.classroomName}</p>
        </div>
      </div>

      {/* Stats + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance trend chart */}
        <Card className="lg:col-span-2" title="Performance Trend">
          {trend.length < 2 ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
              Complete more quizzes to see your trend.
            </div>
          ) : (
            <div className="relative h-48 mt-4">
              <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(pct => (
                  <line
                    key={pct}
                    x1="0" y1={chartH - (pct / 100) * chartH}
                    x2={chartW} y2={chartH - (pct / 100) * chartH}
                    stroke="#f1f5f9" strokeWidth="1"
                  />
                ))}
                {/* Fill area */}
                {points.length > 1 && (
                  <polygon
                    fill="rgba(67,56,202,0.08)"
                    points={`${points[0].x},${chartH} ${polylinePoints} ${points[points.length - 1].x},${chartH}`}
                  />
                )}
                {/* Line */}
                <polyline
                  fill="none"
                  stroke="#4338ca"
                  strokeWidth="2.5"
                  points={polylinePoints}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Data points */}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#4338ca" />
                    <circle cx={p.x} cy={p.y} r="3" fill="white" />
                  </g>
                ))}
              </svg>
              {/* X-axis labels */}
              <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between">
                {history.map((h, i) => (
                  <span key={i} className="text-[9px] text-slate-400 text-center" style={{ width: `${100 / history.length}%` }}>
                    {`Q${i + 1}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Stats column */}
        <div className="space-y-4">
          <div className="bg-[#4338ca] rounded-xl p-5 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-200" />
              <p className="text-sm font-medium text-indigo-200">Average Score</p>
            </div>
            <p className="text-4xl font-bold text-white">{subjectInfo.stats?.avgScore ?? 0}%</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 text-center shadow-sm">
              <div className="flex justify-center mb-1"><BookOpen className="w-4 h-4 text-slate-400" /></div>
              <p className="text-2xl font-bold text-[#0f172a]">{subjectInfo.stats?.quizzes ?? 0}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Quizzes</p>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 text-center shadow-sm">
              <div className="flex justify-center mb-1"><Award className="w-4 h-4 text-amber-400" /></div>
              <p className="text-2xl font-bold text-[#0f172a]">{subjectInfo.stats?.bestScore ?? 0}%</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Best Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz history table */}
      <Card title="Quiz History">
        {history.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No quizzes completed yet"
            description="Complete assigned quizzes to see your history here."
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>#</TableHeaderCell>
                <TableHeaderCell>Quiz</TableHeaderCell>
                <TableHeaderCell>Score</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell></TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((h, i) => (
                <TableRow key={h.attemptId}>
                  <TableCell className="text-slate-400 font-mono">{i + 1}</TableCell>
                  <TableCell className="font-medium">{h.quizTitle}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${h.percentage >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {h.percentage}%
                      </span>
                      <span className="text-xs text-slate-400">({h.score}/{h.totalScore})</span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${h.percentage >= 70 ? 'bg-emerald-500' : 'bg-red-400'}`}
                          style={{ width: `${h.percentage}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs whitespace-nowrap">{formatDate(h.submittedAt)}</TableCell>
                  <TableCell>
                    <Link
                      to={`/student/results/${h.attemptId}`}
                      className="text-[#4338ca] hover:underline text-sm font-medium"
                    >
                      Review →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </AppShell>
  );
};
