"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, HeartPulse, Activity, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const MMR_DATA = [
  { year: '2018', rate: 113 },
  { year: '2019', rate: 103 },
  { year: '2020', rate: 97 },
  { year: '2021', rate: 90 }, // Still too high
  { year: 'Target', rate: 70 },
];

const CAUSES_DATA = [
  { name: 'Hemorrhage', value: 38, color: '#ef4444' }, // Red
  { name: 'Hypertension', value: 21, color: '#f97316' }, // Orange
  { name: 'Sepsis', value: 11, color: '#eab308' }, // Yellow
  { name: 'Others', value: 30, color: '#64748b' }, // Gray
];

export function CrisisSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <section className="bg-gray-900 py-24 px-6 relative overflow-hidden">
      {/* Background SVG Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
           <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#grad1)" />
           <defs>
             <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" style={{stopColor:'rgb(255,0,0)', stopOpacity:0}} />
               <stop offset="100%" style={{stopColor:'rgb(255,0,0)', stopOpacity:0.5}} />
             </linearGradient>
           </defs>
        </svg>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 text-white">
        
        {/* Header */}
        <div className="mb-20 grid md:grid-cols-2 gap-12 items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 border border-red-800 text-red-400 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
              <AlertCircle className="w-3 h-3" />
              Critical Attention Needed
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              The Silent Emergency: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                It's Not Just a Statistic.
              </span>
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
              Every 2 minutes, a woman dies from preventable causes related to pregnancy. We are losing mothers to silence, distance, and lack of data.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-4xl font-bold text-white mb-1">80%</div>
                <div className="text-sm text-gray-400">of maternal deaths are <span className="text-green-400 font-bold">preventable</span> with timely care.</div>
            </div>
            <div className="p-6 rounded-2xl bg-red-900/10 border border-red-500/20 backdrop-blur-sm">
                <div className="text-4xl font-bold text-red-500 mb-1">2x</div>
                <div className="text-sm text-red-200">Higher mortality risk in rural areas vs urban cities.</div>
            </div>
          </div>
        </div>

        {/* Charts Container */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Chart 1: The Problem (Trends) */}
          <div className="p-8 rounded-3xl bg-gray-800/50 border border-gray-700 backdrop-blur-[2px]">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-xl font-bold flex items-center gap-2">
                   <Activity className="w-5 h-5 text-blue-400" />
                   Maternal Mortality Ratio (MMR)
                 </h3>
                 <p className="text-sm text-gray-400 mt-1">Deaths per 100,000 live births (India)</p>
               </div>
               <div className="text-right">
                  <div className="text-2xl font-bold text-green-400 flex items-center justify-end gap-1">
                    <ArrowUpRight className="w-5 h-5 rotate-180" />
                    Declining
                  </div>
                  <div className="text-xs text-gray-500">But not fast enough</div>
               </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MMR_DATA}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: The Cause (Pie) */}
          <div className="p-8 rounded-3xl bg-gray-800/50 border border-gray-700 backdrop-blur-[2px] flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
               <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                 <HeartPulse className="w-5 h-5 text-red-500" />
                 Top Contributors
               </h3>
               <p className="text-gray-400 text-sm mb-6">
                 Hemorrhage and Hypertension dominate the causes. 
                 <strong className="text-white block mt-2">Pregoway's vitals tracker specifically targets these two killers.</strong>
               </p>
               
               <ul className="space-y-3">
                 {CAUSES_DATA.map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-sm">
                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                     <span className="text-gray-300 flex-1">{item.name}</span>
                     <span className="font-bold text-white">{item.value}%</span>
                   </li>
                 ))}
               </ul>
            </div>

            <div className="w-[240px] h-[240px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CAUSES_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {CAUSES_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                 <span className="text-3xl font-bold text-white">80%</span>
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest">Preventable</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
