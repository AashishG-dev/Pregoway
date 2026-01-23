"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Calendar,
    MessageSquare,
    Settings,
    Activity,
    Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
    { label: "My Patients", href: "/doctor/patients", icon: Users },
    { label: "Appointments", href: "/doctor/appointments", icon: Calendar },
    { label: "Messages", href: "/doctor/messages", icon: MessageSquare },
    { label: "Settings", href: "/doctor/settings", icon: Settings },
];

export function DoctorSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-40 hidden md:flex">
            {/* Logo Area */}
            <div className="p-6 border-b border-slate-800">
                <Link href="/doctor/dashboard" className="flex items-center gap-2 font-bold text-xl hover:text-emerald-400 transition-colors">
                    <Stethoscope className="text-emerald-500" />
                    <span>Pregoway<span className="text-emerald-500 text-xs align-top">MD</span></span>
                </Link>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                isActive
                                    ? "bg-emerald-600/10 text-emerald-400 border border-emerald-600/20"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-100")} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / Profile Snippet */}
            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold overflow-hidden border border-emerald-500/30 shrink-0">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{user?.user_metadata?.full_name?.[0] || 'Dr'}</span>
                        )}
                    </div>
                    <div className="overflow-hidden min-w-0">
                        <div className="text-xs font-medium text-slate-400">Logged in as</div>
                        <div className="text-sm font-bold truncate text-white" title={user?.user_metadata?.full_name}>
                            {user?.user_metadata?.full_name || 'Medical Partner'}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
