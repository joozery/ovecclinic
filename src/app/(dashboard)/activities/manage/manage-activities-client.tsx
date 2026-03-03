"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Calendar, LayoutGrid, List as ListIcon } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { ActivityActions } from "@/components/activity/activity-actions";
import { cn } from "@/lib/utils";

export function ManageActivitiesClient({ activities }: { activities: any[] }) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 shadow-sm gap-4 sm:gap-0">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">จัดการกิจกรรมการนิเทศ</h1>
                    <p className="text-sm text-slate-500">สร้างและจัดการหลักสูตรการนิเทศ</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center shrink-0">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            title="มุมมองแบบกริด"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn("p-2 rounded-lg transition-colors flex items-center justify-center", viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            title="มุมมองแบบรายการ"
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <Link href="/activities/manage/create" className="shrink-0">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95">
                            <Plus className="w-4 h-4" /> สร้างกิจกรรมใหม่
                        </button>
                    </Link>
                </div>
            </div>

            <div className={cn(
                viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
            )}>
                {viewMode === "grid" ? (
                    activities.map((activity: any) => (
                        <Card key={activity._id} className="rounded-2xl border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl line-clamp-1 pr-2">{activity.title}</CardTitle>
                                    </div>
                                    <CardDescription className="flex items-center gap-1.5 pt-1 md:pt-0">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {format(new Date(activity.startTime), "d MMM yyyy", { locale: th })}
                                    </CardDescription>
                                </div>
                                <ActivityActions activity={activity} />
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 mt-2">
                                    {activity.description}
                                </p>

                                <div className="flex flex-col gap-1 text-[11px] bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex-1 w-full">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600">เริ่ม:</span>
                                        <span>
                                            {format(new Date(activity.startTime), "d MMM ", { locale: th })}
                                            {(new Date(activity.startTime).getFullYear() + 543).toString().slice(-2)}, {format(new Date(activity.startTime), "HH:mm")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-600">สิ้นสุด:</span>
                                        <span>
                                            {format(new Date(activity.endTime), "d MMM ", { locale: th })}
                                            {(new Date(activity.endTime).getFullYear() + 543).toString().slice(-2)}, {format(new Date(activity.endTime), "HH:mm")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="font-medium text-gray-600">Quota:</span>
                                        <span>{activity.quota} seats</span>
                                    </div>
                                    <div className="flex justify-between mt-1 items-center">
                                        <span className="font-medium text-gray-600">Status:</span>
                                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", activity.status === 'Open' ? 'bg-green-100 text-green-700' :
                                            activity.status === 'Full' ? 'bg-yellow-100 text-yellow-700' :
                                                activity.status === 'Closed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        )}>
                                            {activity.status === 'Open' ? 'เปิดรับสมัคร' : activity.status === 'Full' ? 'เต็มแล้ว' : activity.status === 'Closed' ? 'ปิดรับสมัคร' : activity.status}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                                    <tr>
                                        <th className="px-6 py-4 whitespace-nowrap">ชื่อกิจกรรม</th>
                                        <th className="px-6 py-4 whitespace-nowrap">ระยะเวลา</th>
                                        <th className="px-6 py-4 whitespace-nowrap">สถานะ</th>
                                        <th className="px-6 py-4 whitespace-nowrap text-right">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activities.map((activity: any) => (
                                        <tr key={activity._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 min-w-[250px]">
                                                <p className="font-bold text-slate-900 line-clamp-1">{activity.title}</p>
                                                <p className="text-xs text-slate-500 line-clamp-1 mt-1">{activity.description}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col text-xs space-y-1">
                                                    <span>
                                                        <span className="text-slate-500 mr-2">เริ่มต้น :</span>
                                                        <span className="font-medium text-slate-700">
                                                            {format(new Date(activity.startTime), "d MMM ", { locale: th })}
                                                            {(new Date(activity.startTime).getFullYear() + 543).toString().slice(-2)} — {format(new Date(activity.startTime), "HH:mm")} น.
                                                        </span>
                                                    </span>
                                                    <span>
                                                        <span className="text-slate-500 mr-2">สิ้นสุด :</span>
                                                        <span className="font-medium text-slate-700">
                                                            {format(new Date(activity.endTime), "d MMM ", { locale: th })}
                                                            {(new Date(activity.endTime).getFullYear() + 543).toString().slice(-2)} — {format(new Date(activity.endTime), "HH:mm")} น.
                                                        </span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider", activity.status === 'Open' ? 'bg-green-100 text-green-700' :
                                                        activity.status === 'Full' ? 'bg-yellow-100 text-yellow-700' :
                                                            activity.status === 'Closed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                    )}>
                                                        {activity.status === 'Open' ? 'เปิดรับสมัคร' : activity.status === 'Full' ? 'เต็มแล้ว' : activity.status === 'Closed' ? 'ปิดรับสมัคร' : activity.status}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-slate-500">{activity.currentRegistrations || 0} / {activity.quota} ที่นั่ง</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex justify-end">
                                                    <ActivityActions activity={activity} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activities.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/40 border border-dashed border-slate-200 rounded-[2rem] text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-bold text-slate-900 mb-1">ยังไม่มีกิจกรรมการนิเทศ</p>
                        <p className="text-sm font-medium">เริ่มต้นโดยการสร้างกิจกรรมการนิเทศเป็นครั้งแรกของคุณ</p>
                    </div>
                )}
            </div>
        </div>
    );
}
