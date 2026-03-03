
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSystemStats, getMonthlyStats } from "@/actions/stats";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/dashboard/export-button";
import Link from "next/link";
import { Calendar, GraduationCap, ClipboardCheck, ArrowRight, Activity, Plus } from "lucide-react";


export default async function DashboardPage({
    searchParams
}: {
    searchParams: Promise<{ fy?: string; month?: string }>;
}) {
    const params = await searchParams;
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const role = session.user.role;
    const isAdmin = role === 'admin' || role === 'super_admin' || role === 'supervisor';

    if (isAdmin) {
        const filters = { month: params.month, fy: params.fy };
        const systemStats = await getSystemStats(filters);
        const monthlyStats = await getMonthlyStats({ fy: params.fy });

        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-sm p-8 rounded-xl border border-slate-100 shadow-sm transition-all hover:bg-white/60">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">แผงควบคุมระบบ<span className="text-blue-600">.</span></h1>
                        <p className="text-sm font-medium text-slate-500">ติดตามค่าสถิติ (KPI) และเป้าหมายของแพลตฟอร์ม</p>
                    </div>
                </div>

                {/* Filters Section */}
                <DashboardFilters />

                <StatsCards data={{ ...systemStats, supervisors: systemStats.supervisorsCount }} />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4 border-none bg-white/80 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-blue-500/5">
                        <CardHeader className="p-8 pb-0">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                แนวโน้มรายเดือน
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">เปรียบเทียบจำนวนการลงทะเบียนย้อนหลังของปีงบประมาณ</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pl-2">
                            <OverviewChart data={monthlyStats} />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-3 border-none bg-white/80 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-blue-500/5">
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                ปุ่มลัดอัจฉริยะ
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">จัดการภารกิจสำคัญได้อย่างรวดเร็วในคลิกเดียว</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 grid gap-3">
                            <Link href="/activities/manage/create">
                                <button className="w-full h-14 flex items-center justify-between px-5 bg-slate-50 hover:bg-blue-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover:scale-110">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-black text-slate-700">สร้างกิจกรรมใหม่</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform group-hover:text-blue-500" />
                                </button>
                            </Link>

                            <Link href="/activities/manage">
                                <button className="w-full h-14 flex items-center justify-between px-5 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover:scale-110">
                                            <div className="grid grid-cols-2 gap-0.5">
                                                <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
                                                <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
                                                <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
                                                <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-slate-700">รายการกิจกรรมทั้งหมด</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform group-hover:text-emerald-500" />
                                </button>
                            </Link>

                            <div className="relative">
                                <ExportButton variant="dashboard" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Breakdowns */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Supervisors Breakdown */}
                    <Card className="border-none bg-white shadow-sm rounded-2xl">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-400">ผลงานศึกษานิเทศก์</CardTitle>
                            <CardDescription className="text-xs font-bold">ศึกษานิเทศก์ที่มีจำนวนการนิเทศสูงสุด</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-4">
                            {systemStats.breakdowns.supervisors.map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black text-slate-800">{s.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{s.unit}</p>
                                    </div>
                                    <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black">
                                        {s.count} ครั้ง
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Organizing Units Breakdown */}
                    <Card className="border-none bg-white shadow-sm rounded-2xl">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-400">หน่วยงานที่จัดนิเทศ</CardTitle>
                            <CardDescription className="text-xs font-bold">สรุปตามสังกัด/หน่วยงานต้นสังกัด</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-4">
                            {systemStats.breakdowns.units.map((u, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <p className="text-xs font-black text-slate-800">{u.name}</p>
                                    <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black">
                                        {u.count} รายการ
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Teachers Breakdown */}
                    <Card className="border-none bg-white shadow-sm rounded-2xl">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-400">ครูที่เข้าร่วมนิเทศสูงสุด</CardTitle>
                            <CardDescription className="text-xs font-bold">นับตามจำนวนครั้งที่ลงทะเบียนสำเร็จ</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-4">
                            {systemStats.breakdowns.teachers.map((t, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black text-slate-800">{t.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{t.unit}</p>
                                    </div>
                                    <div className="px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-[10px] font-black">
                                        {t.count} ครั้ง
                                    </div>
                                </div>
                            ))}
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
                        <CardTitle className="text-xl font-bold">สำรวจหัวข้อนิเทศ</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <p className="text-[13px] text-slate-500 mb-8 font-medium leading-relaxed">
                            ยกระดับการจัดการเรียนรู้ ผ่านกระบวนการนิเทศที่สร้างสรรค์และนำไปใช้ได้จริง ร่วมแลกเปลี่ยนประสบการณ์ มุมมอง และรับการชี้แนะเพื่อเสริมสร้างความมั่นใจในการสอน
                        </p>
                        <Link href="/activities">
                            <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95">
                                ดูตารางนัดหมายนิเทศ
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
                            อัปโหลดผลงานและติดตามสถานะการประเมิน รวมถึงรับข้อเสนอแนะเพื่อพัฒนาต่อยอด
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
                        <CardTitle className="text-xl font-bold">เกียรติบัตร</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <p className="text-[13px] text-slate-500 mb-8 font-medium leading-relaxed">
                            รวบรวมเกียรติบัตรอิเล็กทรอนิกส์ทั้งหมดที่คุณได้รับจากการเข้าร่วมกิจกรรมสำเร็จ
                        </p>
                        <Link href="/my-certificates">
                            <button className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 transition-all active:scale-95">
                                ตรวจสอบเกียรติบัตร
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
