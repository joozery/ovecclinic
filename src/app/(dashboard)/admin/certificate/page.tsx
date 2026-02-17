
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Save, ShieldCheck, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CertificateSetupPage() {
    const session = await auth();

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        redirect("/dashboard");
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] p-8 md:p-10 rounded-xl shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-3xl" />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-100 text-[9px] font-bold uppercase tracking-widest">
                            <Award className="w-3 h-3" /> Certificate Template
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                            ตั้งค่าแม่แบบเกียรติบัตร<span className="text-blue-400">.</span>
                        </h1>
                        <p className="text-blue-100/70 max-w-sm font-medium text-sm leading-relaxed">
                            กำหนดค่ามาตรฐานสำหรับการออกเกียรติบัตรอิเล็กทรอนิกส์ของระบบ
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-blue-600" /> ข้อมูลผู้รับรองและผู้ลงนาม
                            </CardTitle>
                            <CardDescription>ข้อมูลนี้จะปรากฏที่ส่วนล่างของเกียรติบัตรทุกใบ</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">ชื่อผู้ลงนาม (ซ้าย)</label>
                                    <input type="text" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" defaultValue="ผู้อำนวยการเทคนิค" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">ตำแหน่ง (ซ้าย)</label>
                                    <input type="text" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" defaultValue="ผู้ให้การรับรองวิทยฐานะ" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">หน่วยงาน (ขวา)</label>
                                    <input type="text" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" defaultValue="สำนักงานคณะกรรมการการอาชีวศึกษา" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">คำอธิบายหน่วยงาน (ขวา)</label>
                                    <input type="text" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" defaultValue="หน่วยงานส่งเสริมการพัฒนาบุคลากร" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-blue-600" /> ตราประทับและลายเซ็นดิจิทัล
                            </CardTitle>
                            <CardDescription>อัปโหลดสัญลักษณ์เพื่อใช้ในเกียรติบัตร (รองรับไฟล์ PNG โปร่งใส)</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Award className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 mb-1">ตราประทับหน่วยงาน</p>
                                    <p className="text-[11px] text-slate-400">คลิกเพื่ออัปโหลด (PNG 512x512)</p>
                                </div>
                                <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Save className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 mb-1">ลายเซ็นผู้บริหาร</p>
                                    <p className="text-[11px] text-slate-400">คลิกเพื่ออัปโหลด (PNG 400x200)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-slate-200/60 shadow-xl shadow-blue-900/5 rounded-xl overflow-hidden bg-white">
                        <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black text-slate-900">บันทึกการตั้งค่า</CardTitle>
                            <CardDescription className="text-sm font-medium">ยืนยันการเปลี่ยนแแปลงรูปแบบเกียรติบัตร</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 mb-8">
                                <p className="text-xs font-bold text-blue-800/80 leading-relaxed">
                                    <span className="text-blue-600 mr-1">●</span> การเปลี่ยนแปลงจะมีผลกับเกียรติบัตรที่จะออกใหม่ทันที และจะมีผลย้อนหลังเมื่อมีการดาวน์โหลดเกียรติบัตรเดิมซ้ำ
                                </p>
                            </div>
                            <button className="w-full py-4 bg-[#1a237e] hover:bg-[#151b60] text-white rounded-xl font-black text-sm shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group">
                                <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" /> บันทึกเทมเพลตมาตรฐาน
                            </button>
                        </CardContent>
                    </Card>

                    <div className="p-1 px-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/60">
                        <div className="p-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Live Preview
                            </h4>
                            <div className="aspect-[1.414/1] bg-white border border-slate-200 rounded-lg shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                                <div className="h-full border-[12px] border-slate-50 m-2 rounded-sm flex flex-col items-center py-6 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                                        <Award className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="h-2 w-32 bg-slate-100 rounded-full mb-4" />
                                    <div className="h-1.5 w-40 bg-slate-50 rounded-full mb-1" />
                                    <div className="h-4 w-48 bg-blue-600/10 rounded-full mb-8" />

                                    <div className="mt-auto w-full flex justify-between px-8 pb-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-px bg-slate-200" />
                                            <div className="h-1.5 w-20 bg-slate-50 rounded-full" />
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-px bg-slate-200" />
                                            <div className="h-1.5 w-20 bg-slate-50 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
