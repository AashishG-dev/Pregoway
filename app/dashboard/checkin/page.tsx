"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Mic, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { calculateAndLogRisk } from "@/lib/risk_service";

// Mock Questions based on doc
const questions = [
  {
    id: "energy",
    type: "scale",
    text: "How is your energy level today?",
    options: ["😫", "😟", "😐", "🙂", "😄"]
  },
  {
    id: "headache",
    type: "yes_no",
    text: "Are you experiencing headaches?",
    followUp: {
      ifYes: {
        id: "headache_severity",
        type: "scale_10",
        text: "How severe is the headache?"
      }
    }
  },
  {
    id: "kicks",
    type: "numeric",
    text: "How many times did baby kick today?",
    helper: "Count kicks in a 2-hour window"
  },
  {
    id: "symptoms",
    type: "multi",
    text: "Any of these symptoms?",
    options: [
      "Swelling in hands/feet",
      "Vision changes",
      "Severe abdominal pain",
      "Vaginal bleeding",
      "Shortness of breath",
      "None of the above"
    ]
  }
];

export default function CheckInPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();

  // State
  const [questionQueue, setQuestionQueue] = useState<any[]>(questions);
  const [step, setStep] = useState(0); // 0 = Intro, 1 = Q1, etc.
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Derived
  const currentQuestion = step > 0 ? questionQueue[step - 1] : null;
  const progress = step > 0 ? ((step - 1) / questionQueue.length) * 100 : 0;

  const handleAnswer = (val: any) => {
    if (!currentQuestion) return;
    setAnswers({ ...answers, [currentQuestion.id]: val });
  };

  const handleNext = async () => {
    // 1. Check Follow Up Logic
    if (currentQuestion && currentQuestion.followUp) {
      const userAns = answers[currentQuestion.id];
      if (currentQuestion.followUp.ifYes && userAns === true) {
        const nextQ = currentQuestion.followUp.ifYes;
        // Insert next question if not already there
        if (questionQueue[step]?.id !== nextQ.id) {
          const newQueue = [...questionQueue];
          newQueue.splice(step, 0, nextQ);
          setQuestionQueue(newQueue);
          // Note: queue length increases, but step stays same index-wise relative to queue start
        }
      }
    }

    // 2. Advance / Submit
    if (step < questionQueue.length) {
      setStep(step + 1);
    } else {
      await submitData();
    }
  };

  const submitData = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      // 1. Daily Checkin
      const { error: checkinError } = await supabase.from('daily_checkins').insert({
        user_id: authUser.id,
        data: answers,
        date: new Date().toISOString().split('T')[0]
      });
      if (checkinError) throw checkinError;

      // 2. Metrics (Kicks)
      const metricsToSave = [];
      if (answers.kicks) metricsToSave.push({ user_id: authUser.id, type: 'KICKS', value: String(answers.kicks), unit: 'kicks' });

      if (metricsToSave.length > 0) {
        await supabase.from('health_metrics').insert(metricsToSave);
      }

      // 3. Risk Analysis
      await calculateAndLogRisk(authUser.id, answers);

      setStep(step + 1); // Move to success logic (step > queue length)
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (err) {
      console.error(err);
      alert("Something went wrong saving your data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkDailyStatus() {
      if (!authUser) return;
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('user_id', authUser.id)
        .eq('date', today)
        .single();

      if (data) {
        setStep(100); // Already done today
      }
    }
    checkDailyStatus();
  }, [authUser]);

  // RENDER: Intro
  if (step === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white p-6 relative">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-48 h-48 bg-brand-100 rounded-full flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 border-4 border-brand-200 rounded-full animate-ping opacity-20"></div>
            <span className="text-6xl">🧘‍♀️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Check-In</h1>
          <p className="text-gray-500 mb-8 max-w-xs">
            Take 2 minutes to track your health. Maintaining your streak helps our AI predict risks early.
          </p>
          <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full font-bold text-sm mb-8 flex items-center gap-2">
            <span>🔥</span> Your Streak Starts Today!
          </div>
          <button
            onClick={() => setStep(1)}
            className="w-full max-w-sm bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all"
          >
            Let's Begin
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // RENDER: Success
  // Success if step exceeds queue length OR we are in 'completed' state (100)
  if (step > questionQueue.length || step >= 100) {
    return (
      <div className="flex flex-col min-h-screen bg-green-50 p-6 items-center justify-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
          <Check className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done for Today!</h2>
        <p className="text-gray-500 text-center mb-8">Your health data has been updated. Come back tomorrow!</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl shadow-sm border border-gray-200"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  // RENDER: Question
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setStep(step - 1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-900">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-sm font-medium text-gray-500">
          Question {step} of {questionQueue.length}
        </span>
        <div className="w-6"></div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-100 rounded-full mb-12 overflow-hidden">
        <div
          className="h-full bg-brand-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
          {currentQuestion?.text}
        </h2>

        {/* Dynamic Inputs */}
        <div className="space-y-4">
          {currentQuestion?.type === 'scale' && (
            <div className="flex justify-between items-center text-4xl">
              {currentQuestion.options?.map((emoji: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx + 1)}
                  className={cn(
                    "p-4 rounded-2xl transition-all hover:bg-gray-50 scale-100 hover:scale-110",
                    answers[currentQuestion.id] === idx + 1 ? "bg-brand-100 ring-2 ring-brand-500" : ""
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.type === 'yes_no' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(true)}
                className={cn("py-6 rounded-xl border-2 font-bold text-lg", answers[currentQuestion.id] === true ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600")}
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className={cn("py-6 rounded-xl border-2 font-bold text-lg", answers[currentQuestion.id] === false ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600")}
              >
                No
              </button>
            </div>
          )}

          {currentQuestion?.type === 'scale_10' && (
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleAnswer(num)}
                  className={cn(
                    "aspect-square rounded-xl font-bold text-lg border-2 transition-all",
                    answers[currentQuestion.id] === num
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-100 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.type === 'numeric' && (
            <div className="flex flex-col items-center">
              <input
                type="text"
                placeholder="Type here..."
                className="w-48 text-center text-5xl font-bold border-b-2 border-gray-200 focus:border-brand-500 outline-none py-4 bg-transparent"
                onChange={(e) => handleAnswer(e.target.value)}
                value={answers[currentQuestion.id] || ''}
              />
              <p className="text-gray-400 mt-4 text-sm">{currentQuestion.helper}</p>
            </div>
          )}

          {currentQuestion?.type === 'multi' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => {
                    const current = answers[currentQuestion.id] || [];
                    const updated = current.includes(opt)
                      ? current.filter((i: string) => i !== opt)
                      : [...current, opt];
                    handleAnswer(updated);
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 font-medium transition-all flex justify-between items-center",
                    (answers[currentQuestion.id] || []).includes(opt)
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-100 text-gray-600"
                  )}
                >
                  {opt}
                  {(answers[currentQuestion.id] || []).includes(opt) && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-auto">
        <button className="p-4 bg-gray-100 rounded-xl text-gray-600">
          <Mic className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          disabled={answers[currentQuestion?.id] === undefined && currentQuestion?.type !== 'multi'}
          className="flex-1 bg-brand-900 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
        >
          {loading ? "Saving..." : "Next"} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
