"use client";

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getPublicActivities } from "@/actions/public";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";

export function CalendarSection() {
    const [activities, setActivities] = useState<any[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const days = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

    // Calendar calculation
    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const currentMonthActivities = activities.filter(a => isSameMonth(new Date(a.startTime), currentMonth));

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

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
        <section className="relative py-24 bg-gradient-to-br from-blue-200/50 via-blue-100/30 to-indigo-200/40 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-400/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[900px] h-[900px] bg-indigo-400/40 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Calendar Side */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <CalendarIcon className="w-5 h-5 text-[#1a237e]" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900">ปฏิทินกิจกรรม</h2>
                            </div>

                            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl">
                                <Button variant="ghost" onClick={goToToday} className="h-8 px-3 rounded-lg text-xs font-bold bg-white shadow-sm hover:bg-slate-50">วันนี้</Button>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg hover:bg-white text-slate-600">
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-xs font-black text-slate-700 mx-1 whitespace-nowrap">
                                        {format(currentMonth, "MMMM ", { locale: th })}{currentMonth.getFullYear() + 543}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg hover:bg-white text-slate-600">
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 mb-2">
                            {days.map((day, i) => (
                                <div key={i} className={`text-center text-[10px] uppercase tracking-wider font-bold pb-2 ${i === 0 ? "text-red-500" : "text-slate-400"}`}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                            {calendarDays.map((date, idx) => {
                                const isCurrentMonthDate = isSameMonth(date, currentMonth);
                                const isDateToday = isToday(date);
                                const dateActivities = activities.filter(a => isSameDay(new Date(a.startTime), date));
                                const isSunday = date.getDay() === 0;

                                return (
                                    <div key={idx} className={`bg-white aspect-square p-2 hover:bg-slate-50 transition-colors group relative cursor-pointer ${!isCurrentMonthDate ? "opacity-40" : ""}`}>
                                        <span className={`text-xs font-bold ${isSunday ? "text-red-500" : "text-slate-600"} ${isDateToday && !isSunday ? "text-[#1a237e]" : ""}`}>
                                            {format(date, "d")}
                                        </span>
                                        {isDateToday && (
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#1a237e] rounded-full flex items-center justify-center shadow-md">
                                                <span className="text-white text-[10px] font-bold">{format(date, "d")}</span>
                                            </div>
                                        )}
                                        {dateActivities.length > 0 && (
                                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                                                {dateActivities.slice(0, 3).map((act, dotIdx) => (
                                                    <div key={dotIdx} className={`w-1 h-1 rounded-full ${act.status === 'Full' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                                ))}
                                                {dateActivities.length > 3 && (
                                                    <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-50 pt-6">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                สถานะ:
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> เปิดรับสมัคร
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div> เต็มแล้ว
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                <div className="w-2 h-2 bg-slate-600 rounded-full"></div> ปิดกิจกรรม
                            </div>
                        </div>
                    </div>

                    {/* Events List Side */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg bg-indigo-50 text-[#1a237e]">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-2 text-slate-900">
                                <span className="text-sm font-black">
                                    {format(currentMonth, "MMMM ", { locale: th })}{currentMonth.getFullYear() + 543}
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg hover:bg-slate-100 text-[#1a237e]">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
                            {currentMonthActivities.length > 0 ? (
                                currentMonthActivities.map((activity, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                {format(new Date(activity.startTime), "d MMM yyyy", { locale: th })}
                                            </div>
                                            {(activity.currentRegistrations ?? 0) >= (activity.quota ?? 0) ? (
                                                <div className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                                    เต็มแล้ว ({activity.currentRegistrations ?? 0}/{activity.quota ?? 0})
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                    ผู้สมัคร {activity.currentRegistrations ?? 0} / {activity.quota ?? 0}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-xs font-black text-slate-900 mb-2 leading-snug line-clamp-2 group-hover:text-[#1a237e]">
                                            {activity.title}
                                        </h3>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <span className="text-[10px] font-medium">{format(new Date(activity.startTime), "HH:mm")} - {format(new Date(activity.endTime), "HH:mm")} น.</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-xs font-bold text-slate-400">ยังไม่มีกิจกรรมในเดือนนี้</p>
                                </div>
                            )}
                        </div>

                        <Link href="/activities" className="mt-auto block">
                            <Button variant="outline" className="w-full h-12 bg-white text-slate-900 hover:bg-indigo-50 border-slate-100 rounded-xl font-bold text-xs transition-all mt-6">
                                ดูกิจกรรมทั้งหมด
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
