
"use client";

import { useState, useTransition } from "react";
import { issueCertificate } from "@/actions/certificate";
import { Button } from "@/components/ui/button";
import { Loader2, Award, CheckCircle, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

interface CertificateActionsProps {
    registrationId: string;
    isApproved: boolean;
    existingCertificateCode?: string;
}

export function CertificateActions({ registrationId, isApproved, existingCertificateCode }: CertificateActionsProps) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleIssue = () => {
        startTransition(async () => {
            try {
                await issueCertificate(registrationId);
                toast.success("ออกเกียรติบัตรสำเร็จ!");
                setOpen(false);
                router.refresh();
            } catch (error) {
                toast.error("ออกเกียรติบัตรไม่สำเร็จ: " + (error as Error).message);
            }
        });
    };

    // ---- ยังไม่อนุมัติ ----
    if (!isApproved) {
        return (
            <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-600">ยังไม่สามารถออกเกียรติบัตรได้</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        ต้องอนุมัติผลงานก่อน จึงจะออกเกียรติบัตรได้
                    </p>
                </div>
            </div>
        );
    }

    // ---- ออกแล้ว ----
    if (existingCertificateCode) {
        return (
            <div className="flex items-center gap-3 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-emerald-800">ออกเกียรติบัตรแล้ว</p>
                    <p className="text-[11px] text-emerald-600 font-mono mt-0.5 truncate">
                        รหัส: {existingCertificateCode}
                    </p>
                </div>
            </div>
        );
    }

    // ---- พร้อมออก ----
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="w-full flex items-center gap-3 p-5 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-100 transition-all group text-left">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center shrink-0 transition-colors">
                        <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-blue-800">ออกเกียรติบัตร</p>
                        <p className="text-[11px] text-blue-500 font-medium mt-0.5">
                            คลิกเพื่อออกเกียรติบัตรให้ผู้เข้ารับการอบรม
                        </p>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                        <Award className="w-3.5 h-3.5 text-white" />
                    </div>
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden gap-0">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#1a237e] to-blue-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="relative">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                            <Award className="w-8 h-8 text-yellow-300" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-white mb-1">
                            ออกเกียรติบัตร
                        </DialogTitle>
                        <DialogDescription className="text-blue-200 text-sm font-medium">
                            ยืนยันการออกเกียรติบัตรสำหรับผู้เข้ารับการอบรม
                        </DialogDescription>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-amber-700 leading-relaxed">
                            เมื่อออกเกียรติบัตรแล้ว <strong>ไม่สามารถยกเลิก</strong>ได้ เกียรติบัตรจะปรากฏในหน้า
                            "เกียรติบัตรของฉัน" ของผู้เข้ารับการอบรมทันที
                        </p>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 bg-slate-50 rounded-2xl p-4">
                        <p className="flex items-center gap-2 font-medium">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ระบบจะสร้างรหัสเกียรติบัตรโดยอัตโนมัติ
                        </p>
                        <p className="flex items-center gap-2 font-medium">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ผู้รับสามารถตรวจสอบและดาวน์โหลดได้ทันที
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-8 pb-8 flex gap-3">
                    <DialogClose asChild>
                        <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" disabled={isPending}>
                            ยกเลิก
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleIssue}
                        disabled={isPending}
                        className="flex-1 h-12 rounded-xl bg-[#1a237e] hover:bg-[#151b60] font-bold shadow-lg shadow-indigo-100 transition-all"
                    >
                        {isPending ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังออกเกียรติบัตร...</>
                        ) : (
                            <><Award className="mr-2 h-4 w-4" /> ยืนยันออกเกียรติบัตร</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
