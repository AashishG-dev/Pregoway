"use client";

import { useEffect, useState } from "react";
import { PatientTable } from "@/components/doctor/PatientTable";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PatientsPage() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchPatients = async () => {
                const { data } = await supabase
                    .from('doctor_patients')
                    .select(`
                        patient:profiles!inner (
                            id, name, current_week, risk_status, edd
                        )
                    `)
                    .eq('doctor_id', user.id)
                    .eq('status', 'active');

                if (data) {
                    // @ts-ignore
                    setPatients(data.map(d => d.patient));
                }
                setLoading(false);
            };
            fetchPatients();
        }
    }, [user]);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="space-y-6">
            <Link href="/doctor/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Patients</h1>
                    <p className="text-slate-500">Manage and monitor all your active cases.</p>
                </div>
            </div>
            <PatientTable patients={patients} />
        </div>
    );
}
