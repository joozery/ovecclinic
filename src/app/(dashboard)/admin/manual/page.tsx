import { getSiteSetting } from "@/actions/site-settings";
import { ManualUrlForm } from "@/components/admin/manual-url-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Link2 } from "lucide-react";

export default async function AdminManualPage() {
    const session = await auth();

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        redirect("/dashboard");
    }

    const manualUrl = await getSiteSetting("manual_url");

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden bg-[#1a237e] p-8 md:p-10 rounded-2xl shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-100 text-[9px] font-bold uppercase tracking-widest">
                            <BookOpen className="w-3 h-3" /> User Manual Guide
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                            ตั้งค่าคู่มือการใช้งาน<span className="text-blue-400">.</span>
                        </h1>
                        <p className="text-blue-100/70 font-medium text-sm">
                            กำหนดลิงก์คู่มือภายนอกที่ผู้ใช้จะถูกพาไปเมื่อกดปุ่มคู่มือในหน้าหลัก
                        </p>
                    </div>
                </div>
            </div>

            {/* External URL Setting Card */}
            <Card className="border border-blue-100 bg-white/80 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-900">ลิงก์คู่มือภายนอก</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                วาง URL จาก Google Drive, PDF, เว็บไซต์ หรือแหล่งข้อมูลอื่น ๆ — เมื่อผู้ใช้คลิก &quot;คู่มือการใช้งาน&quot; จะเปิดในแท็บใหม่ทันที
                            </p>
                        </div>
                    </div>
                    <ManualUrlForm currentUrl={manualUrl || ""} />
                </CardContent>
            </Card>
        </div>
    );
}
