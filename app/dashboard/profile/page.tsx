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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 flex-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 is-required">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="Jane Doe"
                            />
                        </div>
                    </div>

                    {/* LMP */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Milk Period (LMP)</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                required
                                value={formData.lmp}
                                onChange={e => setFormData({ ...formData, lmp: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <p className="text-xs text-brand-600 mt-2 bg-brand-50 p-2 rounded-lg inline-block">
                            Changing this will recalculate your Timeline & Week.
                        </p>
                    </div>

                </div>
            </form>

            <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all active:scale-95 disabled:bg-gray-300 disabled:scale-100 flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>
        </div>
    );
}
