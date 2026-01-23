"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, CalendarClock, Stethoscope, FileText, Baby, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { addWeeks, format, differenceInWeeks, parseISO } from "date-fns";
import Link from "next/link";

type TimelineEvent = {
  id?: string;
  week: number;
  title: string;
  type: "scan" | "visit" | "lab" | "birth";
  description?: string;
  status: 'pending' | 'completed' | 'missed';
  event_date?: string;
  uiStatus?: 'future' | 'upcoming' | 'completed';
  formattedDate?: string;
};

const BASE_EVENTS: Omit<TimelineEvent, 'status'>[] = [
  { week: 8, title: "First Ultrasound (Dating Scan)", type: "scan", description: "Confirm due date and check heartbeat." },
  { week: 12, title: "NT Scan & Blood Tests", type: "scan", description: "Screen for chromosomal abnormalities." },
  { week: 16, title: "Early Growth Scan (Optional)", type: "scan", description: "Check baby's growth progress." },
  { week: 20, title: "Anomaly Scan", type: "scan", description: "Detailed check of baby's anatomy." },
  { week: 24, title: "Routine Check-up", type: "visit", description: "Blood pressure and urine test." },
  { week: 28, title: "Glucose Tolerance Test", type: "lab", description: "Screening for gestational diabetes." },
  { week: 32, title: "Growth Scan", type: "scan", description: "Monitor baby's size and position." },
  { week: 36, title: "GBS Swab & Position Check", type: "lab", description: "Test for Group B Strep bacteria." },
  { week: 40, title: "Estimated Due Date", type: "birth", description: "The big day!" },
];

