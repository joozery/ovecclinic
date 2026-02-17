
import { getSystemStats, getMonthlyStats } from "@/actions/stats";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExportButton } from "@/components/dashboard/export-button";
import { Download, Users, Calendar, LayoutDashboard, Database, Award } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
    const session = await auth();

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin' && session.user.role !== 'supervisor')) {
        redirect("/dashboard");
    }

    const systemStats = await getSystemStats();
    const monthlyStats = await getMonthlyStats();

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-[#1a237e] p-8 md:p-10 rounded-xl shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-100 text-[9px] font-bold uppercase tracking-widest">
                            <Database className="w-3 h-3" /> System Control Center
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                            แผงควบคุมระบบ<span className="text-blue-400">.</span>
                        </h1>
                        <p className="text-blue-100/70 max-w-sm font-medium text-sm leading-relaxed">
                            ภาพรวมการทำงานและตัวชี้วัดสำคัญของแพลตฟอร์ม OVEC
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ExportButton />
                        <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                            <LayoutDashboard className="w-6 h-6 text-white opacity-80" />
                        </div>
                    </div>
                </div>
            </div>

            <StatsCards data={systemStats} />

            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-xl font-black text-slate-900">การเติบโตของระบบ</CardTitle>
                        </div>
                        <CardDescription className="text-sm font-medium text-slate-500 ml-11">สถิติการลงทะเบียนผู้ใช้งานรายเดือนในระบบ</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pl-2">
                        <OverviewChart data={monthlyStats} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="p-8">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <LayoutDashboard className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-xl font-black text-slate-900">กิจกรรมล่าสุด</CardTitle>
                        </div>
                        <CardDescription className="text-sm font-medium text-slate-500 ml-11">ความเคลื่อนไหวล่าสุดที่เกิดขึ้นภายในระบบ</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">มีการลงทะเบียนผู้ใช้ใหม่</p>
                                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-tight">2 นาทีที่ผ่านมา</p>
                                </div>
                                <div className="font-black text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">+1</div>
                            </div>
                            <div className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">สร้างกิจกรรมการอบรมใหม่</p>
                                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-tight">1 ชั่วโมงที่ผ่านมา</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Download className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">ออกวุฒิบัตรอิเล็กทรอนิกส์</p>
                                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-tight">3 ชั่วโมงที่ผ่านมา</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions / Configuration */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <CardHeader className="p-6 pb-2">
                        <Award className="w-8 h-8 text-indigo-100 mb-2 opacity-80" />
                        <CardTitle className="text-lg font-bold">แม่แบบเกียรติบัตร</CardTitle>
                        <CardDescription className="text-indigo-100/60 text-xs">ตั้งค่าลายเซ็นและตราประทับ</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                        <a href="/admin/certificate" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                            จัดการเทมเพลต <Download className="w-3 h-3" />
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
