
"use client";

import { useState, useTransition } from "react";
import { submitIssueReport } from "@/actions/issue";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquareWarning, ChevronRight, CheckCircle2 } from "lucide-react";

const categories = [
    { value: "bug", label: "🐛 พบข้อผิดพลาด / บัก" },
    { value: "account", label: "👤 ปัญหาเกี่ยวกับบัญชี" },
    { value: "activity", label: "📅 ปัญหาเกี่ยวกับกิจกรรม" },
    { value: "certificate", label: "🎓 ปัญหาเกี่ยวกับเกียรติบัตร" },
    { value: "other", label: "💬 อื่นๆ / สอบถามทั่วไป" },
];

interface ReportIssueButtonProps {
    isCollapsed?: boolean;
}

export function ReportIssueButton({ isCollapsed }: ReportIssueButtonProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [done, setDone] = useState(false);

    const [form, setForm] = useState({
        category: "bug",
        subject: "",
        message: "",
    });

    const handleSubmit = () => {
        if (!form.subject.trim() || !form.message.trim()) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        startTransition(async () => {
            try {
                await submitIssueReport(form);
                setDone(true);
            } catch (error) {
                toast.error("เกิดข้อผิดพลาด: " + (error as Error).message);
            }
        });
    };

    const handleReset = () => {
        setDone(false);
        setForm({ category: "bug", subject: "", message: "" });
        setOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all group ${isCollapsed ? "justify-center" : ""
                    }`}
            >
                <MessageSquareWarning className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                {!isCollapsed && (
                    <span className="flex-1 text-left">แจ้งปัญหา / ติดต่อแอดมิน</span>
                )}
            </button>

            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) handleReset(); }}>
                <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden gap-0">

                    {/* Header */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 p-7 text-white relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
                        <div className="relative">
                            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                                <MessageSquareWarning className="w-6 h-6 text-white" />
                            </div>
                            <DialogTitle className="text-xl font-black text-white">แจ้งปัญหา / ติดต่อแอดมิน</DialogTitle>
                            <DialogDescription className="text-orange-100 text-sm font-medium mt-1">
                                ทีมงานจะตอบกลับโดยเร็วที่สุด
                            </DialogDescription>
                        </div>
                    </div>

                    {!done ? (
                        /* Form */
                        <div className="p-6 space-y-4">
                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                    ประเภทปัญหา
                                </label>
                                <div className="grid gap-2">
                                    {categories.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, category: c.value })}
                                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-bold text-left transition-all ${form.category === c.value
                                                ? "bg-orange-50 border-orange-300 text-orange-700"
                                                : "bg-white border-slate-100 text-slate-600 hover:border-orange-200 hover:bg-orange-50/50"
                                                }`}
                                        >
                                            <span>{c.label}</span>
                                            {form.category === c.value && (
                                                <ChevronRight className="w-4 h-4 text-orange-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                    หัวข้อ
                                </label>
                                <input
                                    type="text"
                                    placeholder="เช่น ไม่สามารถลงทะเบียนกิจกรรมได้"
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm font-medium placeholder:text-slate-300 transition-all"
                                />
                            </div>

                            {/* Message */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                    รายละเอียด
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="อธิบายปัญหาที่พบ หรือข้อความที่ต้องการส่งถึงแอดมิน..."
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm font-medium placeholder:text-slate-300 transition-all resize-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <DialogClose asChild>
                                    <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold" disabled={isPending}>
                                        ยกเลิก
                                    </Button>
                                </DialogClose>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isPending}
                                    className="flex-1 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold shadow-md shadow-orange-100 transition-all"
                                >
                                    {isPending ? (
                                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> กำลังส่ง...</>
                                    ) : (
                                        "ส่งเรื่องแจ้ง"
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Success state */
                        <div className="p-10 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center">
                                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 mb-1">ส่งเรื่องแจ้งแล้ว!</p>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    ทีมงานได้รับเรื่องแจ้งของคุณแล้ว<br />
                                    และจะดำเนินการตอบกลับโดยเร็วที่สุด
                                </p>
                            </div>
                            <Button onClick={handleReset} className="w-full h-11 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 mt-2">
                                ปิด
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
