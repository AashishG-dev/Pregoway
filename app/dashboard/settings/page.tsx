"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Bell, Moon, Lock, Shield, ChevronRight, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";


export default function SettingsPage() {
    const router = useRouter();
    const { signOut } = useAuth();

    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        // Load Notifications Preference
        const notif = localStorage.getItem('notifications') !== 'false';
        setNotifications(notif);
    }, []);



    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    
    // Password Form
    const [passwords, setPasswords] = useState({ new: "", confirm: "" });
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const toggleNotifications = () => {
        const newVal = !notifications;
        setNotifications(newVal);
        localStorage.setItem('notifications', String(newVal));
        // Removed annoying alerts, could add toast here
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/auth/login');
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        if (passwords.new !== passwords.confirm) {
            setPasswordError("Passwords do not match");
            return;
        }
        if (passwords.new.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setLoadingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwords.new });
            if (error) throw error;
            
            setPasswordSuccess(true);
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordSuccess(false);
                setPasswords({ new: "", confirm: "" });
            }, 2000);
            
        } catch (err: any) {
            setPasswordError(err.message || "Failed to update password");
        } finally {
            setLoadingPassword(false);
        }
    };

    return (

        <div className="min-h-screen bg-gray-50 flex flex-col transition-colors">
            <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4 transition-colors">
                <button onClick={() => router.push('/dashboard/more')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="p-6 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-colors">

                    {/* Section: Preferences */}
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preferences</h3>
                    </div>

                    <div className="p-4 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Bell className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">Notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={notifications} onChange={toggleNotifications} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Language Settings - using Global Widget */}
                    <div className="p-4 flex items-center justify-between border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <span className="font-bold text-orange-600 w-5 h-5 flex items-center justify-center text-xs">文</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-900 block">Language</span>
                                <span className="text-xs text-gray-400">Select your preferred language</span>
                            </div>
                        </div>
                        <div id="language-switcher-target"></div>
                    </div>

                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-colors">
                    {/* Section: Security */}
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Privacy & Security</h3>
                    </div>

                    <button 
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="w-full p-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <Lock className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="font-medium text-gray-900">Change Password</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button 
                         onClick={() => setIsPrivacyModalOpen(true)}
                         className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Shield className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-900">Privacy Policy</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <button
                    onClick={handleSignOut}
                    className="w-full bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>

                <div className="text-center text-xs text-gray-400">
                    Version 1.0.0 (Alpha)
                </div>

            </div>


            {/* Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl min-h-[300px] flex flex-col justify-center">
                        {passwordSuccess ? (
                            <div className="text-center animate-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Password Updated!</h3>
                                <p className="text-gray-500 text-sm">Your account is secure.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                                {passwordError && (
                                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 font-medium flex items-center gap-2">
                                        <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                                        {passwordError}
                                    </div>
                                )}
                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <input 
                                            type="password"
                                            required
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all focus:border-brand-500"
                                            value={passwords.new}
                                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                            placeholder="Min. 6 characters"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                        <input 
                                            type="password"
                                            required
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all focus:border-brand-500"
                                            value={passwords.confirm}
                                            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                            placeholder="Re-enter password"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                                        <button type="submit" disabled={loadingPassword} className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-all shadow-lg shadow-brand-200">
                                            {loadingPassword ? "Updating..." : "Update"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Privacy Modal */}
            {isPrivacyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Privacy Policy</h3>
                            <button onClick={() => setIsPrivacyModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><Shield className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="overflow-y-auto pr-2 text-sm text-gray-600 space-y-4 leading-relaxed">
                            <p><strong>1. Data Collection</strong><br/>We collect health data you provide (LMP, symptoms) to generate your timeline. This data is stored securely.</p>
                            <p><strong>2. Usage</strong><br/>Your data is used solely for the purpose of tracking your pregnancy journey. We do not sell your data.</p>
                            <p><strong>3. Security</strong><br/>We use industry-standard encryption for your personal information.</p>
                            <p><strong>4. Your Rights</strong><br/>You can request deletion of your account and data at any time via the Settings menu.</p>
                            <p className="italic text-xs mt-4">Last Updated: Jan 2026</p>
                        </div>
                        <button onClick={() => setIsPrivacyModalOpen(false)} className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-bold">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
