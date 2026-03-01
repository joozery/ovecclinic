
"use client";

import { useState, useTransition } from "react";
import { cancelRegistration } from "@/actions/registration";
import { Loader2, AlertTriangle, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface CancelButtonProps {
    registrationId: string;
}

export function CancelButton({ registrationId }: CancelButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleCancel = () => {
        startTransition(async () => {
            try {
                await cancelRegistration(registrationId);
                toast.success("ยกเลิกการลงทะเบียนเรียบร้อยแล้ว");
                setOpen(false);
                router.refresh();
            } catch (error) {
                toast.error("ยกเลิกไม่สำเร็จ: " + (error as Error).message);
            }
        });
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setOpen(true)}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
                <X className="w-3.5 h-3.5" />
                ยกเลิก
            </button>

            {/* Confirmation Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
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
