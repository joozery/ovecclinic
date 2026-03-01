
import { getAssignedSubmissions } from "@/actions/submission";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { FileText, User as UserIcon, LinkIcon, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function SupervisionDashboard() {
    const session = await auth();

    if (!session || (session.user.role !== 'supervisor' && session.user.role !== 'super_admin' && session.user.role !== 'admin')) {
        redirect("/dashboard");
    }

    const submissions = await getAssignedSubmissions();

    // Simple stats
    const pendingCount = submissions.filter((s: any) => s.status === 'Pending').length;
    const approvedCount = submissions.filter((s: any) => s.status === 'Approved').length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">การตรวจผลงาน</h1>
                    <p className="text-sm text-slate-500">จัดการและตรวจสอบผลงานที่ส่งมาจากผู้เข้ารับการอบรม</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-5 py-3 flex flex-col items-center justify-center bg-orange-50/50 rounded-2xl border border-orange-100 min-w-[120px]">
                        <span className="text-2xl font-black text-orange-600 leading-none">{pendingCount}</span>
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mt-1.5">รอการตรวจ</span>
                    </div>
                    <div className="px-5 py-3 flex flex-col items-center justify-center bg-emerald-50/50 rounded-2xl border border-emerald-100 min-w-[120px]">
                        <span className="text-2xl font-black text-emerald-600 leading-none">{approvedCount}</span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-1.5">อนุมัติแล้ว</span>
                    </div>
                </div>
            </div>

            <Card className="border-none bg-white/80 backdrop-blur-sm shadow-sm rounded-[2rem] overflow-hidden">
                <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-xl font-bold">รายการผลงานล่าสุด</CardTitle>
                    <CardDescription>แสดงรายการผลงานทั้งหมดที่ส่งมาจากครูและบุคลากร</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="rounded-2xl border border-slate-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold text-slate-900 h-12">กิจกรรม</TableHead>
                                    <TableHead className="font-bold text-slate-900 h-12">ผู้ส่งงาน</TableHead>
                                    <TableHead className="font-bold text-slate-900 h-12">วันที่ส่ง</TableHead>
                                    <TableHead className="font-bold text-slate-900 h-12">สถานะ</TableHead>
                                    <TableHead className="text-right font-bold text-slate-900 h-12">การดำเนินการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((submission: any) => (
                                    <TableRow key={submission._id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-bold text-slate-900 py-4">
                                            {submission.activityId?.title || 'ไม่พบชื่อกิจกรรม'}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{submission.userId?.name}</span>
                                                <span className="text-[11px] text-slate-400 font-medium">{submission.userId?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-sm text-slate-600 font-medium">
                                            {format(new Date(submission.submittedAt), "dd MMM, HH:mm น.")}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
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
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                            <Link href={`/supervision/${submission._id}`}>
                                                <button className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 transition-all active:scale-95 shadow-sm">
                                                    ตรวจประเมิน
                                                </button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {submissions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="w-8 h-8 text-slate-100" />
                                                ยังไม่มีการส่งผลงานในขณะนี้
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
