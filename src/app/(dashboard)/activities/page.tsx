
import { getActivities } from "@/actions/activity";
import { getMyRegistrations } from "@/actions/registration";
import { Button } from "@/components/ui/button";
import { Activity, Settings } from "lucide-react";
import { auth } from "@/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/search-input";
import { Suspense } from "react";
import { ActivitiesView } from "@/components/activity/activities-view";

export default async function ActivitiesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const search = typeof params.q === "string" ? params.q : undefined;

    const session = await auth();
    const activities = await getActivities(undefined, search);

    const myRegistrations = await getMyRegistrations();
    const registeredActivityIds = myRegistrations.map((r: any) => r.activityId._id.toString());

    const isSupervisor =
        session?.user?.role === "supervisor" || session?.user?.role === "super_admin";
    const canRegister = session?.user?.role === "teacher";

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="relative overflow-hidden bg-[#1a237e] rounded-2xl p-8 md:p-10 text-white shadow-xl shadow-indigo-100/50 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-blue-100">
                        <Activity className="w-3 h-3" /> ระบบนิเทศออนไลน์
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                        กิจกรรมการนิเทศ
                        <span className="block text-blue-200 text-2xl md:text-3xl font-medium mt-1">
                            เพื่อการพัฒนาบุคลากร
                        </span>
                    </h1>
                </div>

                <div className="relative flex flex-col items-center gap-3 w-full md:w-auto">
                    <Suspense fallback={<div className="w-full md:w-80 h-12 bg-white/10 rounded-xl animate-pulse" />}>
                        <SearchInput
                            placeholder="ค้นหากิจกรรมการนิเทศ..."
                            className="w-full md:w-80 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-within:bg-white rounded-xl backdrop-blur-md transition-all"
                        />
                    </Suspense>
                    {isSupervisor && (
                        <Link href="/activities/manage" className="w-full">
                            <Button variant="secondary" className="w-full h-10 rounded-lg font-bold gap-2 text-xs shadow-md hover:shadow-lg transition-all">
                                <Settings className="w-3.5 h-3.5" /> จัดการกิจกรรม
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "กิจกรรมทั้งหมด", value: activities.length, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
                    { label: "เปิดรับสมัคร", value: activities.filter((a: any) => a.status === "Open").length, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                    { label: "ลงทะเบียนแล้ว", value: registeredActivityIds.length, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 flex flex-col items-center justify-center text-center border shadow-sm`}>
                        <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
                        <span className="text-xs font-bold text-slate-500 mt-1">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Activities — switchable view */}
            <ActivitiesView
                activities={activities}
                registeredActivityIds={registeredActivityIds}
                canRegister={canRegister}
                session={session}
            />
        </div>
    );
}
