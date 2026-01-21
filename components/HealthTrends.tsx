"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function HealthTrends({ userId, type }: { userId: string, type: 'WEIGHT' | 'BP' | 'KICKS' }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!userId) return;

            const { data: metrics } = await supabase
                .from('health_metrics')
                .select('value, created_at')
                .eq('user_id', userId)
                .eq('type', type)
                .order('created_at', { ascending: true })
                .limit(20); // Last 20 readings

            if (metrics) {
                const chartData = metrics.map(m => ({
                    date: new Date(m.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                    value: type === 'BP' ? parseInt(m.value.split('/')[0]) : parseFloat(m.value) // Handle BP 120/80 => 120 (Systolic) for simple chart
                }));
                setData(chartData);
            }
            setLoading(false);
        }
        fetchData();
    }, [userId, type]);

    if (loading) return <div className="h-48 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>;

    if (data.length < 2) {
        return (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm">Not enough data to show trends.</p>
                <p className="text-xs">Log at least 2 entries.</p>
            </div>
        )
    }

    return (
        <div className="h-56 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`color${type}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={type === 'WEIGHT' ? '#8b5cf6' : '#ec4899'} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={type === 'WEIGHT' ? '#8b5cf6' : '#ec4899'} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        hide
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={type === 'WEIGHT' ? '#8b5cf6' : '#ec4899'}
                        fillOpacity={1}
                        fill={`url(#color${type})`}
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
