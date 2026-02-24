"use client";

import { useEffect, useState } from "react";
import { getPublicActivities } from "@/actions/public";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Image from "next/image";
import { Calendar, Clock, Users, Video, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LatestActivities() {
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        async function fetchActivities() {
            try {
                const data = await getPublicActivities();
                setActivities(data);
            } catch (error) {
                console.error("Failed to fetch activities:", error);
            }
        }
        fetchActivities();
    }, []);

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">Latest Updates</h2>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                            กิจกรรมการนิเทศ <br /> <span className="text-[#1a237e]">ที่กำลังเปิดรับสมัคร</span>
                        </h3>
                    </div>
                    <Link href="/activities">
                        <Button variant="ghost" className="text-[#1a237e] font-bold hover:bg-indigo-50 group">
                            ดูกิจกรรมทั้งหมด
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activities.length > 0 ? (
                        activities.map((activity, i) => {
                            const current = activity.currentRegistrations ?? 0;
                            const quota = activity.quota ?? 0;
                            const isFull = current >= quota;
                            const remaining = quota - current;

                            return (
                                <Link key={i} href={`/activities/${activity._id}`} className="group h-full">
                                    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                        {/* Visual Header */}
                                        <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-900 overflow-hidden">
                                            {activity.bannerImage ? (
                                                <Image
                                                    src={activity.bannerImage}
                                                    alt={activity.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                </>
                                            )}

                                            <div className="absolute top-4 right-4">
                                                {isFull ? (
                                                    <div className="bg-amber-500 text-white text-[9px] font-bold px-3 py-1 rounded-md shadow-lg">
                                                        เต็มแล้ว
                                                    </div>
                                                ) : (
                                                    <div className="bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-md shadow-lg">
                                                        เปิดรับสมัคร
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div className="p-5 flex-grow space-y-4">
                                            <div className="space-y-2">
                                                <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-[#1a237e] transition-colors line-clamp-1">
                                                    {activity.title}
                                                </h4>
                                                <p className="text-slate-500 text-xs font-medium line-clamp-1 leading-relaxed">
                                                    {activity.description}
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2.5 text-slate-600">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                        <Calendar className="w-3.5 h-3.5 text-[#1a237e]" />
                                                    </div>
                                                    <span className="text-xs font-bold">
                                                        {format(new Date(activity.startTime), "d MMM ", { locale: th })}
                                                        {new Date(activity.startTime).getFullYear() + 543}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-slate-600">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                        <Clock className="w-3.5 h-3.5 text-[#1a237e]" />
                                                    </div>
                                                    <span className="text-xs font-bold">{format(new Date(activity.startTime), "HH:mm")} - {format(new Date(activity.endTime), "HH:mm")} น.</span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-slate-600">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                        <Users className="w-3.5 h-3.5 text-[#1a237e]" />
                                                    </div>
                                                    <div className="text-xs font-bold">
                                                        {current}/{quota} คน
                                                        {!isFull && <span className="text-emerald-500 ml-1.5">(เหลือ {remaining})</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1.5">
                                                <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2 py-1 rounded-lg text-[9px] font-bold">
                                                    <Video className="w-2.5 h-2.5" /> ออนไลน์
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2 py-1 rounded-lg text-[9px] font-bold">
                                                    <FileText className="w-2.5 h-2.5" /> มีเอกสาร
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="px-5 pb-5 pt-3 mt-auto border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-100 shrink-0">
                                                    <Image
                                                        src={activity.createdBy?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.createdBy?.name}`}
                                                        alt={activity.createdBy?.name || "Speaker"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-slate-900 truncate">
                                                        สน. {activity.createdBy?.name || "ไม่ระบุ"}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 truncate">
                                                        วิทยากรผู้เชี่ยวชาญ
                                                    </p>
                                                </div>
                                            </div>

                                            {isFull ? (
                                                <Button variant="outline" className="h-9 px-4 rounded-lg font-bold text-slate-400 border-slate-200 text-[10px]" disabled>
                                                    เต็มแล้ว
                                                </Button>
                                            ) : (
                                                <Button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all group-hover:scale-105 text-[10px]">
                                                    ลงทะเบียน
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        [1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse">
                                <div className="h-32 bg-slate-100" />
                                <div className="p-5 space-y-4">
                                    <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
                                    <div className="h-3 w-full bg-slate-100 rounded-lg" />
                                    <div className="space-y-2 pt-2">
                                        <div className="h-6 w-1/2 bg-slate-100 rounded-lg" />
                                        <div className="h-6 w-1/2 bg-slate-100 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
