
"use client";

import { useState, useTransition } from "react";
import { registerForActivity, cancelRegistrationByActivityId } from "@/actions/registration";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

interface RegisterButtonProps {
    activityId: string;
    isRegistered: boolean;
    isFull: boolean;
    disabled?: boolean;
}

export function RegisterButton({ activityId, isRegistered, isFull, disabled }: RegisterButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const router = useRouter();

    const handleRegister = () => {
        startTransition(async () => {
            try {
                await registerForActivity(activityId);
                toast.success("ลงทะเบียนสำเร็จแล้ว!");
                router.refresh();
            } catch (error) {
                toast.error("เกิดข้อผิดพลาด: " + (error as Error).message);
            }
        });
    };

    const handleCancel = () => {
        startTransition(async () => {
            try {
                await cancelRegistrationByActivityId(activityId);
                toast.success("ยกเลิกการลงทะเบียนเรียบร้อยแล้ว");
                setConfirmOpen(false);
                router.refresh();
            } catch (error) {
                toast.error("เกิดข้อผิดพลาด: " + (error as Error).message);
            }
        });
    };

    // ---- ลงทะเบียนแล้ว ----
    if (isRegistered) {
        return (
            <>
                <Button
                    onClick={() => setConfirmOpen(true)}
                    disabled={isPending}
                    variant="outline"
                    className="w-full h-10 rounded-lg bg-emerald-50 text-emerald-700 border-emerald-100 font-bold text-xs uppercase tracking-wider gap-2 group hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-all"
                >
                    {isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <>
                            <Check className="w-3 h-3 group-hover:hidden" />
                            <X className="w-3 h-3 hidden group-hover:block" />
                            <span className="group-hover:hidden">ลงทะเบียนแล้ว</span>
                            <span className="hidden group-hover:block">ยกเลิกการลงทะเบียน</span>
                        </>
                    )}
                </Button>

                {/* Dialog ยืนยันยกเลิก */}
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent className="sm:max-w-sm rounded-3xl p-0 overflow-hidden gap-0">
                        {/* Header */}
                        <div className="bg-red-50 border-b border-red-100 p-6 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-red-800 leading-tight">
                                    ยืนยันการยกเลิกการลงทะเบียน
                                </DialogTitle>
                                <DialogDescription className="text-[13px] text-red-500 font-medium mt-1 leading-relaxed">
                                    คุณจะสูญเสียที่นั่งในกิจกรรมนี้<br />
                                    หากต้องการกลับมาต้องสมัครใหม่อีกครั้ง
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Footer */}
                        <DialogFooter className="p-5 bg-white flex flex-row gap-3">
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-10 rounded-xl font-bold text-sm"
                                    disabled={isPending}
                                >
                                    ไม่ยกเลิก
                                </Button>
                            </DialogClose>
                            <Button
                                onClick={handleCancel}
                                disabled={isPending}
                                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-sm shadow-md shadow-red-100"
                            >
                                {isPending ? (
                                    <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> กำลังยกเลิก...</>
                                ) : (
                                    "ยืนยันยกเลิก"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    // ---- เต็มแล้ว ----
    if (isFull) {
        return (
            <Button variant="secondary" disabled className="w-full h-10 rounded-lg font-bold text-xs">
                กิจกรรมเต็มแล้ว
            </Button>
        );
    }

    // ---- ยังไม่ลงทะเบียน ----
    return (
        <Button
            className="w-full h-10 rounded-lg bg-[#1a237e] hover:bg-[#151b60] shadow-md font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
            onClick={handleRegister}
            disabled={isPending || disabled}
        >
            {isPending ? (
                <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> กำลังดำเนินการ...</>
            ) : (
                "ลงทะเบียนกิจกรรมนี้"
            )}
        </Button>
    );
}
