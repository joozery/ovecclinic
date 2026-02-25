
"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface OverviewChartProps {
    data: {
        name: string;
        registrations: number;
    }[];
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-100 shadow-xl rounded-2xl px-5 py-4 text-sm">
                <p className="font-black text-slate-900 mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-bold text-slate-500">ผู้ลงทะเบียน</span>
                    <span className="font-black text-blue-600 ml-auto">
                        {payload[0].value.toLocaleString()} ราย
                    </span>
                </div>
            </div>
        );
    }
    return null;
}

export function OverviewChart({ data }: OverviewChartProps) {
    const maxVal = Math.max(...data.map((d) => d.registrations), 1);
    const totalReg = data.reduce((acc, d) => acc + d.registrations, 0);

    // Find peak month
    const peak = data.reduce((prev, cur) => (cur.registrations > prev.registrations ? cur : prev), data[0]);

    return (
        <div className="space-y-6 px-2">
            {/* Mini summary row */}
            <div className="grid grid-cols-3 gap-3 px-6">
                <div className="bg-blue-50/70 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">รวม 6 เดือน</p>
                    <p className="text-xl font-black text-blue-700">{totalReg.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-blue-400">ราย</p>
                </div>
                <div className="bg-emerald-50/70 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">เดือนพีค</p>
                    <p className="text-sm font-black text-emerald-700 leading-tight mt-1">{peak?.name || "-"}</p>
                    <p className="text-[10px] font-bold text-emerald-400">{peak?.registrations || 0} ราย</p>
                </div>
                <div className="bg-purple-50/70 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">เฉลี่ย/เดือน</p>
                    <p className="text-xl font-black text-purple-700">{(totalReg / 6).toFixed(1)}</p>
                    <p className="text-[10px] font-bold text-purple-400">ราย</p>
                </div>
            </div>

            {/* Bar mini chart */}
            <div className="px-2">
                <div className="flex items-end gap-2 h-28">
                    {data.map((d, i) => {
                        const h = maxVal > 0 ? (d.registrations / maxVal) * 100 : 0;
                        const isLatest = i === data.length - 1;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                                <div
                                    className="relative w-full rounded-t-xl transition-all duration-500 group-hover:opacity-90"
                                    style={{
                                        height: `${Math.max(h, 4)}%`,
                                        background: isLatest
                                            ? "linear-gradient(to top, #2563eb, #60a5fa)"
                                            : "linear-gradient(to top, #cbd5e1, #e2e8f0)",
                                    }}
                                >
                                    {/* Value label on hover */}
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-slate-900 text-white text-[10px] font-black rounded-lg px-2 py-1 whitespace-nowrap">
                                            {d.registrations} ราย
                                        </div>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold ${isLatest ? "text-blue-600" : "text-slate-400"}`}>
                                    {d.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Area chart for trend */}
            <div className="px-0">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-6">แนวโน้มการลงทะเบียน</p>
                <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }} />
                        <Area
                            type="monotone"
                            dataKey="registrations"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            fill="url(#regGrad)"
                            dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
