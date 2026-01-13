import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const timelineEvents = [
  { week: 8, title: "First Ultrasound", date: "Oct 12, 2025", status: "completed", type: "scan" },
  { week: 12, title: "NT Scan & Blood Tests", date: "Nov 10, 2025", status: "completed", type: "scan" },
  { week: 20, title: "Anomaly Scan", date: "Jan 05, 2026", status: "completed", type: "scan" },
  { week: 24, title: "Routine Check-up", date: "Jan 14, 2026", status: "upcoming", type: "visit" },
  { week: 28, title: "Glucose Tolerance Test", date: "Feb 10, 2026", status: "future", type: "lab" },
  { week: 32, title: "Growth Scan", date: "Mar 10, 2026", status: "future", type: "scan" },
  { week: 36, title: "GBS Swab & Position Check", date: "Apr 05, 2026", status: "future", type: "lab" },
  { week: 40, title: "Estimated Due Date", date: "May 02, 2026", status: "future", type: "birth" },
];

export default function TimelinePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white p-6 pb-4 sticky top-0 z-10 border-b border-gray-100">
         <h1 className="text-2xl font-bold text-gray-900">Your Journey</h1>
         <p className="text-gray-500">Timeline of tests and milestones</p>
      </div>

      <div className="p-6">
        <div className="relative border-l-2 border-dashed border-gray-200 ml-4 space-y-8 my-4">
           {timelineEvents.map((event, idx) => (
             <div key={idx} className="relative pl-8">
                {/* Timeline Node */}
                <div className={cn(
                  "absolute -left-[9px] top-1 w-5 h-5 rounded-full border-4 bg-white",
                  event.status === "completed" ? "border-green-500" :
                  event.status === "upcoming" ? "border-brand-500" : "border-gray-200"
                )}></div>

                {/* Content Card */}
                <div className={cn(
                  "rounded-2xl p-4 border transition-all",
                  event.status === "upcoming" 
                    ? "bg-brand-50 border-brand-200 shadow-sm" 
                    : event.status === "completed"
                    ? "bg-white border-gray-100 opacity-70"
                    : "bg-white border-gray-100 opacity-60"
                )}>
                   <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide",
                        event.status === "upcoming" ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
                      )}>
                        Week {event.week}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{event.date}</span>
                   </div>
                   <h3 className={cn("font-bold text-lg mb-1", event.status === "upcoming" ? "text-brand-900" : "text-gray-900")}>
                     {event.title}
                   </h3>
                   
                   {event.status === "upcoming" && (
                     <div className="mt-3 flex gap-2">
                        <button className="flex-1 bg-brand-600 text-white py-2 rounded-lg text-sm font-semibold shadow-sm">
                           Prepare
                        </button>
                        <button className="flex-1 bg-white text-brand-700 border border-brand-200 py-2 rounded-lg text-sm font-semibold">
                           Reschedule
                        </button>
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
