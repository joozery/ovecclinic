"use client";

import { Calendar, Users, BookOpen, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicStats } from "@/actions/public";

export function Stats() {
    const [statsData, setStatsData] = useState({
        users: "...",
        activities: "...",
        supervisors: "...",
        certificates: "..."
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getPublicStats();
                setStatsData({
                    users: data.users.toLocaleString(),
                    activities: data.activities.toLocaleString(),
                    supervisors: data.supervisors.toLocaleString(),
                    certificates: data.certificates.toLocaleString()
                });
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            }
        }
        fetchStats();
    }, []);

    const stats = [
        { label: "หัวข้อนิเทศปีนี้", value: statsData.activities, icon: <Calendar className="w-5 h-5 text-[#1a237e]" /> },
        { label: "ผู้เข้ารับการนิเทศ", value: statsData.users, icon: <Users className="w-5 h-5 text-[#1a237e]" /> },
        { label: "ศึกษานิเทศก์", value: statsData.supervisors, icon: <BookOpen className="w-5 h-5 text-[#1a237e]" /> },
        { label: "เกียรติบัตรที่ออก", value: statsData.certificates, icon: <Award className="w-5 h-5 text-[#1a237e]" /> },
    ];

    return (
        <section className="relative -mt-8 z-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-4 lg:p-5 rounded-xl shadow-lg shadow-slate-200/40 border border-slate-50 flex items-center gap-4 transition-all hover:shadow-xl hover:-translate-y-0.5">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-50/50 rounded-xl flex items-center justify-center shrink-0">
                                {stat.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] lg:text-xs font-bold text-slate-400 mb-0.5 truncate">{stat.label}</p>
                                <p className="text-lg lg:text-xl font-black text-slate-900 leading-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
