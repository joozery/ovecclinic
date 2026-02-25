
import { getSubmission } from "@/actions/submission";
import { getMyRegistrations } from "@/actions/registration";
import { SubmissionForm } from "@/components/submission/submission-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitPageProps {
    params: {
        id: string; // registrationId
    };
}

export default async function SubmitPage({ params }: SubmitPageProps) {
    const { id } = await params;
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Fetch registration to get activity details
    // Ideally, we'd have a specific getRegistration function, but reusing getMyRegistrations for now and filtering
    const registrations = await getMyRegistrations();
    const registration = registrations.find((r: any) => r._id === id);

    if (!registration) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Registration Not Found</h1>
                <Link href="/my-activities">
                    <Button>Back to My Activities</Button>
                </Link>
            </div>
        );
    }

    const activity = registration.activityId;
    const submission = await getSubmission(id);

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
                <Link href="/my-activities">
                    <button className="flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-blue-600 transition-colors w-fit">
                        <ArrowLeft className="w-4 h-4" /> กลับสู่หน้ากิจกรรมของฉัน
                    </button>
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">ส่งผลงานวุฒิบัตร</h1>
                        <p className="text-sm text-slate-500">อัปโหลดไฟล์หรือแนบลิงก์เพื่อเป็นหลักฐานในการเข้ารับการอบรม</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Activity Details Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none bg-white/80 backdrop-blur-sm shadow-sm rounded-[2rem] overflow-hidden sticky top-8">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-bold">รายละเอียดกิจกรรม</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="space-y-3">
                                <h3 className="font-bold text-slate-900 leading-tight">{activity.title}</h3>
                                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <MapPin className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                                    <span className="text-[13px] text-slate-600 font-medium leading-relaxed">{activity.location}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50">
                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                    <span className="text-[13px] font-bold text-indigo-700">{format(new Date(activity.startTime), "dd MMMM yyyy", { locale: undefined })}</span>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-50">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span className="text-[13px] font-bold text-blue-700">
                                        {format(new Date(activity.startTime), "HH:mm")} - {format(new Date(activity.endTime), "HH:mm")} น.
                                    </span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">สถานะปัจจุบัน</p>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                                        submission?.status === 'Approved' ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
                                            submission?.status === 'Rejected' ? 'bg-red-500 text-white hover:bg-red-700' :
                                                submission?.status === 'Request Changes' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                                                    'bg-blue-600 text-white hover:bg-blue-700'
                                    )}
                                >
                                    {submission ? (
                                        submission.status === 'Pending' ? 'รอการตรวจ' :
                                            submission.status === 'Approved' ? 'อนุมัติแล้ว' :
                                                submission.status === 'Rejected' ? 'ปฏิเสธ' :
                                                    submission.status === 'Request Changes' ? 'ขอข้อมูลเพิ่ม' : submission.status
                                    ) : 'ยังไม่ได้ส่งงาน'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submission Form Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none bg-white/80 backdrop-blur-sm shadow-sm rounded-[2rem] overflow-hidden">
                        <CardHeader className="px-8 pt-8">
                            <CardTitle className="text-xl font-bold">รายการที่จัดส่ง</CardTitle>
                            <CardDescription>
                                คุณสามารถอัปโหลดไฟล์ได้หลายไฟล์และแนบลิงก์ภายนอกได้ (เช่น Google Drive, YouTube)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            {submission?.feedback && (
                                <div className="mb-8 p-6 bg-orange-50 rounded-2xl border border-orange-100 flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-orange-800 mb-1">ความเห็นจากศึกษานิเทศก์</h4>
                                        <p className="text-sm text-orange-900/80 leading-relaxed font-medium">{submission.feedback}</p>
                                    </div>
                                </div>
                            )}

                            <SubmissionForm
                                registrationId={id}
                                initialData={submission}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
