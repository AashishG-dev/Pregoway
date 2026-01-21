"use client";

import { Phone, ArrowLeft, Mail, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

const CONTACTS = [
    {
        id: 1,
        name: "Dr. Sarah Smith",
        role: "OB-GYN",
        phone: "+1 555-0123",
        email: "dr.smith@clinic.com",
        address: "City Hospital, Room 304"
    },
    {
        id: 2,
        name: "City Hospital Emergency",
        role: "Emergency (24/7)",
        phone: "911", // or local emergency
        email: null,
        address: "Downtown Medical Center"
    },
    {
        id: 3,
        name: "Nurse Jessica",
        role: "Midwife",
        phone: "+1 555-0987",
        email: "jessica@care.com",
        address: null
    }
];

export default function CareTeamPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Your Care Team</h1>
            </div>

            <div className="p-6 space-y-4">
                {CONTACTS.map(contact => (
                    <div key={contact.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{contact.name}</h3>
                                <span className="inline-block px-2 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-md mt-1">
                                    {contact.role}
                                </span>
                            </div>
                            <a
                                href={`tel:${contact.phone}`}
                                className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            >
                                <Phone className="w-5 h-5 text-white" />
                            </a>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {contact.phone}
                            </div>
                            {contact.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    {contact.email}
                                </div>
                            )}
                            {contact.address && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {contact.address}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-medium hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50 transition-all flex items-center justify-center gap-2">
                    + Add New Contact
                </button>
            </div>
        </div>
    );
}
