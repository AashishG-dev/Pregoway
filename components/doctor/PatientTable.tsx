"use client";

import { useState } from "react";
import { Search, Filter, MoreVertical, Eye, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";

// Redefining simpler type for display if needed or import
interface PatientDisplay {
    id: string;
    name: string;
    current_week: number;
    risk_status: string;
    edd: string;
}

export function PatientTable({ patients }: { patients: PatientDisplay[] }) {
    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-b from-white to-slate-50/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                        <UsersIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Recent Patients</h2>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial group">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        />
                    </div>
                    <button className="px-3 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50/50 border-b border-slate-100 uppercase tracking-wider font-bold text-[11px] text-slate-400">
                        <tr>
                            <th className="px-6 py-4 pl-8">Patient Name</th>
                            <th className="px-6 py-4">Pregnancy Progress</th>
                            <th className="px-6 py-4">Est. Due Date</th>
                            <th className="px-6 py-4">Risk Status</th>
                            <th className="px-6 py-4 text-right pr-8">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {patients.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-slate-400 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <UsersIcon className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p>No active patients found.</p>
                                </td>
                            </tr>
                        ) : (
                            patients.map((patient, index) => (
                                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                                    <td className="px-6 py-5 pl-8">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar with Gradient */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${getGradient(index)} shadow-sm`}>
                                                {patient.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-base">{patient.name}</div>
                                                <div className="text-xs text-slate-400 font-medium">#{patient.id.slice(0, 6)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="w-full max-w-[140px]">
                                            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                                                <span>Week {patient.current_week}</span>
                                                <span className="text-slate-400">40</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(patient.current_week)}`}
                                                    style={{ width: `${(patient.current_week / 40) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-medium text-slate-600">
                                        {patient.edd ? new Date(patient.edd).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-5">
                                        <RiskBadge status={patient.risk_status} />
                                    </td>
                                    <td className="px-6 py-5 text-right pr-8">
                                        <Link
                                            href={`/doctor/patients/${patient.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all shadow-sm"
                                        >
                                            View Details <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {patients.length > 5 && (
                <div className="p-4 border-t border-slate-100 text-center bg-slate-50/30">
                    <Link href="/doctor/patients" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">View All Patients</Link>
                </div>
            )}
        </div>
    );
}

function RiskBadge({ status }: { status: string }) {
    const statusMap: Record<string, { color: string, label: string, icon: any }> = {
        low: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Low Risk', icon: Activity },
        moderate: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Moderate', icon: Activity },
        high: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'High Risk', icon: Activity },
        critical: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Critical', icon: Activity },
    };

    const config = statusMap[status?.toLowerCase()] || statusMap.low;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize ${config.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.color.replace('bg-', 'bg-current ')} opacity-50`}></span>
            {config.label}
        </span>
    );
}

// Helpers
function UsersIcon(props: any) {
    return <Users {...props} />
}
import { Users } from "lucide-react";

const getGradient = (i: number) => {
    const gradients = [
        "from-emerald-400 to-cyan-500",
        "from-blue-400 to-indigo-500",
        "from-violet-400 to-fuchsia-500",
        "from-orange-400 to-amber-500",
        "from-pink-400 to-rose-500"
    ];
    return gradients[i % gradients.length];
};

const getProgressColor = (week: number) => {
    if (week < 13) return "from-blue-300 to-blue-500";
    if (week < 27) return "from-emerald-300 to-emerald-500";
    return "from-purple-300 to-purple-500";
};
