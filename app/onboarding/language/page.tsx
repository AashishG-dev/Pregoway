import Link from "next/link";
import { Mic, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

export default function LanguagePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-6 pt-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Language
        </h1>
        <p className="text-gray-500 mb-8">
          अपनी भाषा चुनें
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {languages.map((lang) => (
            <Link 
              key={lang.code}
              href="/auth?lang=en" // For prototype, just go to auth
              className={cn(
                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all cursor-pointer",
                lang.code === 'en' 
                  ? "border-brand-500 bg-brand-50 text-brand-700" 
                  : "border-gray-100 hover:border-brand-200 hover:bg-gray-50 text-gray-700"
              )}
            >
              <span className="text-xl font-bold mb-1">{lang.native}</span>
              <span className="text-xs opacity-70">{lang.name}</span>
            </Link>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-100 text-gray-600 font-medium mb-4">
          <Mic className="w-5 h-5" />
          <span>Speak to select</span>
        </button>
      </div>
    </div>
  );
}
