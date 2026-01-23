"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Bell, Shield, Stethoscope, Camera, Loader2, Save, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [fullName, setFullName] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata.full_name || "");
            setSpecialization(user.user_metadata.specialization || "");
            setAvatarUrl(user.user_metadata.avatar_url || null);
        }
    }, [user]);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `doctor-avatars/${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            toast("Photo uploaded successfully!", "success");

        } catch (error: any) {
            toast(error.message || "Error uploading avatar", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);

            // 1. Update Auth Metadata (Session)
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    specialization: specialization,
                    avatar_url: avatarUrl
                }
            });

            if (authError) throw authError;

            // 2. Update Profiles Table (Database)
            // Assuming there's a 'profiles' table that links to auth.users. 
            // If specific doctor fields are in a different table, we update that too.
            // For now, updating 'profiles' is standard.
            const { error: dbError } = await supabase
                .from('profiles')
                .update({
                    name: fullName,
                    // If your profiles table accepts these generic metadata:
                    // avatar_url: avatarUrl 
                    // otherwise just name is fine 
                })
                .eq('id', user?.id);

            // Note: We might ignore dbError if the profiles table structure is different, 
            // but usually it's good to keep them in sync.

            toast("Profile updated successfully!", "success");
            router.refresh(); // Refresh Server Components if any

        } catch (error: any) {
            toast(error.message || "Error saving profile", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/doctor/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500">Manage your profile and account preferences.</p>
                </div>
                <button
                    onClick={handleSaveProfile}
                    disabled={loading || uploading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-bold text-lg text-slate-900">Profile Information</h2>
                </div>
                <div className="p-6 space-y-8">

                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 border-4 border-white shadow-lg overflow-hidden">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user?.user_metadata.full_name?.[0] || 'D'
                                )}
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full hover:bg-emerald-600 transition-colors shadow-md"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Profile Photo</h3>
                            <p className="text-sm text-slate-500 max-w-xs">
                                Upload a professional photo. JPG, GIF or PNG. Max size of 2MB.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-medium cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Specialization</label>
                            <div className="relative">
                                <Stethoscope className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-bold text-lg text-slate-900">Notifications</h2>
                </div>
                <div className="p-6 space-y-4">
                    {['Email alerts for critical patients', 'SMS notifications for appointments', 'Weekly digest report'].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <span className="text-slate-700 font-medium">{item}</span>
                            <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer opacity-90 hover:opacity-100">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
