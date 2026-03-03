
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export function DashboardFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const month = searchParams.get("month") || "";
    const fiscalYear = searchParams.get("fy") || "";

    const months = [
        { value: "1", label: "มกราคม" },
        { value: "2", label: "กุมภาพันธ์" },
        { value: "3", label: "มีนาคม" },
        { value: "4", label: "เมษายน" },
        { value: "5", label: "พฤษภาคม" },
        { value: "6", label: "มิถุนายน" },
        { value: "7", label: "กรกฎาคม" },
        { value: "8", label: "สิงหาคม" },
        { value: "9", label: "กันยายน" },
        { value: "10", label: "ตุลาคม" },
        { value: "11", label: "พฤศจิกายน" },
        { value: "12", label: "ธันวาคม" },
    ];

    const fiscalYears = [
        { value: "2568", label: "ปีงบประมาณ 2568" },
        { value: "2569", label: "ปีงบประมาณ 2569" },
        { value: "2570", label: "ปีงบประมาณ 2570" },
    ];

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mr-2">
                <Filter className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">ตัวกรองสถิติ:</span>
            </div>

            <div className="w-full sm:w-48">
                <Select value={fiscalYear} onValueChange={(v) => updateFilter("fy", v)}>
                    <SelectTrigger className="h-9 rounded-lg text-xs font-bold border-slate-100 bg-slate-50/50">
                        <SelectValue placeholder="ปีงบประมาณ (ทั้งหมด)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">ปีงบประมาณ (ทั้งหมด)</SelectItem>
                        {fiscalYears.map((fy) => (
                            <SelectItem key={fy.value} value={fy.value}>{fy.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full sm:w-48">
                <Select value={month} onValueChange={(v) => updateFilter("month", v)}>
                    <SelectTrigger className="h-9 rounded-lg text-xs font-bold border-slate-100 bg-slate-50/50">
                        <SelectValue placeholder="เลือกเดือน (ทั้งหมด)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">เลือกเดือน (ทั้งหมด)</SelectItem>
                        {months.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {(month || fiscalYear) && (
                <button
                    onClick={() => {
                        router.push(pathname);
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                    ล้างตัวกรอง
                </button>
            )}
        </div>
    );
}
