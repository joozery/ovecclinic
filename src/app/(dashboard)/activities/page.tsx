
import { getActivities } from "@/actions/activity";
import { getMyRegistrations } from "@/actions/registration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">กิจกรรมการฝึกอบรม</h1>
                    <p className="text-sm text-slate-500">สำรวจหลักสูตรและการประชุมเชิงปฏิบัติการที่เปิดรับสมัคร</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <SearchInput placeholder="ค้นหากิจกรรม..." className="w-full md:w-80" />
                    {isSupervisor && (
                        <Link href="/activities/manage">
                            <Button variant="outline" className="rounded-xl border-slate-200">จัดการ</Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activities.map((activity: any) => {
                    const isRegistered = registeredActivityIds.has(activity._id);
                    const isFull = activity.status === 'Full';

                    return (
                        <Card key={activity._id} className="flex flex-col h-full hover:shadow-xl transition-all duration-300 border-none bg-white/80 backdrop-blur-sm overflow-hidden group">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-3">
                                    <Badge variant={activity.status === 'Open' ? 'default' : 'secondary'}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            activity.status === 'Open' ? 'bg-emerald-500 hover:bg-emerald-600' :
                                                activity.status === 'Full' ? 'bg-orange-500 hover:bg-orange-600' :
                                                    'bg-slate-400 hover:bg-slate-500'
                                        )}
                                    >
                                        {activity.status === 'Open' ? 'เปิดรับสมัคร' :
                                            activity.status === 'Full' ? 'เต็มแล้ว' : 'ปิดรับสมัคร'}
                                    </Badge>
                                    {activity.quota && (
                                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                                            <Users className="w-3.5 h-3.5" />
                                            {activity.quota} ที่นั่ง
                                        </span>
                                    )}
                                </div>
                                <CardTitle className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {activity.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-5 pt-0">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 text-[13px] text-slate-600">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">
                                                {format(new Date(activity.startTime), "dd MMMM yyyy")}
                                            </span>
                                            <span className="text-slate-500">
                                                {format(new Date(activity.startTime), "HH:mm")} - {format(new Date(activity.endTime), "HH:mm")} น.
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 text-[13px] text-slate-600">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="line-clamp-2 pt-1.5">{activity.location}</span>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-100 w-full" />
                                <p className="text-[13px] text-slate-500 line-clamp-3 leading-relaxed">
                                    {activity.description}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-4 border-t bg-slate-50/30">
                                {canRegister ? (
                                    <div className="w-full">
                                        <RegisterButton
                                            activityId={activity._id}
                                            isRegistered={isRegistered}
                                            isFull={isFull}
                                            disabled={activity.status !== 'Open' && !isRegistered}
                                        />
                                    </div>
                                ) : (
                                    <Button className="w-full rounded-xl" disabled variant="outline">
                                        {session ? "เข้าสู่ระบบในฐานะครูเพื่อสมัคร" : "เข้าสู่ระบบเพื่อสมัคร"}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
                {activities.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/40 border border-dashed border-slate-200 rounded-[2rem] text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-lg font-bold text-slate-900 mb-1">ไม่พบกิจกรรมการอบรม</p>
                        <p className="text-sm font-medium">ไม่มีหลักสูตรการอบรมที่กำลังจะมาถึงในขณะนี้</p>
                    </div>
                )}
            </div>
        </div>
    );
}
