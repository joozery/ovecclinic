
import { getMyRegistrations } from "@/actions/registration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket, FolderUp } from "lucide-react";
import { format } from "date-fns";
import { auth } from "@/auth";
import Link from "next/link";
import { CancelButton } from "@/components/activity/cancel-button";
import { redirect } from "next/navigation";

export default async function MyActivitiesPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const registrations = await getMyRegistrations();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">งานของฉัน</h1>
                    <p className="text-sm text-slate-500">ติดตามกิจกรรมและการฝึกอบรมที่คุณเข้าร่วม</p>
                </div>
                <Link href="/activities">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95">
                        ค้นหากิจกรรมเพิ่มเติม
                    </button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {registrations.map((reg: any) => {
                    const activity = reg.activityId;
                    if (!activity) return null;

                    return (
                        <Card key={reg._id} className="flex flex-col h-full border-none bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-3">
                                    <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border-blue-100">
                                        {reg.status === 'Registered' ? 'ลงทะเบียนแล้ว' :
                                            reg.status === 'Completed' ? 'เสร็จสิ้น' : reg.status}
                                    </Badge>
                                    <span className="text-[11px] font-medium text-slate-400">
                                        ลงทะเบียนเมื่อ: {format(new Date(reg.registeredAt), "dd MMM")}
                                    </span>
                                </div>
                                <CardTitle className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {activity.title}
                                </CardTitle>
                                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-slate-400 px-2.5 py-1 bg-slate-50 rounded-lg w-fit">
                                    <Ticket className="w-3.5 h-3.5" /> หมายเลข: {reg._id.slice(-6).toUpperCase()}
                                </div>
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
                                        <span className="line-clamp-2 pt-1">{activity.location}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4 border-t bg-slate-50/30 flex gap-3 p-6">
                                <Link href={`/my-activities/${reg._id}/submit`} className="flex-1">
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-100 transition-all active:scale-95">
                                        <FolderUp className="w-4 h-4" /> ส่งผลงาน
                                    </button>
                                </Link>
                                <div className="flex-none">
                                    <CancelButton registrationId={reg._id} />
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
                {registrations.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white/40 border border-dashed border-slate-200 rounded-[3rem] text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                            <Calendar className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีประวัติการลงทะเบียน</p>
                        <p className="text-sm font-medium mb-8">คุณยังไม่ได้ลงทะเบียนเข้าร่วมกิจกรรมใดๆ ในขณะนี้</p>
                        <Link href="/activities">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95">
                                สำรวจกิจกรรมการอบรม
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
