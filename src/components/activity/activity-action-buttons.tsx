
"use client";

import { useState } from "react";
import { Bell, Share2, BellOff, Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";

interface ActivityActionButtonsProps {
    activityId: string;
    activityTitle: string;
}

export function ActivityActionButtons({ activityId, activityTitle }: ActivityActionButtonsProps) {
    const [reminded, setReminded] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== "undefined"
        ? `${window.location.origin}/activities/${activityId}`
        : `/activities/${activityId}`;

    // ---- แจ้งเตือน ----
    const handleRemind = () => {
        if (reminded) {
            setReminded(false);
            toast.info("ยกเลิกการแจ้งเตือนแล้ว");
            return;
        }

        // ถ้า browser รองรับ Notification API
        if ("Notification" in window) {
            Notification.requestPermission().then((perm) => {
                if (perm === "granted") {
                    setReminded(true);
                    toast.success("เปิดการแจ้งเตือนกิจกรรมแล้ว 🔔");
                } else {
                    toast.error("กรุณาอนุญาตการแจ้งเตือนในการตั้งค่าเบราว์เซอร์");
                }
            });
        } else {
            // fallback — บันทึกใน localStorage
            setReminded(true);
            toast.success("บันทึกการแจ้งเตือนเรียบร้อยแล้ว 🔔");
        }
    };

    // ---- คัดลอกลิงก์ ----
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("คัดลอกลิงก์แล้ว!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("ไม่สามารถคัดลอกได้");
        }
    };

    // ---- แชร์ผ่าน Web Share API ----
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: activityTitle,
                    text: `ขอเชิญเข้าร่วมกิจกรรมนิเทศ: ${activityTitle}`,
                    url: shareUrl,
                });
            } catch {
                // user dismissed
            }
        } else {
            setShareOpen(true);
        }
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                {/* ปุ่มแจ้งเตือน */}
                <Button
                    variant="outline"
                    onClick={handleRemind}
                    className={`h-10 rounded-xl font-bold text-xs gap-2 transition-all ${reminded
                            ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                            : "border-slate-100 hover:border-amber-200 hover:text-amber-600"
                        }`}
                >
                    {reminded ? (
                        <><BellOff className="w-3.5 h-3.5" /> แจ้งเตือนแล้ว</>
                    ) : (
                        <><Bell className="w-3.5 h-3.5" /> แจ้งเตือน</>
                    )}
                </Button>

                {/* ปุ่มแชร์ */}
                <Button
                    variant="outline"
                    onClick={handleNativeShare}
                    className="h-10 rounded-xl font-bold text-xs gap-2 border-slate-100 hover:border-blue-200 hover:text-blue-600 transition-all"
                >
                    <Share2 className="w-3.5 h-3.5" /> แชร์
                </Button>
            </div>

            {/* Share Dialog (fallback สำหรับ desktop) */}
            <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogContent className="sm:max-w-sm rounded-3xl p-0 overflow-hidden gap-0">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white">
                        <DialogTitle className="text-lg font-black mb-1">แชร์กิจกรรมนี้</DialogTitle>
                        <DialogDescription className="text-blue-200 text-sm font-medium line-clamp-2">
                            {activityTitle}
                        </DialogDescription>
                    </div>

                    <div className="p-5 space-y-3">
                        {/* ลิงก์ */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                            <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-xs text-slate-500 font-medium flex-1 truncate">{shareUrl}</span>
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shrink-0"
                            >
                                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                            </button>
                        </div>

                        {/* Share to platforms */}
                        <div className="grid grid-cols-2 gap-2">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 p-3 bg-[#1877f2] hover:bg-[#1565c0] text-white rounded-2xl text-xs font-bold transition-all"
                            >
                                Facebook
                            </a>
                            <a
                                href={`https://line.me/R/share?text=${encodeURIComponent(activityTitle + "\n" + shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 p-3 bg-[#06c755] hover:bg-[#059844] text-white rounded-2xl text-xs font-bold transition-all"
                            >
                                LINE
                            </a>
                        </div>

                        <DialogClose asChild>
                            <button className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                                ปิด
                            </button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
