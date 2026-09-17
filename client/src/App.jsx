import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Spinner } from './components/ui';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { Classrooms } from './pages/teacher/Classrooms';
import { ClassroomDetail } from './pages/teacher/ClassroomDetail';
import { QuizBuilder } from './pages/teacher/QuizBuilder';
import { QuizAnalytics } from './pages/teacher/QuizAnalytics';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyClassrooms } from './pages/student/MyClassrooms';
import { SubjectHub } from './pages/student/SubjectHub';
import { QuizPlayer } from './pages/student/QuizPlayer';
import { ResultReview } from './pages/student/ResultReview';
import { QuestionTracker } from './pages/student/QuestionTracker';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f8fafc]"><Spinner size="lg" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
};

const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f8fafc]"><Spinner size="lg" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRole="TEACHER"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/classrooms" element={<ProtectedRoute allowedRole="TEACHER"><Classrooms /></ProtectedRoute>} />
      <Route path="/teacher/classrooms/:classroomId" element={<ProtectedRoute allowedRole="TEACHER"><ClassroomDetail /></ProtectedRoute>} />
      <Route path="/teacher/quizzes/new" element={<ProtectedRoute allowedRole="TEACHER"><QuizBuilder /></ProtectedRoute>} />
      <Route path="/teacher/analytics/:quizId" element={<ProtectedRoute allowedRole="TEACHER"><QuizAnalytics /></ProtectedRoute>} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="STUDENT"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/classrooms" element={<ProtectedRoute allowedRole="STUDENT"><MyClassrooms /></ProtectedRoute>} />
      <Route path="/student/subjects/:subjectId" element={<ProtectedRoute allowedRole="STUDENT"><SubjectHub /></ProtectedRoute>} />
      <Route path="/student/quiz/:assignmentId" element={<ProtectedRoute allowedRole="STUDENT"><QuizPlayer /></ProtectedRoute>} />
      <Route path="/student/results/:attemptId" element={<ProtectedRoute allowedRole="STUDENT"><ResultReview /></ProtectedRoute>} />
      <Route path="/student/tracker" element={<ProtectedRoute allowedRole="STUDENT"><QuestionTracker /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={
        <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
          <h1 className="text-6xl font-bold text-[#0f172a] mb-4">404</h1>
          <p className="text-slate-500 mb-6">Page not found</p>
          <a href="/" className="text-[#4338ca] font-medium hover:underline">← Go Home</a>
        </div>
      } />
    </Routes>
  );
}

export default App;
