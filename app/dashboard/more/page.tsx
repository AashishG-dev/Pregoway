"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  User,
  Settings,
  PhoneCall,
  HeartHandshake,
  LogOut,
  ChevronRight,
  Shield,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MorePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchBrief() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('name, current_week').eq('id', user.id).single();
      if (data) setProfile(data);
    }
    fetchBrief();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const menuItems = [
    { label: "My Profile", icon: User, href: "/dashboard/profile", color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Care Team", icon: HeartHandshake, href: "/dashboard/care-team", color: "text-pink-600", bg: "bg-pink-100" },
    { label: "My Documents", icon: FileText, href: "/dashboard/vault", color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings", color: "text-gray-600", bg: "bg-gray-100" },
    { label: "Help & Support", icon: PhoneCall, href: "/dashboard/help", color: "text-green-600", bg: "bg-green-100" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header Profile Card */}
      <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Account</h1>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-400 to-pink-400 p-0.5">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <User className="w-8 h-8 text-gray-400" />
              {/* If we had an avatar URL, we'd use <img> here */}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.name || "Loading..."}</h2>
            <p className="text-brand-600 font-medium text-sm">
              {profile?.current_week ? `Week ${profile.current_week} of Pregnancy` : "Timeline Not Set"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 -mt-4">
        {/* Menu List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, idx) => (
            <Link key={idx} href={item.href} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-semibold text-gray-700">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Legal</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Link href="#" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-500" />
                </div>
                <span className="font-semibold text-gray-700">Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="mt-8 w-full bg-red-50 border border-red-100 text-red-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  )
}
