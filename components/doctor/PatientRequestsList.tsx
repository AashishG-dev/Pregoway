"use client";

import { Check, X, Clock, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/context/ToastContext";
import { useState } from "react";

export function PatientRequestsList({ requests, onUpdate }: { requests: any[], onUpdate: () => void }) {
    const { toast } = useToast();
    const [processing, setProcessing] = useState<string | null>(null);

    const handleAction = async (requestId: string, status: 'active' | 'rejected') => {
        setProcessing(requestId);
        try {
            const { error } = await supabase
                .from('doctor_patients')
                .update({ status })
                .eq('id', requestId);

            if (error) throw error;

            toast(status === 'active' ? "Request accepted!" : "Request declined", "success");
            onUpdate(); // Refresh parent
        } catch (error: any) {
            toast(error.message, "error");
        } finally {
            setProcessing(null);
        }
    };

    if (requests.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100 shadow-sm mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                    <User className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">New Patient Requests</h3>
                    <p className="text-sm text-slate-500">Patients requesting to join your care.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {requests.map((req) => (
                    <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                {req.patient.name[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">{req.patient.name}</h4>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    <span>Waiting for approval</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleAction(req.id, 'rejected')}
                                disabled={processing === req.id}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Decline"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleAction(req.id, 'active')}
                                disabled={processing === req.id}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                {processing === req.id ? '...' : <><Check className="w-4 h-4" /> Accept</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
