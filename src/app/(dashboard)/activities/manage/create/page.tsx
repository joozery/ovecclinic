
import { ActivityForm } from "@/components/activity/activity-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function CreateActivityPage() {
    const session = await auth();
    if (!session || session.user.role === "teacher") {
        redirect("/dashboard/activities");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4 mb-2">
                <Link
                    href="/activities/manage"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">สร้างกิจกรรมใหม่</h1>
                    <p className="text-sm text-slate-500">กรอกข้อมูลรายละเอียดสำหรับกิจกรรมการนิเทศหรือหลักสูตรอบรม</p>
                </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
                <Suspense fallback={<div>กำลังโหลด...</div>}>
                    <ActivityForm onSuccessRedirect="/activities/manage" />
                </Suspense>
            </div>
        </div>
    );
}
