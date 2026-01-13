"use client";

import { useEffect, useState } from "react";
import { 
  Bell, 
  Activity, 
  AlertTriangle, 
  ChevronRight, 
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  /* 
    State for Real Data
  */
  const { user: authUser } = useAuth();
  const [user, setUser] = useState({ name: "Loading...", week: 0, daysToGo: 0 });
  const [risk, setRisk] = useState({ score: 0, level: 'green', label: 'Low Risk', trend: 'stable' });
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!authUser) return;
      
      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser({
          name: profile.name,
          week: profile.current_week,
          daysToGo: 280 - (profile.current_week * 7)
        });
      }

      // 2. Fetch Latest Risk Log
      const { data: riskLog } = await supabase
        .from('risk_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (riskLog) {
        setRisk({
          score: riskLog.score,
          level: riskLog.level,
          label: riskLog.insight || 'Risk Alert',
          trend: 'stable' // simplistic for now
        });
      }

      // 3. Fetch Checkin Streak (count of logs)
      const { count } = await supabase
        .from('daily_checkins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id);
      
      setCheckinStreak(count || 0);

      setLoading(false);
    }

    fetchData();
  }, [authUser]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="bg-white px-6 pt-12 pb-6 rounded-b-3xl shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-500 text-sm mb-1">Good Morning,</p>
            <h1 className="text-2xl font-bold text-gray-900">{user.name} 👋</h1>
          </div>
          <button className="p-2 bg-gray-50 rounded-full relative">
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
        </div>

        {/* Progress Section */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-brand-900 mb-1">Week {user.week}</div>
            <div className="text-sm text-brand-600 font-medium bg-brand-50 px-3 py-1 rounded-full inline-block">
              Truncus Arteriosus stage
            </div>
          </div>
          
           {/* Circular Progress Placeholder */}
           <div className="relative w-24 h-24 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="48" cy="48" r="40" stroke="#f3e8ff" strokeWidth="8" fill="none" />
               <circle cx="48" cy="48" r="40" stroke="#db2777" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="100" strokeLinecap="round" />
             </svg>
             <div className="absolute flex flex-col items-center">
                <span className="text-xs text-gray-400">Days to go</span>
                <span className="text-lg font-bold text-gray-900">{user.daysToGo}</span>
             </div>
           </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Risk Card */}
        {risk.level !== 'green' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertTriangle className="w-32 h-32 text-orange-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 fill-orange-600" />
                <span className="font-bold text-orange-700 uppercase tracking-wide text-xs">Risk Alert</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Pre-eclampsia Risk Detected</h3>
              <p className="text-sm text-gray-600 mb-4 pr-8">
                Your BP trend shows a concerning pattern. Our AI predicts a 68% probability based on your last 3 logs.
              </p>
              
              <div className="flex gap-3">
                 <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md active:scale-95 transition-transform">
                   View Details
                 </button>
                 <button className="bg-white text-orange-700 border border-orange-200 px-4 py-2 rounded-lg text-sm font-semibold">
                   Consult Doctor
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Check-In */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
           <div>
             <div className="flex items-center gap-2 mb-1">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Check-In</span>
             </div>
             <h3 className="font-bold text-gray-900 text-lg">Day {checkinStreak + 1}</h3>
             <p className="text-sm text-gray-500">Keep your streak alive! 🔥 {checkinStreak} Days</p>
           </div>
           <Link href="/dashboard/checkin" className="bg-gray-900 text-white p-3 rounded-full hover:bg-black transition-colors">
              <ChevronRight className="w-6 h-6" />
           </Link>
        </div>

        {/* Health Snapshot Grid */}
        <div>
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-gray-900 text-lg">Health Snapshot</h3>
             <button className="text-brand-600 text-sm font-medium hover:underline">See All</button>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <HealthCard 
                label="Blood Pressure" 
                value="120/80" 
                unit="mmHg" 
                trend="stable" 
                date="Today"
                icon={<Activity className="w-5 h-5 text-blue-500" />}
              />
              <HealthCard 
                label="Weight" 
                value="65" 
                unit="kg" 
                trend="up" 
                date="+2kg"
                icon={<Activity className="w-5 h-5 text-purple-500" />}
              />
              <HealthCard 
                label="Hemoglobin" 
                value="11.2" 
                unit="g/dL" 
                trend="down" 
                isWarning
                date="2 days ago"
                icon={<Activity className="w-5 h-5 text-red-500" />}
              />
              <HealthCard 
                label="Baby Kicks" 
                value="12" 
                unit="kicks" 
                trend="stable" 
                date="Last 2 hrs"
                icon={<Activity className="w-5 h-5 text-green-500" />}
              />
           </div>
        </div>

        {/* Upcoming Appointment */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
           <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm text-center min-w-[60px]">
                 <div className="text-xs text-blue-600 font-bold uppercase">Jan</div>
                 <div className="text-xl font-bold text-gray-900">14</div>
              </div>
              <div className="flex-1">
                 <h4 className="font-bold text-gray-900">Dr. Sharma (OB-GYN)</h4>
                 <p className="text-sm text-blue-700 font-medium mb-1">Routine Check-up • 10:00 AM</p>
                 <p className="text-xs text-gray-500">Apollo Hospital, Indiranagar</p>
              </div>
              <button className="p-2 hover:bg-blue-100 rounded-lg">
                 <MoreHorizontal className="w-5 h-5 text-blue-400" />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}

function HealthCard({ label, value, unit, trend, date, icon, isWarning }: any) {
  return (
    <div className={cn("bg-white p-4 rounded-2xl border shadow-sm", isWarning ? "border-red-200 bg-red-50" : "border-gray-100")}>
       <div className="flex justify-between items-start mb-2">
         <div className="p-1.5 bg-gray-50 rounded-lg">{icon}</div>
         <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", isWarning ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500")}>
            {date}
         </span>
       </div>
       <div className="flex items-baseline gap-1">
         <span className="text-2xl font-bold text-gray-900">{value}</span>
         <span className="text-xs text-gray-500 font-medium">{unit}</span>
       </div>
       <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  )
}
