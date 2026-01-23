"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Bell, Search, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function DoctorHeader() {
    const { user, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
                {/* Left: Mobile Toggle & Breadcrumbs */}
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        className="md:hidden p-2 hover:bg-slate-100 rounded-lg active:scale-95 transition-transform"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">Dashboard</h1>
                        <p className="text-[10px] md:text-xs text-slate-500 hidden sm:block">Overview of your patients and activities</p>
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-2 md:gap-4">

                    {/* Language Switcher Target - Hidden on very small screens */}
                    <div id="language-switcher-target" className="min-w-[120px] hidden lg:block"></div>

                    <button className="p-2 rounded-full hover:bg-slate-100 relative text-slate-500 hover:text-slate-700 transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-slate-900">{user?.user_metadata.full_name || 'Doctor'}</div>
                            <div className="text-xs text-slate-500">{user?.user_metadata.specialization || 'General'}</div>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all group"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-hover:text-red-600" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <span className="font-bold text-lg text-slate-900">Pregoway<span className="text-emerald-500 text-xs">MD</span></span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <LogOut className="w-5 h-5 text-slate-400 rotate-180" /> {/* Using logout icon rotated as close for now or X */}
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                            {[
                                { label: "Dashboard", href: "/doctor/dashboard" },
                                { label: "My Patients", href: "/doctor/patients" },
                                { label: "Appointments", href: "/doctor/appointments" },
                                { label: "Messages", href: "/doctor/messages" },
                                { label: "Settings", href: "/doctor/settings" },
                            ].map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "text-slate-500 hover:bg-slate-50"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>
                        <div className="p-4 border-t border-slate-100">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                    {user?.user_metadata.full_name?.[0]}
                                    0</div>
                                <div>
                                    <div className="font-bold text-sm text-slate-900">{user?.user_metadata.full_name}</div>
                                    <div className="text-xs text-slate-500">{user?.email}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
