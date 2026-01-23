"use client";

import { useEffect, useState } from "react";
import { Users, AlertTriangle, MessageSquare, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// New Components
import { AnalyticsCharts } from "@/components/doctor/AnalyticsCharts";
import { AIInsightsPanel } from "@/components/doctor/AIInsightsPanel";
import { PatientTable } from "@/components/doctor/PatientTable";

export interface Patient {
    id: string;
    name: string;
    current_week: number;
    risk_status: string;
    edd: string;
}

export default function DoctorDashboard() {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        activePatients: 0,
        pendingRequests: 0,
        criticalAlerts: 0,
        todaysAppointments: 2
    });
    const [patients, setPatients] = useState<Patient[]>([]);

    // We can keep requests loading for the widget if needed, 
    // but for now let's focus on the main dashboard elements requested.
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && (!user || role !== 'doctor')) {
            router.push("/doctor/auth/login");
            return;
        }
        if (user) {
            fetchDashboardData();
        }
    }, [user, role, loading, router]);

    const fetchDashboardData = async () => {
        const { data: relations } = await supabase
            .from('doctor_patients')
            .select(`
                id,
                status,
                patient:profiles!inner (
                    id, name, current_week, risk_status, edd
                )
            `)
            .eq('doctor_id', user!.id);

        if (relations) {
            const active = relations.filter(r => r.status === 'active');
            const pending = relations.filter(r => r.status === 'pending');

            // @ts-ignore
            const critical = active.filter(r => r.patient.risk_status === 'high' || r.patient.risk_status === 'critical').length;

            setStats(prev => ({
                ...prev,
                activePatients: active.length,
                pendingRequests: pending.length,
                criticalAlerts: critical
            }));

            // @ts-ignore
            setPatients(active.map(r => r.patient));
            // @ts-ignore
            setRequests(pending);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* 1. Top Section: AI Insights (Hero-like) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <AIInsightsPanel />
                </div>
                <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <StatCard
                        label="Critical Alerts"
                        value={stats.criticalAlerts}
                        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
                        color="border-red-200 bg-red-50 text-red-700"
                    />
                    <StatCard
                        label="Pending Requests"
                        value={stats.pendingRequests}
                        icon={<Users className="w-5 h-5 text-indigo-500" />}
                        color="border-indigo-200 bg-indigo-50 text-indigo-700"
                    />
                </div>
            </div>

            {/* 2. Middle Section: Analytics Charts */}
            <AnalyticsCharts />

            {/* 3. Bottom Section: Patient Table */}
            <PatientTable patients={patients} />

        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
    return (
        <div className={`p-4 rounded-2xl border flex flex-col justify-center h-full shadow-sm hover:shadow-md transition-shadow bg-white ${color.replace('text-', 'border-').replace('bg-', 'hover:bg-opacity-50 ')}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="bg-white p-2 rounded-lg shadow-sm">{icon}</div>
                <span className="text-2xl font-bold text-slate-800">{value}</span>
            </div>
            <span className="text-sm font-medium opacity-80 text-slate-600">{label}</span>
        </div>
    )
}
