"use client";

import { useEffect, useState, useTransition } from "react";
import { getIssueReports, updateIssueStatus } from "@/actions/issue";
import {
    MessageSquareWarning,
    Loader2,
    User,
    Mail,
    Clock,
    Tag,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Info,
    Search,
    Filter,
    MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";

const statusConfig = {
    open: { label: "รอดำเนินการ", color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
    in_progress: { label: "กำลังดำเนินการ", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Info },
    resolved: { label: "แก้ไขแล้ว", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    closed: { label: "ปิดแล้ว", color: "bg-slate-100 text-slate-700 border-slate-200", icon: ChevronRight },
};

const categoryLabels: Record<string, string> = {
    bug: "🐛 พบข้อผิดพลาด",
    account: "👤 บัญชีผู้ใช้",
    activity: "📅 กิจกรรม",
    certificate: "🎓 วุฒิบัตร",
    other: "💬 อื่นๆ",
};

export default function AdminIssuesPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [adminNote, setAdminNote] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const data = await getIssueReports();
            setReports(data || []);
        } catch (error) {
            toast.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = (status: string) => {
        if (!selectedReport) return;

        startTransition(async () => {
            try {
                const res = await updateIssueStatus(selectedReport._id, status, adminNote);
                if (res.success) {
                    toast.success("อัปเดตสถานะเรียบร้อยแล้ว");
                    setReports(prev => prev.map(r =>
                        r._id === selectedReport._id ? { ...r, status, adminNote } : r
                    ));
                    setSelectedReport(null);
                    setAdminNote("");
                }
            } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการอัปเดต");
            }
        });
    };

    const filteredReports = reports.filter(r => {
        const matchesStatus = filterStatus === "all" || r.status === filterStatus;
        const matchesSearch =
            r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <MessageSquareWarning className="w-8 h-8 text-orange-500" />
                        รายการแจ้งปัญหาและสอบถาม
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">จัดการคำร้องและปัญหาที่แจ้งเข้ามาจากผู้ใช้งาน</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={cn(
                            "px-4 py-2 text-sm font-bold rounded-xl transition-all",
                            filterStatus === "all" ? "bg-slate-900 text-white shadow-md shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        ทั้งหมด
                    </button>
                    {Object.entries(statusConfig).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setFilterStatus(key)}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-xl transition-all",
                                filterStatus === key ? (config as any).color : "text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            {(config as any).label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Box */}
            <div className="relative group max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="ค้นหาตามหัวข้อ, ชื่อผู้แจ้ง หรืออีเมล..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 font-medium transition-all"
                />
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-4">
                {filteredReports.length > 0 ? (
                    filteredReports.map((report) => {
                        const config = (statusConfig as any)[report.status] || statusConfig.open;
                        const StatusIcon = config.icon;

                        return (
                            <Card
                                key={report._id}
                                className="group rounded-2xl border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all duration-300 overflow-hidden bg-white cursor-pointer"
                                onClick={() => {
                                    setSelectedReport(report);
                                    setAdminNote(report.adminNote || "");
                                }}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row lg:items-center">
                                        {/* Status Bar (Side on Desktop) */}
                                        <div className={cn("lg:w-1.5 lg:h-auto h-1.5", config.color)} />

                                        <div className="p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                            {/* Info Section */}
                                            <div className="lg:col-span-1">
                                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-1", config.color)}>
                                                    <StatusIcon className="w-6 h-6" />
                                                </div>
                                            </div>

                                            <div className="lg:col-span-5 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={cn("font-bold text-[10px] uppercase tracking-wider py-0.5", config.color)}>
                                                        {config.label}
                                                    </Badge>
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold text-[10px]">
                                                        {categoryLabels[report.category] || report.category}
                                                    </Badge>
                                                </div>
                                                <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                                                    {report.subject}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {format(new Date(report.createdAt), 'd MMM yyyy, HH:mm', { locale: th })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* User Section */}
                                            <div className="lg:col-span-4 border-l border-slate-100 pl-6 space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                                                        {report.userId?.name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none">{report.userId?.name || 'ไม่ทราบชื่อ'}</p>
                                                        <p className="text-[11px] font-bold text-slate-400 mt-1">{report.userId?.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions Section */}
                                            <div className="lg:col-span-2 flex justify-end">
                                                <Button variant="ghost" className="rounded-xl font-bold gap-2 text-slate-400 group-hover:text-blue-600">
                                                    ดูรายละเอียด
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <MessageSquareWarning className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">ไม่พบรายการที่แจ้งเข้ามา</h3>
                        <p className="text-slate-500 font-medium">ลองเปลี่ยนตัวกรองหรือคำค้นหาใหม่</p>
                    </div>
                )}
            </div>

            {/* Details Dialog */}
            <Dialog open={!!selectedReport} onOpenChange={(o) => !o && setSelectedReport(null)}>
                <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-slate-900 p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <MessageSquareWarning className="w-32 h-32" />
                        </div>
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className={cn("font-bold text-[10px] uppercase", (statusConfig as any)[selectedReport?.status]?.color)}>
                                    {(statusConfig as any)[selectedReport?.status]?.label}
                                </Badge>
                                <Badge className="bg-white/10 text-white font-bold text-[10px]">
                                    {categoryLabels[selectedReport?.category]}
                                </Badge>
                            </div>
                            <DialogTitle className="text-2xl font-black text-white leading-tight">
                                {selectedReport?.subject}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 font-medium mt-2 flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {selectedReport && format(new Date(selectedReport.createdAt), 'EEEEที่ d MMMM yyyy เวลา HH:mm', { locale: th })}
                                </span>
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
                        {/* Requester Info */}
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-900 font-black text-lg border border-slate-200 shadow-sm">
                                {selectedReport?.userId?.name?.[0] || 'U'}
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ผู้แจ้งปัญหา</p>
                                <p className="text-base font-black text-slate-900 leading-tight">{selectedReport?.userId?.name}</p>
                                <p className="text-sm font-bold text-blue-600 mt-0.5">{selectedReport?.userId?.email}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" /> รายละเอียดปัญหา
                            </label>
                            <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                {selectedReport?.message}
                            </div>
                        </div>

                        {/* Admin Action */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquareWarning className="w-3.5 h-3.5" /> บันทึกจากแอดมิน / การดำเนินการ
                            </label>
                            <Textarea
                                placeholder="บันทึกข้อมูลการตรวจสอบ หรือคำชี้แจงเพื่อปิดเคส..."
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                className="rounded-2xl border-2 border-slate-100 focus:border-blue-400 h-32 font-medium"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex gap-2">
                        <Button
                            variant="ghost"
                            className="font-black text-slate-500 rounded-xl"
                            onClick={() => setSelectedReport(null)}
                        >
                            ยกเลิก
                        </Button>

                        <div className="flex gap-2 flex-1 justify-end">
                            {selectedReport?.status !== 'resolved' && (
                                <Button
                                    onClick={() => handleUpdateStatus('resolved')}
                                    disabled={isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl gap-2 px-6"
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    แก้ไขเรียบร้อยแล้ว
                                </Button>
                            )}
                            {selectedReport?.status === 'resolved' && (
                                <Button
                                    onClick={() => handleUpdateStatus('closed')}
                                    disabled={isPending}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl gap-2 px-6"
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                                    ปิดเคส
                                </Button>
                            )}
                            {selectedReport?.status === 'open' && (
                                <Button
                                    onClick={() => handleUpdateStatus('in_progress')}
                                    disabled={isPending}
                                    variant="outline"
                                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-black rounded-xl px-6"
                                >
                                    เริ่มดำเนินการ
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
