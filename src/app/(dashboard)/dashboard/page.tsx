
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSystemStats, getMonthlyStats } from "@/actions/stats";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/dashboard/export-button";
import Link from "next/link";
import { Calendar, GraduationCap, ClipboardCheck, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const role = session.user.role;
    const isAdmin = role === 'admin' || role === 'super_admin' || role === 'supervisor';

    if (isAdmin) {
        const systemStats = await getSystemStats();
        const monthlyStats = await getMonthlyStats();

        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-sm p-8 rounded-xl border border-slate-100 shadow-sm">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">ภาพรวมระบบ<span className="text-blue-600">.</span></h1>
                        <p className="text-sm font-medium text-slate-500">ยินดีต้อนรับกลับมา, คุณ {session.user.name} ติดตามความเคลื่อนไหวของทั้งระบบได้ที่นี่</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ExportButton />
                    </div>
                </div>

                <StatsCards data={systemStats} />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4 border-none bg-white/80 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="p-8 pb-0">
                            <CardTitle className="text-xl font-bold">การเติบโตของแพลตฟอร์ม</CardTitle>
                            <CardDescription className="text-sm">จำนวนการลงทะเบียนรายเดือนในระบบตรวจสอบวิทยฐานะ</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pl-2">
                            <OverviewChart data={monthlyStats} />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-3 border-none bg-white/80 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-bold">เมนูด่วน</CardTitle>
                            <CardDescription className="text-sm">ทางลัดสำหรับเข้าถึงเมนูที่คุณต้องใช้งานบ่อย</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 grid gap-3">
                            <Link href="/activities/manage">
                                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover:scale-110">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">จัดการกิจกรรมการอบรม</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/supervision">
                                <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover:scale-110">
                                            <ClipboardCheck className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">ตรวจและประเมินผลงาน</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            {(role === 'admin' || role === 'super_admin') && (
                                <Link href="/admin/users">
                                    <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm transition-transform group-hover:scale-110">
                                                <GraduationCap className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">จัดการผู้ใช้งานในระบบ</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Teacher / Default Dashboard
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-sm p-8 rounded-xl border border-slate-200/60 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">แดชบอร์ด<span className="text-blue-600">.</span></h1>
                    <p className="text-sm font-medium text-slate-500">ยินดีต้อนรับกลับมา, {session.user.name} ติดตามความคืบหน้าการพัฒนาทักษะได้ที่นี่</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
                    <CardHeader className="p-8 pb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-500">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl font-bold">สำรวจหลักสูตร</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <p className="text-[13px] text-slate-500 mb-8 font-medium leading-relaxed">
                            เรียนรู้และพัฒนาทักษะใหม่ๆ กับกิจกรรมการฝึกอบรมที่พร้อมให้คุณลงทะเบียนและก้าวไปข้างหน้า
                        </p>
                        <Link href="/activities">
                            <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95">
                                ดูรายการอบรม
                            </button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500">
                    <CardHeader className="p-8 pb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform duration-500">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl font-bold">งานที่ต้องส่ง</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <p className="text-[13px] text-slate-500 mb-8 font-medium leading-relaxed">
                            อัปโหลดผลงานและติดตามสถานะการประเมินวิทยสถานะ รวมถึงรับข้อเสนอแนะเพื่อพัฒนาต่อยอด
                        </p>
                        <Link href="/my-activities">
                            <button className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all active:scale-95">
                                ส่งผลงาน / ดูสถานะ
                            </button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden group hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500">
                    <CardHeader className="p-8 pb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform duration-500">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl font-bold">ประกาศนียบัตร</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <p className="text-[13px] text-slate-500 mb-8 font-medium leading-relaxed">
                            รวบรวมเกียรติบัตรและวุฒิบัตรอิเล็กทรอนิกส์ทั้งหมดที่คุณได้รับจากการเข้าร่วมกิจกรรมสำเร็จ
                        </p>
                        <Link href="/my-certificates">
                            <button className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 transition-all active:scale-95">
                                ตรวจสอบวุฒิบัตร
                            </button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-sm rounded-xl p-8 text-center mt-8">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-slate-200">
                    <ClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">ต้องการความช่วยเหลือเพิ่มเติม?</h3>
                <p className="text-[13px] text-slate-500 mb-8 font-medium leading-relaxed max-w-md mx-auto">
                    หากคุณพบปัญหาในการใช้งานระบบ หรือมีข้อสงสัยเกี่ยวกับหลักสูตรการพัฒนาบุคลากร
                    ทีมสนับสนุนของ OVEC PLATFORM ยินดีให้บริการทุกเมื่อ
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link href="/settings">
                        <button className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 transition-all shadow-sm active:scale-95">
                            ตั้งค่าข้อมูลส่วนตัว
                        </button>
                    </Link>
                    <button className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95">
                        ติดต่อฝ่ายสนับสนุน
                    </button>
                </div>
            </Card>
        </div>
    );
}
