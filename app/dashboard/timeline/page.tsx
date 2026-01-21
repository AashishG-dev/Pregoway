"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { addWeeks, format, differenceInWeeks, parseISO } from "date-fns";

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
          .order('week', { ascending: true }) // Sort by week to handle duplicates order
          .order('created_at', { ascending: true }); // Keep oldest first

        if (existingEvents && existingEvents.length > 0) {
          // Dedup logic: Keep only the first occurrence per week/title
          const seen = new Set();
          const uniqueEvents = existingEvents.filter(e => {
            const key = `${e.week}-${e.title}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          const formatted = uniqueEvents.map(e => ({
            ...e,
            week: differenceInWeeks(new Date(e.event_date), lmpDate), // Recalc week based on date
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
              week: base.week // Store week explicitly if your schema supports it, but here we derive
            };
          });

          const { data: inserted, error: insertError } = await supabase
            .from('health_timeline')
            .insert(newEvents)
            .select();

          if (insertError) throw insertError;

          // Set state
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

  // Helper to determine UI status
  const processEventsStatus = (rawEvents: TimelineEvent[], currentWk: number): TimelineEvent[] => {
    let firstUpcomingFound = false;

    return rawEvents.map(e => {
      let uiStatus: TimelineEvent['uiStatus'] = 'future';

      // Logic: 
      // 1. If DB says completed, it is completed.
      // 2. If calculated week is past, it is completed (unless specifically pending?)
      //    Actually, let's keep visual 'completed' for past weeks unless explicitly marked differently?
      //    Better: Show PAST as completed (greyed out/checked) to reduce noise, 
      //    BUT if it's the NEXT available thing, we highlight it.

      const isPast = currentWk > e.week;

      // Start basic state
      if (e.status === 'completed') {
        uiStatus = 'completed';
      } else if (isPast) {
        // Past but not marked complete in DB. 
        // We can mark as 'missed' or just leave as future-looking but opacity?
        // Let's treat as 'future' visually so user can still mark it done?
        // Or better: Mark as 'upcoming' if it's the very first one? 
        uiStatus = 'future';
      }

      // HIGHLIGHT LOGIC:
      // The FIRST event that is NOT completed should be "upcoming" (Active/Colorful)
      // regardless of whether it matches the exact current week.
      if (uiStatus !== 'completed' && !firstUpcomingFound) {
        uiStatus = 'upcoming';
        firstUpcomingFound = true;
      }

      return { ...e, uiStatus };
    });
  };

  const handleMarkDone = async (eventId?: string) => {
    if (!user || !eventId) return;

    setEvents(prev => {
      const updated = prev.map(e => e.id === eventId ? { ...e, status: 'completed' } : e);
      // We cast updated to TimelineEvent[] because map return type might be inferred loosely
      return processEventsStatus(updated as TimelineEvent[], currentWeek);
    });

    try {
      await supabase
        .from('health_timeline')
        .update({ status: 'completed' })
        .eq('id', eventId);
    } catch (err) {
      console.error("Error marking done:", err);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white p-6 pb-4 sticky top-0 z-10 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Your Journey</h1>
        <p className="text-gray-500">
          {currentWeek > 0 ? `Currently Week ${currentWeek}` : "Timeline"}
        </p>
      </div>

      <div className="p-6">
        <div className="relative border-l-2 border-dashed border-gray-200 ml-4 space-y-8 my-4">
          {events.map((event, idx) => (
            <div key={idx} className="relative pl-8">
              {/* Timeline Node */}
              <div className={cn(
                "absolute -left-[9px] top-1 w-5 h-5 rounded-full border-4 bg-white transition-colors duration-300",
                event.uiStatus === "completed" ? "border-green-500 bg-green-500" :
                  event.uiStatus === "upcoming" ? "border-brand-500" : "border-gray-200"
              )}>
                {event.uiStatus === 'completed' && <CheckCircle2 className="w-4 h-4 text-white -mt-0.5 -ml-0.5" />}
              </div>

              {/* Content Card */}
              <div className={cn(
                "rounded-2xl p-4 border transition-all duration-300",
                event.uiStatus === "upcoming"
                  ? "bg-brand-50 border-brand-200 shadow-md ring-1 ring-brand-100"
                  : event.uiStatus === "completed"
                    ? "bg-white border-green-100 opacity-80"
                    : "bg-white border-gray-100 opacity-60"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide",
                    event.uiStatus === "upcoming" ? "bg-brand-100 text-brand-700" :
                      event.uiStatus === 'completed' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  )}>
                    Week {event.week}
                  </span>
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" />
                    {event.formattedDate}
                  </span>
                </div>

                <h3 className={cn(
                  "font-bold text-lg mb-1 line-clamp-1",
                  event.uiStatus === "upcoming" ? "text-brand-900" :
                    event.uiStatus === 'completed' ? "text-green-900 line-through decoration-green-300" : "text-gray-900"
                )}>
                  {event.title}
                </h3>

                {event.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>}

                {/* ACTION: Show 'Mark Done' for UPCOMING events primarily */}
                {event.uiStatus === "upcoming" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleMarkDone(event.id)}
                      className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Done
                    </button>
                    <button className="flex-1 bg-white text-brand-700 border border-brand-200 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-50 transition-colors">
                      Reschedule
                    </button>
                  </div>
                )}

                {/* Post-Completion Status */}
                {event.uiStatus === 'completed' && (
                  <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
