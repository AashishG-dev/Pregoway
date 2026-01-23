"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Calendar, User, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { format, parseISO } from "date-fns";

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        lmp: "",
        phone: ""
    });

    useEffect(() => {
        async function fetchProfile() {
            if (!user) return;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setFormData({
                    name: data.name || "",
                    lmp: data.lmp ? format(parseISO(data.lmp), "yyyy-MM-dd") : "",
                    phone: data.phone || "" // assuming phone field exists, if not we'll see
                });
            }
            setLoading(false);
        }
        fetchProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);

        try {
            // Calculate new week if LMP changed
            let current_week = 0;
            if (formData.lmp) {
                const lmpDate = parseISO(formData.lmp);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                current_week = Math.floor(diffDays / 7);
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    name: formData.name,
                    lmp: formData.lmp,
                    current_week: current_week,
                    // phone: formData.phone // Verify schema first. If phone not in schema, this might error.
                    // Looking at setup_db.js, profiles has: id, name, lmp, current_week, created_at. 
                    // Phone is usually in auth.users but can be in profiles if added.
                    // I will assume for MVP we only strictly support Name/LMP based on known schema.
                    // Or I'll skip phone update to avoid error if column missing.
                })
                .eq('id', user.id);

            if (error) throw error;

            router.back(); // Go back to More page
        } catch (err) {
            console.error(err);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-outfit">
            {/* Header */}
            <div className="bg-white p-6 sticky top-0 z-20 border-b border-gray-100/80 backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
                </div>
            </div>

            <form onSubmit={handleSave} className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-8">
                
                {/* Personal Info Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[4rem] -z-0"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Personal Details</h2>
                        <p className="text-gray-500 text-sm mb-6">How should we address you?</p>

                        <label className="block text-sm font-bold text-gray-700 mb-3">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-900 focus:ring-4 focus:ring-brand-100 focus:border-brand-300 outline-none transition-all placeholder-gray-400"
                                placeholder="e.g. Sarah Smith"
                            />
                        </div>
                    </div>
                </div>

                {/* Pregnancy Details Card */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[4rem] -z-0"></div>

                    <div className="relative z-10">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Pregnancy Timeline</h2>
                        <p className="text-gray-500 text-sm mb-6">This helps us track your baby's growth.</p>

                        <label className="block text-sm font-bold text-gray-700 mb-3">First Day of Last Period</label>
                        <div className="relative group mb-4">
                            <Calendar className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="date"
                                required
                                value={formData.lmp}
                                onChange={e => setFormData({ ...formData, lmp: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-900 focus:ring-4 focus:ring-purple-100 focus:border-purple-300 outline-none transition-all"
                            />
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                            <div className="w-1.5 bg-blue-400 rounded-full shrink-0"></div>
                            <p className="text-sm text-blue-800 leading-relaxed font-medium">
                                Updates to this date will automatically recalculate your <strong>Current Week</strong> and <strong>Timeline events</strong>.
                            </p>
                        </div>
                    </div>
                </div>

            </form>

            <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0 z-30">
                <div className="max-w-2xl mx-auto w-full">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black hover:shadow-xl hover:shadow-gray-200 transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
