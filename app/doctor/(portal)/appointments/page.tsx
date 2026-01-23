"use client";

import { Calendar as CalendarIcon, Clock, MapPin, User, Video, MoreVertical, Phone, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

const APPOINTMENTS = [
    {
        id: 1,
        name: "Anjali Sharma",
        time: "10:00 AM",
        date: "Today",
        fullDate: "Oct 24, 2026",
        type: "Regular Checkup",
        mode: "In-Person",
        status: "upcoming",
        avatarColor: "bg-blue-100 text-blue-600"
    },
    {
        id: 2,
        name: "Priya Singh",
        time: "02:30 PM",
        date: "Today",
        fullDate: "Oct 24, 2026",
        type: "Urgent Consultation",
        mode: "Video Call",
        status: "upcoming",
        avatarColor: "bg-purple-100 text-purple-600"
    },
    {
        id: 3,
        name: "Sneha Gupta",
        time: "11:00 AM",
        date: "Tomorrow",
        fullDate: "Oct 25, 2026",
        type: "Ultrasound Review",
        mode: "In-Person",
        status: "scheduled",
        avatarColor: "bg-emerald-100 text-emerald-600"
    },
    {
        id: 4,
        name: "Kavita Reddy",
        time: "04:15 PM",
        date: "Tomorrow",
        fullDate: "Oct 25, 2026",
        type: "Nutrition Counseling",
        mode: "Video Call",
        status: "scheduled",
        avatarColor: "bg-orange-100 text-orange-600"
    },
];

export default function AppointmentsPage() {
    // Group by date for display
    const todayAppointments = APPOINTMENTS.filter(a => a.date === 'Today');
    const upcomingAppointments = APPOINTMENTS.filter(a => a.date !== 'Today');

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <Link href="/doctor/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
                    <p className="text-slate-500">Manage your schedule and patient interactions.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        Sync Calendar
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
                        + New Appointment
                    </button>
                </div>
            </div>

            {/* Today's Section */}
            <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Today's Schedule
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {todayAppointments.map((apt) => (
                        <AppointmentCard key={apt.id} apt={apt} isToday={true} />
                    ))}
                </div>
            </section>

            {/* Upcoming Section */}
            <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 text-slate-400">
                    Upcoming
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingAppointments.map((apt) => (
                        <AppointmentCard key={apt.id} apt={apt} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function AppointmentCard({ apt, isToday = false }: { apt: any, isToday?: boolean }) {
    const isVideo = apt.mode === 'Video Call';

    return (
        <div className={`group bg-white rounded-2xl border ${isToday ? 'border-emerald-100 shadow-emerald-500/5' : 'border-slate-100'} p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden`}>
            {/* Left Accent Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isVideo ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>

            <div className="flex justify-between items-start mb-4 pl-2">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${apt.avatarColor}`}>
                        {apt.name[0]}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{apt.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{apt.type}</p>
                    </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-600 mb-6 pl-2">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700">{apt.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {isVideo ? <Video className="w-4 h-4 text-purple-500" /> : <MapPin className="w-4 h-4 text-emerald-500" />}
                    <span>{apt.mode}</span>
                </div>
            </div>

            <div className="flex gap-2 pl-2">
                {isVideo ? (
                    <button className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
                        <Video className="w-4 h-4" /> Join Call
                    </button>
                ) : (
                    <button className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                        <FileText className="w-4 h-4" /> View Records
                    </button>
                )}
                <button className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors" title="Contact Patient">
                    <Phone className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
