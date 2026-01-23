"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Bell, Search, Menu } from "lucide-react";
import Link from "next/link";

export function DoctorHeader() {
    const { user, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            {/* Left: Mobile Toggle & Breadcrumbs (Placeholder) */}
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
                    <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-xs text-slate-500 hidden sm:block">Overview of your patients and activities</p>
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-4">

                {/* --- LANGUAGE SWITCHER TARGET --- */}
                {/* GoogleTranslate.tsx will teleport the widget here */}
                <div id="language-switcher-target" className="min-w-[140px] hidden sm:block"></div>

                <button className="p-2.5 rounded-full hover:bg-slate-100 relative text-slate-500 hover:text-slate-700 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-slate-900">{user?.user_metadata.full_name || 'Doctor'}</div>
                        <div className="text-xs text-slate-500">{user?.user_metadata.specialization || 'General'}</div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all group"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-600" />
                    </button>
                </div>
            </div>
        </header>
    );
}
