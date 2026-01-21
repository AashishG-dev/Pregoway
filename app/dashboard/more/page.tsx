import { User, Settings, PhoneCall, HeartHandshake, LogOut } from "lucide-react";
import Link from "next/link";

export default function MorePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">More</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Link href="/dashboard/profile">
          <MenuItem icon={<User className="w-5 h-5 text-gray-500" />} label="My Profile" />
        </Link>
        <MenuItem icon={<HeartHandshake className="w-5 h-5 text-gray-500" />} label="Care Team" />
        <MenuItem icon={<Settings className="w-5 h-5 text-gray-500" />} label="Settings" />
        <Link href="/help">
          <MenuItem icon={<PhoneCall className="w-5 h-5 text-gray-500" />} label="Help & Support" />
        </Link>
      </div>

      <button className="mt-8 flex items-center justify-center gap-2 text-red-600 font-medium w-full py-4 bg-white rounded-xl border border-red-100">
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  )
}

function MenuItem({ icon, label }: any) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
      {icon}
      <span className="font-medium text-gray-700">{label}</span>
    </div>
  )
}
