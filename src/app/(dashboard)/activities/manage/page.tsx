import { getActivities } from "@/actions/activity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { auth } from "@/auth"; // Use auth to protect route
import { redirect } from "next/navigation";
import { ActivityActions } from "@/components/activity/activity-actions";

export default async function ManageActivitiesPage() {
    const session = await auth();
    // Protect route: Only supervisor and super_admin can access
    if (!session || session.user.role === "teacher") {
        redirect("/dashboard/activities"); // Redirect teachers to view page
    }

    const activities = await getActivities();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">จัดการกิจกรรมการนิเทศ</h1>
                    <p className="text-sm text-slate-500">สร้างและจัดการหลักสูตรการนิเทศ</p>
                </div>
                <Link href="/activities/manage/create">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95">
                        <Plus className="w-4 h-4" /> สร้างกิจกรรมใหม่
                    </button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activities.map((activity: any) => (
                    <Card key={activity._id} className="rounded-2xl border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-xl line-clamp-1">{activity.title}</CardTitle>
                                <CardDescription className="flex items-center gap-1.5">
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
                            <div className="flex flex-col gap-1 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
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
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${activity.status === 'Open' ? 'bg-green-100 text-green-700' :
                                        activity.status === 'Full' ? 'bg-yellow-100 text-yellow-700' :
                                            activity.status === 'Closed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {activity.status}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
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
