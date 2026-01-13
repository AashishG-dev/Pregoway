import { Home, ClipboardCheck, Calendar, FileText, User } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <main className="flex-1">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
        <NavLink href="/dashboard" icon={<Home className="w-6 h-6" />} label="Home" active />
        <NavLink href="/dashboard/checkin" icon={<ClipboardCheck className="w-6 h-6" />} label="Check-In" />
        <NavLink href="/dashboard/timeline" icon={<Calendar className="w-6 h-6" />} label="Timeline" />
        <NavLink href="/dashboard/vault" icon={<FileText className="w-6 h-6" />} label="Docs" />
        <NavLink href="/dashboard/more" icon={<User className="w-6 h-6" />} label="More" />
      </div>
    </div>
  );
}

function NavLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 ${active ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
      {active && <div className="w-1 h-1 bg-brand-600 rounded-full"></div>}
    </Link>
  )
}
