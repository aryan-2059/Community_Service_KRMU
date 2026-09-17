import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import { Button, Spinner, Modal } from '../../components/ui';

export const QuizPlayer = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Load single assignment by ID (efficient — no findMany + filter)
  const { data: assignment, isLoading: aLoading, error: aError } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const { data } = await api.get(`/assignments/${assignmentId}`);
      return data;
    }
  });

  // Load quiz
  const { data: quiz, isLoading: qLoading } = useQuery({
    queryKey: ['quiz-detail', assignment?.quizId],
    queryFn: async () => {
      const { data } = await api.get(`/quizzes/${assignment.quizId}`);
      return data;
    },
    enabled: !!assignment?.quizId
  });

  // Initialise timer once quiz loads
  useEffect(() => {
    if (quiz && timeLeft === null) {
      setTimeLeft(quiz.timeLimitMinutes * 60);
    }
  }, [quiz, timeLeft]);

  // Countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const submitMutation = useMutation({
    mutationFn: (payload) => api.post('/attempts', payload),
    onSuccess: (res) => navigate(`/student/results/${res.data.id}`)
  });

  const handleSubmit = useCallback(() => {
    if (!quiz || submitMutation.isPending) return;
    const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption
    }));
    const elapsed = quiz.timeLimitMinutes * 60 - (timeLeft ?? 0);
    submitMutation.mutate({
      assignmentId,
      quizId: quiz.id,
      answers: answersArray,
      timeSpentSeconds: Math.max(0, elapsed)
    });
  }, [quiz, answers, timeLeft, assignmentId, submitMutation]);

  // Auto-submit on timeout
  useEffect(() => {
    if (timeLeft === 0 && !autoSubmitted) {
      setAutoSubmitted(true);
      handleSubmit();
    }
  }, [timeLeft, autoSubmitted, handleSubmit]);

  if (aLoading || qLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (aError || !quiz) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-slate-500 gap-3">
        <p className="font-medium">Assignment or quiz not found.</p>
        <button onClick={() => navigate('/student/dashboard')} className="text-[#4338ca] hover:underline text-sm">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Already completed?
  if (assignment?.myAttempt) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-[#0f172a]">You've already completed this quiz.</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/student/results/${assignment.myAttempt.id}`)}
            className="bg-[#4338ca] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3730a3] transition-colors"
          >
            View Results
          </button>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="border border-[#e2e8f0] text-[#0f172a] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#f8fafc] transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentIdx];
  const options = currentQ?.options || {};
  const progress = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const isTimerDanger = timeLeft !== null && timeLeft < 60;
  const isTimerWarning = timeLeft !== null && timeLeft < 300 && !isTimerDanger;

  const formatTime = (secs) => {
    if (secs === null) return '--:--';
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.max(0, secs) % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Sticky header */}
      <header className="h-16 bg-white border-b border-[#e2e8f0] sticky top-0 z-10 flex items-center justify-between px-6 shadow-sm">
        <h1 className="font-bold text-[#0f172a] truncate mr-4">{quiz.title}</h1>
        <div className={`font-mono text-lg font-bold px-3 py-1 rounded-lg transition-colors flex-shrink-0 ${
          isTimerDanger ? 'bg-red-50 text-red-600 animate-pulse' :
          isTimerWarning ? 'bg-amber-50 text-amber-600' :
          'bg-slate-100 text-[#0f172a]'
        }`}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm font-medium text-slate-400 flex-shrink-0 ml-4">
          {currentIdx + 1} / {questions.length}
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-slate-200">
        <div className="h-1 bg-[#4338ca] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Question body */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pt-10 pb-36">
        {currentQ && (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-[#4338ca] uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">
                  Question {currentIdx + 1}
                </span>
                {currentQ.topic && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{currentQ.topic}</span>
                )}
              </div>
              <p className="text-xl font-medium text-[#0f172a] leading-relaxed">{currentQ.questionText}</p>
            </div>

            <div className="space-y-3">
              {(() => {
                const validOpts = ['A', 'B', 'C', 'D'].filter(opt => options[opt]);
                if (validOpts.length === 0) {
                  return (
                    <div className="p-5 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium">
                      ⚠️ This question has no answer options. Please ask your teacher to fix it.
                    </div>
                  );
                }
                return validOpts.map(opt => {
                  const isSelected = answers[currentQ.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        isSelected
                          ? 'border-[#4338ca] bg-[#4338ca] text-white shadow-md'
                          : 'border-[#e2e8f0] bg-white hover:border-[#4338ca]/40 text-[#0f172a]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {opt}
                      </div>
                      <span className="text-base">{options[opt]}</span>
                    </button>
                  );
                });
              })()}
            </div>
          </>
        )}
      </main>

      {/* Fixed footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] px-6 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <Button variant="secondary" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)}>
            ← Prev
          </Button>

          {/* Dot navigator */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                title={`Question ${i + 1}`}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                  currentIdx === i
                    ? 'bg-[#4338ca] text-white ring-2 ring-[#4338ca] ring-offset-2'
                    : answers[q.id]
                    ? 'bg-indigo-100 text-[#4338ca]'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIdx === questions.length - 1 ? (
            <Button onClick={() => setIsSubmitModalOpen(true)}>Submit Quiz</Button>
          ) : (
            <Button onClick={() => setCurrentIdx(i => i + 1)}>Next →</Button>
          )}
        </div>
      </footer>

      {/* Submit confirmation modal */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="Submit Quiz">
        <div className="py-2">
          <p className="text-base font-medium text-[#0f172a] mb-2">Are you sure you want to submit?</p>
          <p className="text-sm text-slate-500">
            You have answered <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions.
          </p>
          {answeredCount < questions.length && (
            <p className="text-sm text-amber-700 mt-3 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
              ⚠ {questions.length - answeredCount} unanswered question(s) will be marked incorrect.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={submitMutation.isPending}>Confirm Submit</Button>
        </div>
      </Modal>
    </div>
  );
};
