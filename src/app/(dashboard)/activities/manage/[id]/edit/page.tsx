
import { ActivityForm } from "@/components/activity/activity-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Activity from "@/models/Activity";
import dbConnect from "@/lib/db";
import { Suspense } from "react";

export default async function EditActivityPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();

    if (!session || session.user.role === "teacher") {
        redirect("/dashboard/activities");
    }

    await dbConnect();
    const activity = await Activity.findById(id).lean();

    if (!activity) {
        notFound();
    }

    // Convert BSON items to plain JS for the form
    const initialData = JSON.parse(JSON.stringify(activity));

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
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">แก้ไขกิจกรรม</h1>
                    <p className="text-sm text-slate-500">ปรับปรุงข้อมูลกิจกรรม: {initialData.title}</p>
                </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
                <Suspense fallback={<div>กำลังโหลด...</div>}>
                    <ActivityForm
                        initialData={initialData}
                        activityId={id}
                        onSuccessRedirect="/activities/manage"
                    />
                </Suspense>
            </div>
        </div>
    );
}
