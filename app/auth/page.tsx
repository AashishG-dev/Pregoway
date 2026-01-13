"use client";

import { useState } from "react";
import { ArrowRight, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setLoading(true);
    try {
       await signIn(email);
       router.push("/onboarding/profile");
    } catch (err) {
       alert("Something went wrong");
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 pt-12">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
             Access Pregoway
          </h1>
          <p className="text-gray-500">
            For demonstration purposes, just enter an email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter any email address"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 outline-none transition-colors"
                required
              />
            </div>

          <button
            type="submit"
            disabled={!email || loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-brand-700 text-white rounded-xl shadow-lg transition-all font-semibold text-lg"
          >
            {loading ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
               <>
                 <span>Enter App</span>
                 <ArrowRight className="w-5 h-5" />
               </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
                setEmail('demo@pregoway.com');
            }}
            className="w-full py-2 text-sm text-brand-600 font-medium hover:bg-brand-50 rounded-lg transition-colors"
          >
            Use Demo Account
          </button>
        </form>
      </div>
    </div>
  );
}
