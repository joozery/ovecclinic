import { getManuals } from "@/actions/manual";
import { ManualActions } from "@/components/admin/manual-actions";
import { ManualForm } from "@/components/admin/manual-form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default async function AdminManualPage() {
    const session = await auth();

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        redirect("/dashboard");
    }

    const manuals = await getManuals();

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden bg-[#1a237e] p-8 md:p-10 rounded-2xl shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-100 text-[9px] font-bold uppercase tracking-widest">
                            <BookOpen className="w-3 h-3" /> User Manual Guide
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                            จัดการคู่มือการใช้งาน<span className="text-blue-400">.</span>
                        </h1>
                        <p className="text-blue-100/70 font-medium text-sm">
                            เพิ่มหรือแก้ไขคำอธิบายขั้นตอนการใช้งานบนเว็บ
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-4 px-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold gap-2">
                            <Plus className="w-4 h-4" /> เพิ่มขั้นตอนใหม่
                        </Button>
                    </DialogTrigger>
                    {/* Add Dialog */}
                    <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl rounded-[32px] p-8 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 space-y-1">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                เชื่อมคู่มือขั้นตอนใหม่
                            </h2>
                            <p className="text-slate-500 text-sm font-medium">
                                เพิ่มหัวข้อ คำอธิบาย และรูปภาพเพื่ออธิบายขั้นตอนในหน้าคู่มือ
                            </p>
                        </div>

                        <ManualForm />
                        <div className="h-4"></div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden mt-6">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-black text-slate-700 h-14 pl-8 text-xs uppercase tracking-wider w-16 text-center">ลำดับ</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider w-32">รูปภาพ</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider">หัวข้อ</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider text-center">สถานะ</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider text-right pr-8">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {manuals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-slate-400 font-medium pb-20 pt-16">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                                <BookOpen className="w-8 h-8" />
                                            </div>
                                            <p className="text-lg font-bold text-slate-900 leading-tight">ยังไม่มีคู่มือการใช้งาน</p>
                                            <p className="text-sm">เพิ่มลําดับขั้นตอนให้ผู้ใช้งานได้ศึกษา</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                manuals.map((manual: any) => (
                                    <TableRow key={manual._id} className="hover:bg-slate-50/60 transition-colors border-slate-50">
                                        <TableCell className="py-4 pl-8 text-center">
                                            <span className="font-bold text-slate-900 bg-slate-100 w-8 h-8 inline-flex items-center justify-center rounded-xl">{manual.order}</span>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            {manual.imageUrl ? (
                                                <div className="relative w-24 h-16 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                                                    <Image src={manual.imageUrl} alt={manual.title} fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-16 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold p-2 text-center leading-tight shadow-sm">
                                                    ไม่มีรูปภาพ
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="py-4 min-w-[200px]">
                                            <p className="font-bold text-slate-900 text-sm leading-tight mb-1">{manual.title}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2 md:w-[400px]">{manual.description}</p>
                                        </TableCell>

                                        <TableCell className="py-4 text-center">
                                            <Badge variant="secondary" className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${manual.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {manual.isActive ? 'แสดงผล' : 'ซ่อน'}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="py-4 text-right pr-8">
                                            <ManualActions manual={manual} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
