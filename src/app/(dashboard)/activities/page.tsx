
import { getActivities } from "@/actions/activity";
import { getMyRegistrations } from "@/actions/registration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, MapPin, Users, Activity, Settings } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { auth } from "@/auth";
import Link from "next/link";
import { RegisterButton } from "@/components/activity/register-button";
import { cn } from "@/lib/utils";

import { SearchInput } from "@/components/search-input";

export default async function ActivitiesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const search = typeof params.q === 'string' ? params.q : undefined;

    const session = await auth();
    const activities = await getActivities(undefined, search);

    // Get user registrations to check status
    const myRegistrations = await getMyRegistrations();
    const registeredActivityIds = new Set(myRegistrations.map((r: any) => r.activityId._id));

    const isSupervisor = session?.user?.role === 'supervisor' || session?.user?.role === 'super_admin';
    const canRegister = session?.user?.role === 'teacher';

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-[#1a237e] rounded-2xl p-8 md:p-10 text-white shadow-xl shadow-indigo-100/50 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                <div className="relative space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-blue-100">
                        <Activity className="w-3 h-3" /> ระบบนิเทศออนไลน์
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                        กิจกรรมการนิเทศ
                        <span className="block text-blue-200 text-2xl md:text-3xl font-medium mt-1">เพื่อการพัฒนาบุคลากร</span>
                    </h1>
                </div>

                <div className="relative flex flex-col items-center gap-3 w-full md:w-auto">
                    <SearchInput placeholder="ค้นหากิจกรรมการนิเทศ..." className="w-full md:w-80 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-within:bg-white rounded-xl backdrop-blur-md transition-all" />
                    {isSupervisor && (
                        <Link href="/activities/manage" className="w-full">
                            <Button variant="secondary" className="w-full h-10 rounded-lg font-bold gap-2 text-xs shadow-md hover:shadow-lg transition-all">
                                <Settings className="w-3.5 h-3.5" /> จัดการกิจกรรม
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Activities Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activities.map((activity: any) => {
                    const isRegistered = registeredActivityIds.has(activity._id);
                    const isFull = activity.status === 'Full';
                    const progress = Math.min(((activity.currentRegistrations || 0) / (activity.quota || 1)) * 100, 100);

                    return (
                        <Card key={activity._id} className="group relative flex flex-col h-full border border-slate-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                            {/* Accent Line */}
                            <div className={cn(
                                "h-1 w-full",
                                activity.status === 'Open' ? 'bg-emerald-500' :
                                    activity.status === 'Full' ? 'bg-orange-500' :
                                        'bg-slate-300'
                            )} />

                            <div className="p-6 flex flex-col h-full space-y-4">
                                <div className="flex justify-between items-start">
                                    <Badge
                                        className={cn(
                                            "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border-none shadow-none",
                                            activity.status === 'Open' ? 'bg-emerald-50 text-emerald-700' :
                                                activity.status === 'Full' ? 'bg-orange-50 text-orange-700' :
                                                    'bg-slate-100 text-slate-600'
                                        )}
                                    >
                                        {activity.status === 'Open' ? 'เปิดรับสมัคร' :
                                            activity.status === 'Full' ? 'เต็มแล้ว' : 'ปิดรับสมัคร'}
                                    </Badge>

                                    {activity.quota && (
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px]">
                                                <Users className="w-3 h-3" />
                                                <span>{activity.currentRegistrations || 0} / {activity.quota}</span>
                                            </div>
                                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all",
                                                        activity.currentRegistrations >= activity.quota ? "bg-red-500" : "bg-blue-600"
                                                    )}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 min-h-[3rem] group-hover:text-[#1a237e] transition-colors">
                                    {activity.title}
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1a237e] shrink-0 border border-blue-100">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-slate-800">
                                                {format(new Date(activity.startTime), "d MMMM ", { locale: th })}
                                                {new Date(activity.startTime).getFullYear() + 543}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-500">
                                                {format(new Date(activity.startTime), "HH:mm")} - {format(new Date(activity.endTime), "HH:mm")} น.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            {isRegistered && activity.location.startsWith('http') ? (
                                                <a
                                                    href={activity.location}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-bold text-blue-600 hover:underline truncate"
                                                >
                                                    ลิงก์สถานที่ประชุม/ออนไลน์
                                                </a>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-600 truncate">
                                                    {activity.location.startsWith('http') ? "ออนไลน์" : activity.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                    {activity.description}
                                </p>

                                <div className="pt-2 mt-auto flex gap-3">
                                    <Button variant="outline" className="flex-1 h-10 rounded-lg text-xs font-bold" asChild>
                                        <Link href={`/activities/${activity._id}`}>
                                            รายละเอียด
                                        </Link>
                                    </Button>
                                    {canRegister ? (
                                        <div className="flex-1">
                                            <RegisterButton
                                                activityId={activity._id}
                                                isRegistered={isRegistered}
                                                isFull={isFull}
                                                disabled={activity.status !== 'Open' && !isRegistered}
                                            />
                                        </div>
                                    ) : (
                                        <Button className="flex-1 h-10 rounded-lg text-xs font-bold" disabled variant="outline">
                                            {session ? "สำหรับบุคลากร" : "เข้าสู่ระบบ"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {activities.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white/40 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                            <Calendar className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">ไม่พบกิจกรรมการนิเทศ</h3>
                        <p className="text-slate-500 font-medium tracking-wide">ขณะนี้ยังไม่มีกิจกรรมที่คุณกำลังมองหา</p>
                    </div>
                )}
            </div>
        </div>
    );
}
