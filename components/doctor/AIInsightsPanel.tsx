"use client";

import { Sparkles, TrendingUp, AlertCircle, ArrowUpRight } from "lucide-react";

export function AIInsightsPanel() {
    return (
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">AI Cohort Analysis</h2>
                        <p className="text-indigo-200 text-sm">Real-time insights based on current patient vitals.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {/* Insight 1 */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">+12%</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">Hemoglobin Improved</h3>
                        <p className="text-sm text-slate-300">
                            15 patients showed improvement in Hb levels this week after nutritional intervention.
                        </p>
                    </div>

                    {/* Insight 2 */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Alert</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">Hypertension Risk</h3>
                        <p className="text-sm text-slate-300">
                            3 patients in 3rd trimester showing slightly elevated BP trends (Week 32-34).
                        </p>
                        <button className="mt-3 text-xs font-bold text-amber-300 flex items-center gap-1 hover:underline">
                            View Patients <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Insight 3 */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Stable</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">Fetal Growth</h3>
                        <p className="text-sm text-slate-300">
                            92% of tracked fetuses are meeting standard growth milestones for their gestational age.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Icon helper
function Activity({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
