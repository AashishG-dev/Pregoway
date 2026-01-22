"use client";

import { useEffect, useState } from "react";
import { Stethoscope, MapPin, Star, ArrowRight, CheckCircle, MessageSquare, Building2, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function CareTeamPage() {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [myDoctor, setMyDoctor] = useState<any>(null);
    const [requestStatus, setRequestStatus] = useState<string | null>(null); // 'pending', 'active'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            checkMyDoctor();
            fetchDoctors();
        }
    }, [user]);

    const checkMyDoctor = async () => {
        const { data } = await supabase
            .from('doctor_patients')
            .select('status, doctor:doctors(*)')
            .eq('patient_id', user!.id)
            .single();
        
        if (data) {
            setMyDoctor(data.doctor);
            setRequestStatus(data.status);
        }
    };

    const fetchDoctors = async () => {
        const { data } = await supabase.from('doctors').select('*').eq('is_verified', true); // Only Verified
        setDoctors(data || []);
        setLoading(false);
    };

    const handleConnect = async (doctorId: string) => {
        // Optimistic Update
        setRequestStatus('pending');
        await supabase.from('doctor_patients').insert({
            doctor_id: doctorId,
            patient_id: user!.id,
            status: 'pending'
        });
        checkMyDoctor(); // Refresh
    };

    if (loading) return <div className="p-8 text-center">Loading Specialists...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Your Care Team</h1>
                <p className="text-gray-500">Connect with certified specialists for a guided pregnancy journey.</p>
            </header>

            {/* Current Doctor Status */}
            {myDoctor && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-12">
                    <h2 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">Your Assigned Specialist</h2>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-2xl">
                            {myDoctor.full_name[0]}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-xl font-bold text-gray-900">{myDoctor.full_name}</h3>
                            <p className="text-gray-600">{myDoctor.specialization} • {myDoctor.hospital_name}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm">
                                {requestStatus === 'active' ? (
                                    <span className="flex items-center gap-1 text-emerald-600 font-medium px-3 py-1 bg-emerald-50 rounded-full">
                                        <CheckCircle className="w-4 h-4" /> Connected
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-orange-600 font-medium px-3 py-1 bg-orange-50 rounded-full">
                                        <Clock className="w-4 h-4" /> Request Pending
                                    </span>
                                )}
                            </div>
                        </div>
                        {requestStatus === 'active' && (
                             <Link href="/dashboard/care-team/chat" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Chat Now
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Available Doctors List */}
            {!myDoctor && (
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900">Available Specialists near you</h2>
                    <div className="grid gap-4">
                        {doctors.map((doc) => (
                            <div key={doc.id} className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                        <Stethoscope className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{doc.full_name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-600 font-medium text-xs">{doc.specialization}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {doc.hospital_name}</span>
                                        </div>
                                         <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.9 Rating</span>
                                            <span>{doc.experience_years} Years Exp.</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleConnect(doc.id)}
                                    className="w-full sm:w-auto px-6 py-3 bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    Connect <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                         {doctors.length === 0 && (
                            <div className="p-12 text-center bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                                <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-gray-500 font-medium">No Verified Doctors Found</h3>
                                <p className="text-sm text-gray-400">Doctors verified by the platform will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


