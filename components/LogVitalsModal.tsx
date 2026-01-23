"use client";

import { useState } from "react";
import { X, Loader2, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/context/ToastContext";

export default function LogVitalsModal({ isOpen, onClose, userId, onSuccess }: { isOpen: boolean, onClose: () => void, userId: string, onSuccess: () => void }) {
    const [type, setType] = useState('WEIGHT');
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value || !userId) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('health_metrics').insert({
                user_id: userId,
                type: type,
                value: value,
                unit: type === 'WEIGHT' ? 'kg' : 'mmHg'
            });

            if (error) throw error;

            onSuccess();
            onClose();
            setValue('');
            toast("Health data saved successfully!", "success");
        } catch (err) {
            console.error(err);
            toast("Failed to save. Try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <div className="bg-brand-100 p-1.5 rounded-lg">
                            <Activity className="w-4 h-4 text-brand-600" />
                        </div>
                        Log Health Data
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Metric Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('WEIGHT')}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all ${type === 'WEIGHT' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
                            >
                                Weight (kg)
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('BP')}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all ${type === 'BP' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
                            >
                                Blood Pressure
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Value {type === 'BP' ? '(Sys/Dia)' : '(kg)'}
                        </label>
                        <input
                            required
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={type === 'BP' ? "120/80" : "65.5"}
                            className="w-full text-2xl font-bold p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                        {type === 'BP' && <p className="text-xs text-gray-400 mt-1">Format: 120/80</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-900 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-black transition-all active:scale-95 disabled:bg-gray-300 disabled:scale-100"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Save"}
                    </button>
                </form>
            </div>
        </div>
    );
}
