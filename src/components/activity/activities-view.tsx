
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutList, LayoutGrid, Calendar, MapPin, Users, ChevronRight, Clock, Filter, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { RegisterButton } from "@/components/activity/register-button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useMemo } from "react";

const PAGE_SIZE = 10;

const statusConfig: Record<string, { label: string; className: string; dotClass: string; cardBorder: string }> = {
    Open: {
        label: "เปิดรับสมัคร",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotClass: "bg-emerald-500",
        cardBorder: "border-t-emerald-500",
    },
    Full: {
        label: "เต็มแล้ว",
        className: "bg-orange-50 text-orange-700 border-orange-200",
        dotClass: "bg-orange-500",
        cardBorder: "border-t-orange-500",
    },
    Closed: {
        label: "ปิดรับสมัคร",
        className: "bg-slate-100 text-slate-500 border-slate-200",
        dotClass: "bg-slate-400",
        cardBorder: "border-t-slate-300",
    },
};

interface ActivitiesViewProps {
    activities: any[];
    registeredActivityIds: string[];
    canRegister: boolean;
    session: any;
}

export function ActivitiesView({ activities, registeredActivityIds, canRegister, session }: ActivitiesViewProps) {
    const [view, setView] = useState<"list" | "grid">("list");
    const [filter, setFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const registeredSet = new Set(registeredActivityIds);

    const filteredActivities = useMemo(() => {
        const now = new Date();
        return activities.filter((activity) => {
            if (filter === "all") return true;
            if (filter === "past") return new Date(activity.endTime) < now;
            if (filter === "full") return activity.status === "Full";
            if (filter === "open") return activity.status === "Open";
            return true;
        });
    }, [activities, filter]);

    const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));

    // Reset to page 1 when filter changes
    const handleFilterChange = (val: string) => {
        setFilter(val);
        setPage(1);
    };

    const paginatedActivities = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredActivities.slice(start, start + PAGE_SIZE);
    }, [filteredActivities, page]);

    return (
        <div className="space-y-4">
            {/* Filters and View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <p className="text-sm font-bold text-slate-500 whitespace-nowrap">
                        พบ <span className="text-blue-600">{filteredActivities.length}</span> กิจกรรม
                    </p>

                    <div className="relative group flex-1 sm:flex-none">
                        <select
                            value={filter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="w-full sm:w-48 h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm hover:border-slate-300"
                        >
                            <option value="all">ทั้งหมด</option>
                            <option value="open">กิจกรรมที่ยังเปิดรับ</option>
                            <option value="full">กิจกรรมที่เต็มแล้ว</option>
                            <option value="past">กิจกรรมที่ผ่านไปแล้ว</option>
                        </select>
                        <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-100 pl-2">
                            <ChevronRight className="w-3 h-3 text-slate-400 rotate-90" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setView("list")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                            view === "list"
                                ? "bg-white text-[#1a237e] shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <LayoutList className="w-3.5 h-3.5" /> ตาราง
                    </button>
                    <button
                        onClick={() => setView("grid")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                            view === "grid"
                                ? "bg-white text-[#1a237e] shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" /> การ์ด
                    </button>
                </div>
            </div>

            {/* ---- LIST VIEW ---- */}
            {view === "list" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header row */}
                    <div className="hidden md:grid grid-cols-[1.8fr_1.3fr_1fr_1.1fr_210px] gap-6 px-6 py-3 bg-slate-50 border-b border-slate-100">
                        {["ชื่อกิจกรรม", "วันที่ / เวลา", "สถานที่", "จำนวนที่นั่ง", "การดำเนินการ"].map((col, i) => (
                            <span key={col} className={cn("text-[11px] font-black text-slate-400 uppercase tracking-widest", i === 4 && "text-right")}>
                                {col}
                            </span>
                        ))}
                    </div>

                    <div className="divide-y divide-slate-100">
                        {paginatedActivities.length === 0 && <EmptyState />}

                        {paginatedActivities.map((activity) => {
                            const isRegistered = registeredSet.has(activity._id);
                            const isFull = activity.status === "Full";
                            const progress = Math.min(((activity.currentRegistrations || 0) / (activity.quota || 1)) * 100, 100);
                            const st = statusConfig[activity.status] || statusConfig.Closed;

                            return (
                                <div key={activity._id} className="group flex flex-col md:grid md:grid-cols-[1.8fr_1.3fr_1fr_1.1fr_210px] gap-6 px-6 py-5 hover:bg-blue-50/30 transition-colors items-start md:items-center border-b border-slate-100 last:border-b-0">
                                    {/* Title */}
                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.className}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${st.dotClass}`} />
                                                {st.label}
                                            </span>
                                            {isRegistered && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                    ✓ ลงทะเบียนแล้ว
                                                </span>
                                            )}
                                        </div>
                                        <Link href={`/activities/${activity._id}`} className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#1a237e] transition-colors">
                                            {activity.title}
                                        </Link>
                                    </div>

                                    {/* Date */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                            <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            {format(new Date(activity.startTime), "d MMM ", { locale: th })}
                                            {new Date(activity.startTime).getFullYear() + 543}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                                            <Clock className="w-3 h-3 shrink-0" />
                                            {format(new Date(activity.startTime), "HH:mm")} – {format(new Date(activity.endTime), "HH:mm")} น.
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        {isRegistered && activity.location.startsWith("http") ? (
                                            <a href={activity.location} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline truncate">ลิงก์ออนไลน์</a>
                                        ) : (
                                            <span className="text-xs font-medium text-slate-600 truncate">
                                                {activity.location.startsWith("http") ? "ออนไลน์" : activity.location}
                                            </span>
                                        )}
                                    </div>

                                    {/* Seats */}
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className={cn("text-sm font-black", progress >= 100 ? "text-red-600" : "text-slate-800")}>
                                                {activity.currentRegistrations || 0}
                                                <span className="text-slate-400 font-bold text-xs">/{activity.quota}</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all", progress >= 100 ? "bg-red-500" : progress >= 70 ? "bg-orange-400" : "bg-blue-500")}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs font-bold gap-1 whitespace-nowrap shrink-0" asChild>
                                            <Link href={`/activities/${activity._id}`}>รายละเอียด <ChevronRight className="w-3 h-3" /></Link>
                                        </Button>
                                        {canRegister && (
                                            <div className="shrink-0">
                                                <RegisterButton activityId={activity._id} isRegistered={isRegistered} isFull={isFull} disabled={activity.status !== "Open" && !isRegistered} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ---- GRID VIEW ---- */}
            {view === "grid" && (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedActivities.length === 0 && (
                        <div className="col-span-full">
                            <EmptyState />
                        </div>
                    )}

                    {paginatedActivities.map((activity) => {
                        const isRegistered = registeredSet.has(activity._id);
                        const isFull = activity.status === "Full";
                        const progress = Math.min(((activity.currentRegistrations || 0) / (activity.quota || 1)) * 100, 100);
                        const st = statusConfig[activity.status] || statusConfig.Closed;

                        return (
                            <Card key={activity._id} className={cn("group relative flex flex-col border border-slate-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-t-4", st.cardBorder)}>
                                {/* Banner Image */}
                                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                    {activity.bannerImage ? (
                                        <Image
                                            src={activity.bannerImage}
                                            alt={activity.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                            <Calendar className="w-8 h-8 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-1 rounded-full border shadow-sm backdrop-blur-md ${st.className}`}>
                                            <span className={`w-1 h-1 rounded-full ${st.dotClass}`} /> {st.label}
                                        </span>
                                        {isRegistered && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-blue-600/90 text-white shadow-sm backdrop-blur-md">
                                                ✓ ลงทะเบียนแล้ว
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <CardContent className="p-5 flex flex-col h-full space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                <div className="w-5 h-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                                                    <Users className="w-2.5 h-2.5" />
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {activity.currentRegistrations || 0}/{activity.quota} ที่นั่ง
                                            </span>
                                        </div>
                                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full", progress >= 100 ? "bg-red-500" : progress >= 70 ? "bg-orange-400" : "bg-blue-500")}
                                                style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>

                                    <Link href={`/activities/${activity._id}`} className="font-bold text-slate-900 text-[15px] leading-snug line-clamp-2 group-hover:text-[#1a237e] transition-colors">
                                        {activity.title}
                                    </Link>

                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{activity.description}</p>

                                    <div className="space-y-2 pt-1">
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            <span className="font-bold">
                                                {format(new Date(activity.startTime), "d MMM ", { locale: th })}
                                                {new Date(activity.startTime).getFullYear() + 543}
                                            </span>
                                            <span className="text-slate-400">
                                                {format(new Date(activity.startTime), "HH:mm")}–{format(new Date(activity.endTime), "HH:mm")} น.
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                                            {isRegistered && activity.location.startsWith("http") ? (
                                                <a href={activity.location} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline truncate">ลิงก์ออนไลน์</a>
                                            ) : (
                                                <span className="truncate">{activity.location.startsWith("http") ? "ออนไลน์" : activity.location}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2 mt-auto flex gap-2">
                                        <Button variant="outline" className="flex-1 h-9 rounded-lg text-xs font-bold" asChild>
                                            <Link href={`/activities/${activity._id}`}>รายละเอียด</Link>
                                        </Button>
                                        {canRegister && (
                                            <div className="flex-1">
                                                <RegisterButton activityId={activity._id} isRegistered={isRegistered} isFull={isFull} disabled={activity.status !== "Open" && !isRegistered} />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ---- PAGINATION ---- */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs font-bold text-slate-400">
                        หน้า <span className="text-slate-700">{page}</span> จาก <span className="text-slate-700">{totalPages}</span>
                        <span className="ml-2 text-slate-300">({filteredActivities.length} รายการ)</span>
                    </p>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, idx) =>
                                p === "..." ? (
                                    <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-xs font-bold">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p as number)}
                                        className={cn(
                                            "w-9 h-9 rounded-xl text-xs font-black transition-all shadow-sm border",
                                            page === p
                                                ? "bg-[#1a237e] text-white border-[#1a237e] shadow-indigo-200"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                        )}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <Calendar className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1">ไม่พบกิจกรรม</h3>
            <p className="text-sm font-medium text-slate-400">ขณะนี้ยังไม่มีกิจกรรมที่คุณกำลังมองหา</p>
        </div>
    );
}
