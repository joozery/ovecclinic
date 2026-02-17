
import { getMyCertificates } from "@/actions/certificate";
import { DownloadButton } from "@/components/certificate/download-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Award, ExternalLink, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function MyCertificatesPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const certificates = await getMyCertificates();

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-[#1a237e] p-8 md:p-10 rounded-2xl shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-100 text-[9px] font-bold uppercase tracking-widest">
                            <Award className="w-3 h-3" /> Achievement Gallery
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                            คลังเกียรติบัตร<span className="text-blue-400">.</span>
                        </h1>
                        <p className="text-blue-100/70 max-w-sm font-medium text-sm leading-relaxed">
                            ความสำเร็จของคุณคือความภูมิใจของเรา รวบรวมและจัดการเกียรติบัตรทั้งหมดที่นี่
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl transition-transform duration-500 hover:scale-105">
                        <Award className="w-10 h-10 text-white opacity-80" />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {certificates.map((cert: any) => {
                    const activity = cert.activityId;
                    const certData = {
                        recipientName: session.user.name || "ผู้เข้ารับการอบรม",
                        courseTitle: activity.title,
                        completionDate: new Date(cert.issuedAt),
                        certificateCode: cert.certificateCode,
                        issuerName: "OVEC Training Platform"
                    };
                    const fileName = `certificate-${cert.certificateCode}.pdf`;

                    return (
                        <Card key={cert._id} className="flex flex-col h-full border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(26,35,126,0.12)] transition-all duration-500 rounded-3xl overflow-hidden group border border-slate-50">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1a237e] group-hover:scale-110 transition-transform duration-500">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 font-mono tracking-wider bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                        REF: {cert.certificateCode}
                                    </span>
                                </div>
                                <CardTitle className="line-clamp-2 text-xl font-black text-slate-800 leading-snug group-hover:text-[#1a237e] transition-colors">
                                    {activity.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-4">
                                    <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-3 py-1 rounded-lg text-[10px] font-bold">
                                        ออกให้เมื่อ {format(new Date(cert.issuedAt), "dd MMM yyyy")}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 px-8 py-4">
                                <div className="relative overflow-hidden flex items-center justify-center h-48 bg-[#f8faff] rounded-2xl border border-blue-50 mb-6 group-hover:bg-blue-50/50 transition-colors">
                                    <Award className="w-24 h-24 text-blue-100 opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-[13px] text-center text-slate-500 space-y-1 bg-slate-50 rounded-2xl p-4">
                                    <p className="font-medium opacity-60">สถานที่อบรม</p>
                                    <p className="font-black text-slate-800 text-sm">{activity.location}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 pt-4 flex flex-col gap-3">
                                <DownloadButton data={certData} fileName={fileName} label="ดาวน์โหลดไฟล์เกียรติบัตร" />
                                <Link href={`/verify/${cert.certificateCode}`} className="w-full">
                                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold text-slate-400 hover:text-[#1a237e] hover:bg-slate-50 transition-all">
                                        <ExternalLink className="w-3.5 h-3.5" /> ตรวจสอบความถูกต้องออนไลน์
                                    </button>
                                </Link>
                            </CardFooter>
                        </Card>
                    );
                })}

                {/* Empty State */}
                {certificates.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-32 bg-white/40 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 shadow-inner">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
                                <Award className="w-12 h-12 text-slate-300" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white">
                                <Search className="w-4 h-4 text-white" />
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">ยังไม่พบเกียรติบัตรของคุณ</h3>
                        <p className="text-slate-500 font-medium mb-10 max-w-sm text-center leading-relaxed">
                            เริ่มลงทะเบียนเรียนและส่งผลงานเพื่อให้ผ่านการประเมินวิทยฐานะ แล้วเกียรติบัตรจะปรากฏที่นี่ครับ
                        </p>
                        <Link href="/activities">
                            <button className="flex items-center gap-3 px-8 py-4 bg-[#1a237e] hover:bg-[#151b60] text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 transition-all active:scale-95">
                                <Calendar className="w-4 h-4" /> เลือกหลักสูตรที่น่าสนใจ
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
