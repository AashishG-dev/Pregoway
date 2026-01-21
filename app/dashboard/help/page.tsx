"use client";

import { useState } from "react";
import { ArrowLeft, Phone, BadgeAlert, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

const FAQS = [
    { q: "How do I log my weight?", a: "Go to the Dashboard > Vitals Card or use the + button to add a new weight log." },
    { q: "Can I export my data?", a: "Currently, you can view all data in the Vault. Export feature is coming soon!" },
    { q: "Is my data secure?", a: "Yes, all your data is encrypted and stored securely using industry standard protocols." },
];

export default function HelpPage() {
    const router = useRouter();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Help & Support</h1>
            </div>

            <div className="p-6 space-y-6">
                {/* Emergency Card */}
                <div className="bg-red-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <BadgeAlert className="w-8 h-8" />
                            Emergency?
                        </h2>
                        <p className="opacity-90 mb-6">If you need immediate medical attention, do not wait.</p>
                        <a href="tel:102" className="block w-full bg-white text-red-600 font-bold text-center py-3 rounded-xl hover:bg-red-50 transition-colors">
                            Call Ambulance (102)
                        </a>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 text-lg">Frequently Asked Questions</h3>
                    {FAQS.map((faq, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
                            >
                                <span className="font-medium text-gray-800">{faq.q}</span>
                                {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </button>
                            {openFaq === i && (
                                <div className="p-4 pt-0 text-sm text-gray-600 bg-gray-50 border-t border-gray-100">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="bg-brand-50 rounded-2xl p-6 text-center border border-brand-100">
                    <HelpCircle className="w-10 h-10 text-brand-500 mx-auto mb-3" />
                    <h3 className="font-bold text-brand-900 mb-1">Still need help?</h3>
                    <p className="text-sm text-brand-700 mb-4">Our support team is available 24/7.</p>
                    <button className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors w-full">
                        Contact Support
                    </button>
                </div>

            </div>
        </div>
    );
}
