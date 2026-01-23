import { DoctorSidebar } from "@/components/doctor/DoctorSidebar";
import { DoctorHeader } from "@/components/doctor/DoctorHeader";

export default function DoctorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar (Fixed Desktop) */}
            <DoctorSidebar />

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Header (Sticky) */}
                <DoctorHeader />

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
