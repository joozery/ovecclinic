
import { getSubmissionById } from "@/actions/submission";
import { ReviewForm } from "@/components/submission/review-form";
import { CertificateActions } from "@/components/certificate/certificate-actions"; // Import actions
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, User, ExternalLink } from "lucide-react";
import dbConnect from "@/lib/db";
import Certificate from "@/models/Certificate"; // Import model to check existence
import { cn } from "@/lib/utils";

interface ReviewPageProps {
    params: {
        submissionId: string;
    };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
    const { submissionId } = await params;
    const session = await auth();

    if (!session || (session.user.role !== 'supervisor' && session.user.role !== 'super_admin' && session.user.role !== 'admin')) {
        redirect("/dashboard");
    }

    const submission = await getSubmissionById(submissionId);

    if (!submission) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Submission Not Found</h1>
                <Link href="/supervision">
                    <Button>Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const activity = submission.activityId;
    const user = submission.userId;

    // Check for existing certificate
    await dbConnect();
    const existingCert = await Certificate.findOne({ registrationId: submission.registrationId });

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
                <Link href="/supervision">
                    <button className="flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-blue-600 transition-colors w-fit">
                        <ArrowLeft className="w-4 h-4" /> กลับสู่หน้าแดชบอร์ด
                    </button>
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">ตรวจประเมินผลงาน</h1>
                        <p className="text-sm text-slate-500">ตรวจสอบรายละเอียดผลงานที่ส่งโดย {user?.name}</p>
                    </div>
                    <Badge
                        variant="secondary"
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                            submission.status === 'Approved' ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
                                submission.status === 'Rejected' ? 'bg-red-500 text-white hover:bg-red-700' :
                                    submission.status === 'Request Changes' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                                        'bg-blue-600 text-white hover:bg-blue-700'
                        )}
                    >
                        {submission.status === 'Pending' ? 'รอการตรวจ' :
                            submission.status === 'Approved' ? 'อนุมัติแล้ว' :
                                submission.status === 'Rejected' ? 'ปฏิเสธ' :
                                    submission.status === 'Request Changes' ? 'ขอข้อมูลเพิ่ม' : submission.status}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Submission content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-none bg-white/80 backdrop-blur-sm shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    ข้อมูลผู้ส่งงาน
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <span className="font-bold text-slate-900 block">{user?.name}</span>
                                <span className="text-sm text-slate-500 block">{user?.email}</span>
                            </CardContent>
                        </Card>

                        <Card className="border-none bg-white/80 backdrop-blur-sm shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    รายละเอียดกิจกรรม
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-bold text-slate-900 mb-2 leading-tight">{activity?.title}</h3>
                                <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed">{activity?.description}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none bg-white/80 backdrop-blur-sm shadow-sm rounded-[2rem] overflow-hidden">
                        <CardHeader className="px-8 pt-8">
                            <CardTitle className="text-xl font-bold">สิ่งที่ส่งประกวด/ประเมิน</CardTitle>
                            <CardDescription>ไฟล์และลิงก์ประกอบการพิจารณาที่จัดส่งโดยผู้เข้ารับการอบรม</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-8">
                            {/* Files */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                                    <h4 className="font-bold text-sm text-slate-900 uppercase tracking-tight">ไฟล์เอกสาร</h4>
                                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200">
                                        {submission.files?.length || 0} ไฟล์
                                    </Badge>
                                </div>
                                {submission.files && submission.files.length > 0 ? (
                                    <div className="grid gap-3">
                                        {submission.files.map((file: any, index: number) => (
                                            <div key={index} className="flex items-center gap-4 p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors group">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-sm font-bold text-slate-900 truncate">{file.name}</span>
                                                    <span className="text-[11px] text-slate-400 font-medium">
                                                        {file.size ? `${(file.size / 1024).toFixed(1)} KB` : "ไฟล์แนบ"}
                                                    </span>
                                                </div>
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download={file.name}
                                                    className="px-4 py-2 bg-white hover:bg-blue-600 hover:text-white border border-slate-200 rounded-xl font-bold text-[11px] transition-all active:scale-95 shadow-sm flex items-center gap-1.5 whitespace-nowrap"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> เปิดไฟล์
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-400 font-medium italic">ไม่ได้อัปโหลดไฟล์แนบ</p>
                                    </div>
                                )}
                            </div>

                            {/* Links */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                                    <h4 className="font-bold text-sm text-slate-900 uppercase tracking-tight">ลิงก์แนบเพิ่มเติม</h4>
                                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-200">
                                        {submission.links?.length || 0} ลิงก์
                                    </Badge>
                                </div>
                                {submission.links && submission.links.length > 0 ? (
                                    <div className="space-y-2">
                                        {submission.links.map((link: string, index: number) => (
                                            <a key={index} href={link} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-4 bg-blue-50/30 hover:bg-blue-50 rounded-2xl border border-blue-50 transition-colors group">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                    <ExternalLink className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-blue-600 hover:underline break-all">{link}</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-400 font-medium italic">ไม่มีลิงก์เพิ่มเติม</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>จัดส่งเมื่อ</span>
                                <span>{format(new Date(submission.submittedAt), "dd MMMM yyyy, HH:mm น.")}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Review Form & Certificate Actions */}
                <div className="space-y-6">
                    <Card className="border-none bg-white/80 backdrop-blur-sm shadow-lg rounded-[2rem] overflow-hidden sticky top-8">
                        <CardHeader className="bg-slate-900 text-white p-8">
                            <CardTitle className="text-xl font-bold">ผลการตรวจประเมิน</CardTitle>
                            <CardDescription className="text-slate-400 mt-1">ระบุข้อเสนอแนะและอัปเดตสถานะผลงาน</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <ReviewForm
                                submissionId={submission._id}
                                initialData={{
                                    status: submission.status,
                                    feedback: submission.feedback
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Certificate Actions Section */}
                    <Card className="border-none bg-white/80 backdrop-blur-sm shadow-sm rounded-[2rem] overflow-hidden">
                        <CardContent className="p-0">
                            <CertificateActions
                                registrationId={submission.registrationId}
                                isApproved={submission.status === 'Approved'}
                                existingCertificateCode={existingCert?.certificateCode}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
