"use client";

import { useTransition } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { deleteManual } from "@/actions/manual";
import { ManualForm } from "@/components/admin/manual-form";

export function ManualActions({ manual }: { manual: any }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคู่มือขั้นตอนนี้?")) return;

        startTransition(async () => {
            try {
                await deleteManual(manual._id);
                toast.success("ลบคู่มือเรียบร้อยแล้ว");
            } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการลบ");
            }
        });
    };

    return (
        <Dialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 focus-visible:ring-0">
                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DialogTrigger asChild>
                        <DropdownMenuItem className="gap-2 cursor-pointer font-medium text-slate-700">
                            <Edit className="w-4 h-4" /> แก้ไขข้อมูล
                        </DropdownMenuItem>
                    </DialogTrigger>

                    <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isPending}
                        className="text-red-600 gap-2 cursor-pointer font-medium focus:text-red-700 focus:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        {isPending ? "กำลังลบ..." : "ลบข้อมูล"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl rounded-[32px] p-8 max-h-[90vh] overflow-y-auto">
                <div className="mb-6 space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        แก้ไขคู่มือการใช้งาน
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">
                        อัปเดตรายละเอียด หรือรูปภาพของขั้นตอนนี้
                    </p>
                </div>

                <ManualForm initialData={manual} />
                <div className="h-4"></div>
            </DialogContent>
        </Dialog>
    );
}
