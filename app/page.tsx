"use client";

import Link from "next/link";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Activity, 
  Globe, 
  Map, 
  ShieldCheck, 
  Twitter, 
  Facebook, 
  Instagram, 
  Mail, 
  Phone,
  ArrowRight,
  Heart
} from "lucide-react";
import { Hero } from "@/components/ui/Hero";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

function LandingContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      router.push(`/auth/login?${searchParams.toString()}`);
      return;
    }
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, searchParams, router]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900 bg-white overflow-x-hidden">
      
      {/* Hero Section */}
      <Hero />

      {/* --- MISSION SECTION --- */}
      <ScrollReveal width="100%" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-brand-600 uppercase tracking-widest">The Reality</h2>
              <h3 className="text-4xl font-bold text-gray-900 leading-tight">
                Healthcare isn&apos;t just a service.<br />It&apos;s a lifeline.
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                In many rural and even urban areas, the lack of a proper roadmap and resource unavailability leads to tragic outcomes.
                It&apos;s not just about biology; it&apos;s about <strong>management</strong>.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                When a mother suffers due to lack of guidance, it affects two lives.
                We built Pregoway to be that missing link—a digital companion that ensures no mother walks this path alone.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-4 bg-risk-red/10 rounded-2xl border border-risk-red/20">
                  <div className="text-3xl font-bold text-risk-red mb-1">45%</div>
                  <div className="text-sm text-gray-600">High-risk pregnancies go undetected in rural areas.</div>
                </div>
                <div className="p-4 bg-brand-100 rounded-2xl border border-brand-200">
                  <div className="text-3xl font-bold text-brand-700 mb-1">100%</div>
                  <div className="text-sm text-gray-600">Dedication to changing this statistic.</div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 group">
              <img
                src="/images/rural.png"
                alt="Rural connection"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                <p className="text-white font-medium">&quot;Technology bridges the distance between a village and a hospital.&quot;</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* --- FEATURES / SOLUTION (Bento Grid) --- */}
      <section className="py-24 bg-gray-50 relative">
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#4d5d53_1px,transparent_1px)] [background-size:16px_16px]"></div>
         
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <ScrollReveal animation="fade">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">A Complete Ecosystem of Care</h2>
              <p className="text-gray-600">We don&apos;t just track dates. We manage health, predict risks, and connect hearts.</p>
            </div>
          </ScrollReveal>

          <BentoGrid>
            <BentoGridItem
              title="The Proper Roadmap"
              description="Confusion is dangerous. We provide a week-by-week, step-by-step medical and nutritional roadmap tailored to your specific needs."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-brand-100 to-brand-50" />}
              icon={<Map className="h-6 w-6 text-brand-600" />}
              className="md:col-span-1"
            />
            <BentoGridItem
              title="AI Risk Detection"
              description="Early detection saves lives. Our AI analyzes your vitals to flag potential complications weeks before they become emergencies."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-accent-100 to-accent-50" />}
              icon={<Activity className="h-6 w-6 text-accent-600" />}
              className="md:col-span-1"
            />
            <BentoGridItem
              title="Universal Access"
              description="Language shouldn&apos;t be a barrier. Available in all major Indian languages, making expert care accessible to every mother."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-100 to-purple-50" />}
              icon={<Globe className="h-6 w-6 text-purple-600" />}
              className="md:col-span-1"
            />
             <BentoGridItem
              title="Community Support"
              description="Connect with other mothers and experts. Share stories, get advice, and feel supported."
              header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-orange-100 to-orange-50" />}
              icon={<Heart className="h-6 w-6 text-orange-600" />}
              className="md:col-span-3"
            />
          </BentoGrid>
        </div>
      </section>

      {/* --- REAL STORIES --- */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <ScrollReveal width="100%" animation="scale">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Stories of Hope</h2>

            <div className="relative bg-brand-900 rounded-[3rem] p-8 md:p-16 text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-700/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-900/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="w-full md:w-1/2 relative z-10 transition-transform duration-500 hover:scale-[1.02]">
                <img
                  src="/images/story.png"
                  alt="Mother and Child"
                  className="rounded-2xl shadow-xl border-4 border-white/10"
                />
              </div>

              <div className="w-full md:w-1/2 relative z-10">
                <div className="text-brand-300 font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Real Impact Case</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6 italic leading-relaxed">
                  &quot;I didn&apos;t know I had high BP until Pregoway alerted me.&quot;
                </h3>
                <p className="text-lg text-gray-200 leading-relaxed mb-8">
                  Riya, from a small town in Madhya Pradesh, was facing improper management of her gestational hypertension.
                  There were no specialists nearby. Pregoway's vitals tracker flagged her rising BP and guided her to the nearest district hospital just in time.
                </p>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center font-bold text-xl text-white">R</div>
                  <div>
                    <div className="font-bold text-white">Riya Sharma</div>
                    <div className="text-sm text-brand-200">Proud Mother of a healthy boy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-8 h-8 text-brand-500 fill-brand-500" />
              <span className="text-2xl font-bold text-white">Pregoway</span>
            </div>
            <p className="max-w-sm mb-8 text-gray-500">
              A mission-driven initiative to reduce maternal mortality rates in India through technology, education, and accessibility.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 hover:text-white transition-all transform hover:-translate-y-1"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 hover:text-white transition-all transform hover:-translate-y-1"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 hover:text-white transition-all transform hover:-translate-y-1"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-600 hover:text-white transition-all transform hover:-translate-y-1"><Mail className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="hover:text-brand-400 transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-brand-400 transition-colors">Doctors</Link></li>
              <li><Link href="#" className="hover:text-brand-400 transition-colors">Safety Guide</Link></li>
              <li><Link href="#" className="hover:text-brand-400 transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>+91 1800-PREG-WAY</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>help@pregoway.org</span>
              </li>
              <li className="flex items-center gap-3">
                <Map className="w-4 h-4" />
                <span>Arctic X Labs, India</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-gray-800 mt-16 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} Pregoway Foundation. Saving lives, one journey at a time.
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingContent />
    </Suspense>
  )
}
