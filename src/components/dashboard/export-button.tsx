
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportSystemData } from "@/actions/stats";
import { toast } from "sonner";

import { ArrowRight } from "lucide-react";

export function ExportButton({ variant }: { variant?: "default" | "dashboard" }) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const csvContent = await exportSystemData();
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `รายงาน_OVEC_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("ดาวน์โหลดรายงานเรียบร้อยแล้ว");
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถส่งออกข้อมูลได้");
        } finally {
            setIsExporting(false);
        }
    };

    if (variant === "dashboard") {
        return (
            <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full h-14 flex items-center justify-between px-5 bg-slate-50 hover:bg-orange-50/50 rounded-2xl border border-slate-100 hover:border-orange-200 transition-all group disabled:opacity-50"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm transition-transform group-hover:scale-110">
                        {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    </div>
                    <span className="text-sm font-black text-slate-700">{isExporting ? "กำลังประมวลผล..." : "ออกรายงานระบบ"}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform group-hover:text-orange-500" />
            </button>
        );
    }

    return (
        <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังส่งออก...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" /> ส่งออกรายงาน (CSV)
                </>
            )}
        </Button>
    );
}
