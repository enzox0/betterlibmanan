import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronRight,
  FaRedo,
  FaHome,
  FaLightbulb,
  FaTrophy,
  FaStar,
  FaArrowRight,
} from 'react-icons/fa';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { quizQuestions, CATEGORY_COLORS } from '../data/quizData';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Phase = 'intro' | 'quiz' | 'result';

interface Answer {
  questionId: number;
  selectedIndex: number;
  correct: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getResultTier(score: number, total: number) {
  const pct = (score / total) * 100;
  if (pct === 100) return { label: 'Perfect Score!', color: 'text-yellow-500' };
  if (pct >= 80) return { label: 'Excellent!', color: 'text-emerald-600' };
  if (pct >= 60) return { label: 'Good Job!', color: 'text-blue-600' };
  if (pct >= 40) return { label: 'Keep Learning!', color: 'text-orange-500' };
  return { label: 'Try Again!', color: 'text-red-500' };
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export function QuizPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const total = quizQuestions.length;
  const current = quizQuestions[currentIndex];
  const score = answers.filter((a) => a.correct).length;

  /* ── Actions ─────────────────────────────────────────────────────────── */
  const startQuiz = () => {
    setPhase('quiz');
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setRevealed(false);
  };

  const selectOption = (index: number) => {
    if (revealed) return;
    setSelectedOption(index);
    setRevealed(true);
  };

  const next = useCallback(() => {
    if (selectedOption === null) return;

    const answer: Answer = {
      questionId: current.id,
      selectedIndex: selectedOption,
      correct: selectedOption === current.correctIndex,
    };

    const updatedAnswers = [...answers, answer];
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < total) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setRevealed(false);
    } else {
      setPhase('result');
    }
  }, [selectedOption, current, answers, currentIndex, total]);

  const restart = () => {
    setPhase('intro');
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setRevealed(false);
  };

  /* ── Option styling ──────────────────────────────────────────────────── */
  const getOptionStyle = (index: number) => {
    if (!revealed) {
      return selectedOption === index
        ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50';
    }
    if (index === current.correctIndex) {
      return 'border-emerald-500 bg-emerald-50 text-emerald-800';
    }
    if (index === selectedOption && selectedOption !== current.correctIndex) {
      return 'border-red-400 bg-red-50 text-red-800';
    }
    return 'border-neutral-200 bg-white text-neutral-400';
  };

  const getOptionIcon = (index: number) => {
    if (!revealed) return null;
    if (index === current.correctIndex) return <FaCheckCircle className="text-emerald-500 shrink-0" />;
    if (index === selectedOption) return <FaTimesCircle className="text-red-400 shrink-0" />;
    return null;
  };

  const tier = phase === 'result' ? getResultTier(score, total) : null;

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16"
        >
          <h1 className="text-center text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Libmanan Quiz
          </h1>
          <p className="mt-3 text-center text-sm text-gray-400 sm:text-base max-w-lg mx-auto">
            Test your knowledge of Libmanan's history, culture, geography, and more.
          </p>

          {/* Progress strip — only visible during quiz */}
          {phase === 'quiz' && (
            <div className="mt-8 max-w-xl mx-auto">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Question {currentIndex + 1} of {total}</span>
                <span className="font-semibold text-white">{score} correct</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex) / total) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <AnimatePresence mode="wait">

            {/* ── INTRO ─────────────────────────────────────────────────────── */}
            {phase === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Lottie header */}
                <div className="bg-neutral-50 border-b border-neutral-200 flex justify-center py-8">
                  <DotLottieReact
                    src="/edu.lottie"
                    loop
                    autoplay
                    className="w-40 h-40 sm:w-48 sm:h-48"
                  />
                </div>

                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                    How well do you know Libmanan?
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                    Explore your knowledge of Libmanan's heritage, cultural identity, geography,
                    and local landmarks through {total} interactive questions.
                  </p>

                  {/* Quiz meta chips */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      { label: `${total} Questions`, icon: FaLightbulb },
                      { label: 'Multiple Choice', icon: FaCheckCircle },
                      { label: 'Instant Feedback', icon: FaStar },
                    ].map(({ label, icon: Icon }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 bg-neutral-100 text-xs font-medium text-neutral-600"
                      >
                        <Icon className="text-[10px] text-neutral-400" />
                        {label}
                      </span>
                    ))}
                  </div>

                  {/* Category breakdown */}
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                      Topics covered
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(CATEGORY_COLORS) as Array<keyof typeof CATEGORY_COLORS>).map((cat) => (
                        <span
                          key={cat}
                          className={`px-3 py-1 rounded-full border text-xs font-semibold ${CATEGORY_COLORS[cat]}`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={startQuiz}
                    className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
                  >
                    <FaPlay size={11} />
                    Start Quiz
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── QUIZ ──────────────────────────────────────────────────────── */}
            {phase === 'quiz' && (
              <motion.div
                key={`question-${currentIndex}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                {/* Question card */}
                <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-8">
                  {/* Category + question number */}
                  <div className="flex items-center justify-between mb-5">
                    <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${CATEGORY_COLORS[current.category]}`}>
                      {current.category}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {currentIndex + 1} / {total}
                    </span>
                  </div>

                  {/* Question text */}
                  <h2 className="text-base font-bold text-neutral-900 sm:text-lg leading-snug">
                    {current.question}
                  </h2>

                  {/* Options */}
                  <div className="mt-6 space-y-3">
                    {current.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => selectOption(index)}
                        disabled={revealed}
                        className={[
                          'w-full flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 text-sm font-medium text-left transition-all duration-200',
                          getOptionStyle(index),
                          !revealed && 'cursor-pointer',
                          revealed && 'cursor-default',
                        ].join(' ')}
                      >
                        <span className="flex items-center gap-3">
                          <span className={[
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                            revealed && index === current.correctIndex
                              ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                              : revealed && index === selectedOption
                                ? 'border-red-300 bg-red-100 text-red-600'
                                : 'border-neutral-300 bg-neutral-100 text-neutral-500',
                          ].join(' ')}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option}
                        </span>
                        {getOptionIcon(index)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explanation card — slides in after reveal */}
                <AnimatePresence>
                  {revealed && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={[
                        'rounded-2xl border p-5 sm:p-6',
                        selectedOption === current.correctIndex
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-red-200 bg-red-50',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-3">
                        {selectedOption === current.correctIndex
                          ? <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                          : <FaTimesCircle className="text-red-400 mt-0.5 shrink-0" />
                        }
                        <div>
                          <p className={[
                            'text-sm font-semibold mb-1',
                            selectedOption === current.correctIndex ? 'text-emerald-800' : 'text-red-700',
                          ].join(' ')}>
                            {selectedOption === current.correctIndex ? 'Correct!' : 'Not quite.'}
                          </p>
                          <p className="text-sm text-neutral-600 leading-relaxed">
                            {current.explanation}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Next button */}
                {revealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                  >
                    <button
                      onClick={next}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
                    >
                      {currentIndex + 1 < total ? (
                        <>Next Question <FaChevronRight className="text-xs" /></>
                      ) : (
                        <>See Results <FaTrophy className="text-xs" /></>
                      )}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── RESULT ────────────────────────────────────────────────────── */}
            {phase === 'result' && tier && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                {/* Score card */}
                <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 sm:p-8 text-center">
                  <div className="text-5xl font-bold text-neutral-900 mb-1">
                    {score}<span className="text-2xl text-neutral-400">/{total}</span>
                  </div>
                  <p className={`text-xl font-bold mt-1 ${tier.color}`}>{tier.label}</p>
                  <p className="mt-2 text-sm text-neutral-500">
                    You answered {score} out of {total} questions correctly.
                  </p>

                  {/* Score bar */}
                  <div className="mt-6 w-full h-3 rounded-full bg-neutral-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-neutral-900"
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / total) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-neutral-400">{Math.round((score / total) * 100)}% correct</p>

                  {/* Actions */}
                  <div className="mt-7 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={restart}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
                    >
                      <FaRedo size={11} /> Try Again
                    </button>
                    <Link
                      to="/"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <FaHome size={12} /> Back to Home
                    </Link>
                  </div>
                </div>

                {/* Per-question review */}
                <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100">
                    <h3 className="text-sm font-bold text-neutral-900">Question Review</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">See how you answered each question</p>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {quizQuestions.map((q, i) => {
                      const ans = answers[i];
                      const correct = ans?.correct;
                      return (
                        <div key={q.id} className="px-5 py-4 flex items-start gap-3">
                          <div className={[
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5',
                            correct
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-600',
                          ].join(' ')}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-800 leading-snug">{q.question}</p>
                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                              <span className="text-xs text-neutral-500">
                                <span className="font-medium text-neutral-700">Your answer: </span>
                                {ans ? q.options[ans.selectedIndex] : '—'}
                              </span>
                              {!correct && (
                                <span className="text-xs text-emerald-600 font-medium">
                                  ✓ {q.options[q.correctIndex]}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {correct
                              ? <FaCheckCircle className="text-emerald-500 text-sm" />
                              : <FaTimesCircle className="text-red-400 text-sm" />
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explore more CTA */}
                <div className="rounded-2xl border border-neutral-200 bg-neutral-900 p-6 text-center">
                  <p className="text-sm font-bold text-white mb-1">Want to learn more about Libmanan?</p>
                  <p className="text-xs text-gray-400 mb-4">
                    Explore our tourism spots, history, and government services.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Link
                      to="/tourism"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white text-neutral-900 px-4 py-2.5 text-xs font-semibold hover:bg-neutral-100 transition-colors"
                    >
                      Explore Tourism <FaArrowRight className="text-[10px]" />
                    </Link>
                    <Link
                      to="/government"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 text-white px-4 py-2.5 text-xs font-semibold hover:bg-white/10 transition-colors"
                    >
                      View Government
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

QuizPage.displayName = 'QuizPage';
export default QuizPage;