export default function TimelinePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);
  
  // Reschedule Modal State
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDateInput, setNewDateInput] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [undoId, setUndoId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTimeline() {
      if (!user) return;

      try {
        // 1. Get Profile for LMP
        const { data: profile } = await supabase
          .from('profiles')
          .select('lmp')
          .eq('id', user.id)
          .single();

        if (!profile?.lmp) {
          setLoading(false);
          return;
        }

        const lmpDate = parseISO(profile.lmp);
        const calculatedWeek = differenceInWeeks(new Date(), lmpDate);
        setCurrentWeek(calculatedWeek);

        // 2. Check if timeline exists in DB
        const { data: existingEvents } = await supabase
          .from('health_timeline')
          .select('*')
          .eq('user_id', user.id)
          .order('week', { ascending: true })
          .order('created_at', { ascending: true });

        if (existingEvents && existingEvents.length > 0) {
          // Dedup logic
          const seen = new Set();
          const uniqueEvents = existingEvents.filter(e => {
            const key = `${e.week}-${e.title}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          const formatted = uniqueEvents.map(e => ({
            ...e,
            week: differenceInWeeks(new Date(e.event_date), lmpDate),
            formattedDate: format(new Date(e.event_date), "MMM d, yyyy"),
          }));
          setEvents(processEventsStatus(formatted, calculatedWeek));
        } else {
          // 3. Generate and Insert Defaults
          const newEvents = BASE_EVENTS.map(base => {
            const date = addWeeks(lmpDate, base.week);
            return {
              user_id: user.id,
              title: base.title,
              event_date: date.toISOString(),
              event_type: base.type,
              description: base.description,
              status: 'pending',
              week: base.week
            };
          });

          const { data: inserted, error: insertError } = await supabase
            .from('health_timeline')
            .insert(newEvents)
            .select();

          if (insertError) throw insertError;

          const formatted = (inserted || []).map(e => ({
            ...e,
            week: differenceInWeeks(new Date(e.event_date), lmpDate),
            formattedDate: format(new Date(e.event_date), "MMM d, yyyy")
          }));
          setEvents(processEventsStatus(formatted, calculatedWeek));
        }
      } catch (error: any) {
        console.error("Error loading timeline:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTimeline();
  }, [user]);

  const processEventsStatus = (rawEvents: TimelineEvent[], currentWk: number): TimelineEvent[] => {
    return rawEvents.map(e => {
      let uiStatus: TimelineEvent['uiStatus'] = 'future';
      const isCompleted = e.status === 'completed';
      const isAvailable = currentWk >= e.week;

      if (isCompleted) {
        uiStatus = 'completed';
      } else if (isAvailable) {
        uiStatus = 'upcoming';
      } else {
        uiStatus = 'future';
      }
      return { ...e, uiStatus };
    });
  };

  const updateStatus = async (eventId: string, newStatus: 'completed' | 'pending') => {
    if (!user || !eventId) return;

    setEvents(prev => {
      // Create new fresh state
      const updatedList = prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e);
      // Re-process UI status instantly
      return processEventsStatus(updatedList as TimelineEvent[], currentWeek);
    });

    try {
      await supabase
        .from('health_timeline')
        .update({ status: newStatus })
        .eq('id', eventId);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleMarkDone = (id?: string) => id && updateStatus(id, 'completed');
  const handleUndoClick = (id?: string) => {
    if (!id) return;
    setUndoId(id);
  };

  const confirmUndo = () => {
    if (!undoId) return;
    updateStatus(undoId, 'pending');
    setUndoId(null);
  };

  const handleRescheduleClick = (id?: string) => {
    if (!id) return;
    setRescheduleId(id);
    setNewDateInput(format(new Date(), "yyyy-MM-dd")); // Default to today
    setIsRescheduling(true);
  };

  const confirmReschedule = async () => {
    if (!rescheduleId || !newDateInput) return;

    // Updates
    setEvents(prev => prev.map(e => e.id === rescheduleId ? { ...e, event_date: new Date(newDateInput).toISOString(), formattedDate: format(new Date(newDateInput), "MMM d, yyyy") } : e));

    try {
      const { error } = await supabase
        .from('health_timeline')
        .update({ event_date: new Date(newDateInput).toISOString() })
        .eq('id', rescheduleId);

        if (error) throw error;
    } catch (err) {
      console.error("Reschedule failed:", err);
      alert("Failed to save reschedule");
    } finally {
      setIsRescheduling(false);
      setRescheduleId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scan': return <Baby className="w-5 h-5 text-purple-600" />;
      case 'lab': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'birth': return <Baby className="w-6 h-6 text-pink-600" />;
      default: return <Stethoscope className="w-5 h-5 text-emerald-600" />;
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scan': return "bg-purple-100";
      case 'lab': return "bg-blue-100";
      case 'birth': return "bg-pink-100";
      default: return "bg-emerald-100";
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <div className="bg-white p-6 sticky top-0 z-20 border-b border-gray-100/80 backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Your Journey</h1>
        </div>
        <p className="text-gray-500 text-sm pl-10">
          {currentWeek > 0 ? `You are currently in Week ${currentWeek}` : "Track your medical roadmap here"}
        </p>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full">
        <div className="relative border-l-2 border-brand-200 ml-4 space-y-10 my-4 pb-12">
          {events.map((event, idx) => (
            <div key={idx} className="relative pl-10 group">
              {/* Timeline Connector */}

              {/* Timeline Node Icon */}
              <div className={cn(
                "absolute -left-[21px] top-0 w-11 h-11 rounded-full border-4 flex items-center justify-center transition-all duration-500 z-10",
                event.uiStatus === "completed" ? "border-green-100 bg-green-500 scale-90" :
                  event.uiStatus === "upcoming" ? "border-white bg-white shadow-lg shadow-brand-200 ring-2 ring-brand-500 scale-110" : "border-gray-50 bg-gray-100"
              )}>
                {event.uiStatus === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span className={cn("text-[10px] font-bold", event.uiStatus === 'upcoming' ? "text-brand-700" : "text-gray-400")}>W{event.week}</span>
                )}
              </div>

              {/* Content Card */}
              <div className={cn(
                "rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden",
                event.uiStatus === "upcoming"
                  ? "bg-white border-brand-100 shadow-xl shadow-brand-100/50 translate-x-2"
                  : event.uiStatus === "completed"
                    ? "bg-gray-50/50 border-gray-100 opacity-70 grayscale-[0.5] hover:grayscale-0 hover:opacity-100"
                    : "bg-white border-gray-100 opacity-60 hover:opacity-100"
              )}>
                {/* Event Type Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider", getTypeColor(event.type))}>
                    {getTypeIcon(event.type)}
                    <span className="opacity-80">{event.type}</span>
                  </div>
                  <span className="text-xs text-brand-600 font-medium flex items-center gap-1 bg-brand-50 px-2 py-1 rounded-lg">
                    <CalendarClock className="w-3.5 h-3.5" />
                    {event.formattedDate}
                  </span>
                </div>

                <h3 className={cn(
                  "font-bold text-xl mb-2",
                  event.uiStatus === "upcoming" ? "text-gray-900" :
                    event.uiStatus === 'completed' ? "text-gray-600" : "text-gray-400"
                )}>
                  {event.title}
                </h3>

                {event.description && <p className="text-sm text-gray-500 mb-6 leading-relaxed">{event.description}</p>}

                {/* ACTION: Show 'Mark Done' for UPCOMING events primarily */}
                {event.uiStatus === "upcoming" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleMarkDone(event.id)}
                      className="flex-1 bg-gradient-to-r from-brand-600 to-brand-700 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand-200/50 hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Complete
                    </button>

                    <button 
                      onClick={() => handleRescheduleClick(event.id)}
                      className="px-4 py-3 bg-white text-gray-500 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Reschedule
                    </button>
                  </div>
                )}

                {/* Future/Locked Status */}
                {event.uiStatus === 'future' && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium bg-gray-50 px-3 py-2 rounded-lg inline-block">
                    🔒 Unlocks in Week {event.week}
                  </div>
                )}

                {/* Post-Completion Status */}
                {event.uiStatus === 'completed' && (
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                    <div className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> COMPLETED
                    </div>
                    <button
                      onClick={() => handleUndoClick(event.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                    >
                      Undo Action
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reschedule Modal Overlay */}
      {isRescheduling && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reschedule Visit</h3>
            <p className="text-gray-500 text-sm mb-6">Select a new date for this appointment.</p>
            
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">New Date</label>
            <input 
              type="date" 
              value={newDateInput}
              onChange={(e) => setNewDateInput(e.target.value)}
              className="w-full p-4 bg-gray-50 border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all mb-6"
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsRescheduling(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReschedule}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Undo Confirmation Modal */}
      {undoId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Undo Completion?</h3>
            <p className="text-gray-500 text-sm mb-6">This will mark the event as pending again.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setUndoId(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmUndo}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gray-900 hover:bg-black shadow-lg transition-all active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
