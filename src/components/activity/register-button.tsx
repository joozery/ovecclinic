
"use client";

import { useTransition } from "react";
import { registerForActivity, cancelRegistrationByActivityId } from "@/actions/registration";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RegisterButtonProps {
    activityId: string;
    isRegistered: boolean;
    isFull: boolean;
    disabled?: boolean;
}

export function RegisterButton({ activityId, isRegistered, isFull, disabled }: RegisterButtonProps) {
    const [isPending, startTransition] = useTransition();
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
        if (!confirm("ยืนยันการยกเลิกการลงทะเบียน?")) return;

        startTransition(async () => {
            try {
                await cancelRegistrationByActivityId(activityId);
                toast.success("ยกเลิกการลงทะเบียนเรียบร้อยแล้ว");
                router.refresh();
            } catch (error) {
                toast.error("เกิดข้อผิดพลาด: " + (error as Error).message);
            }
        });
    };

    if (isRegistered) {
        return (
            <Button
                onClick={handleCancel}
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
        );
    }

    if (isFull) {
        return (
            <Button variant="secondary" disabled className="w-full h-10 rounded-lg font-bold text-xs">
                กิจกรรมเต็มแล้ว
            </Button>
        );
    }

    return (
        <Button
            className="w-full h-10 rounded-lg bg-[#1a237e] hover:bg-[#151b60] shadow-md font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
            onClick={handleRegister}
            disabled={isPending || disabled}
        >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-3 h-3 animate-spin" /> กำลังดำเนินการ...
                </>
            ) : (
                "ลงทะเบียนกิจกรรมนี้"
            )}
        </Button>
    );
}
