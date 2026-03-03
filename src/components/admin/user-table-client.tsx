"use client";

import { useState } from "react";
import { UserActions } from "@/components/admin/user-actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { bulkUpdateUserRole, bulkDeleteUsers } from "@/actions/user";

// Keep PROVIDERS from page.tsx props if necessary, or just re-define/import.
// But we can just pass them or define locally.
const PROVIDERS: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    line: {
        label: "LINE",
        bg: "bg-[#06C755]/10",
        text: "text-[#06C755]",
        icon: (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.03 2 11c0 3.49 2.01 6.54 5.03 8.27l-.63 2.37 2.65-1.35C10.24 20.73 11.11 21 12 21c5.52 0 10-4.03 10-9S17.52 2 12 2z..." />
            </svg>
        ),
    },
    google: {
        label: "Google",
        bg: "bg-red-50",
        text: "text-red-600",
        icon: (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
        ),
    },
    thaid: {
        label: "ThaiD",
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2zm0 2.18L19 8v.1L12 12 5 8.1V8l7-3.82zM5 9.9l7 3.82 7-3.82v6.2L12 19.82 5 16.1V9.9z" />
            </svg>
        ),
    },
    credentials: {
        label: "อีเมล / รหัสผ่าน",
        bg: "bg-slate-50",
        text: "text-slate-600",
        icon: (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
        ),
    },
};

function getProviders(user: any): string[] {
    const providers: string[] = [];
    if (user.providerAccounts?.length > 0) {
        user.providerAccounts.forEach((acc: any) => {
            if (!providers.includes(acc.provider)) providers.push(acc.provider);
        });
    }
    if (providers.length === 0) {
        providers.push("credentials");
    }
    return providers;
}

interface UserTableClientProps {
    users: any[];
    currentUserRole: string;
}

export function UserTableClient({ users, currentUserRole }: UserTableClientProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Bulk action states
    const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [targetRole, setTargetRole] = useState<string>("teacher");
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleSelectAll = () => {
        if (selectedIds.length === users.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(users.map((u) => u._id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selId) => selId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkRoleUpdate = async () => {
        setIsProcessing(true);
        try {
            await bulkUpdateUserRole(selectedIds, targetRole);
            toast.success(`เปลี่ยนบทบาทผู้ใช้ ${selectedIds.length} รายการเป็น ${targetRole} เรียบร้อยแล้ว`);
            setSelectedIds([]);
            setIsBulkUpdateModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการเปลี่ยนบทบาทแบบกลุ่ม");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkDelete = async () => {
        setIsProcessing(true);
        try {
            await bulkDeleteUsers(selectedIds);
            toast.success(`ลบผู้ใช้ ${selectedIds.length} รายการเรียบร้อยแล้ว`);
            setSelectedIds([]);
            setIsBulkDeleteModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการลบแบบกลุ่ม");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4">
                    <p className="text-sm font-bold text-blue-700">
                        เลือกผู้ใช้ <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md mx-1">{selectedIds.length}</span> รายการ
                    </p>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-lg h-9 bg-white border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                                    <Shield className="w-4 h-4 mr-2" />
                                    เปลี่ยนบทบาท
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="p-2 rounded-xl border-slate-100 shadow-xl w-48">
                                <DropdownMenuRadioGroup value={targetRole} onValueChange={(val) => {
                                    setTargetRole(val);
                                    setIsBulkUpdateModalOpen(true);
                                }}>
                                    <DropdownMenuRadioItem value="teacher" className="cursor-pointer font-bold text-sm">ครู / บุคลากร</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="supervisor" className="cursor-pointer font-bold text-sm">ศึกษานิเทศก์</DropdownMenuRadioItem>
                                    {currentUserRole === 'super_admin' && (
                                        <DropdownMenuRadioItem value="admin" className="cursor-pointer font-bold text-sm">ผู้ดูแลระบบ</DropdownMenuRadioItem>
                                    )}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-lg h-9 shadow-sm"
                            onClick={() => setIsBulkDeleteModalOpen(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบที่เลือก
                        </Button>
                    </div>
                </div>
            )}

            <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="w-12 text-center pl-6">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                        checked={users.length > 0 && selectedIds.length === users.length}
                                        onChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="font-black text-slate-700 h-14 pl-2 text-xs uppercase tracking-wider">ผู้ใช้งาน</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider">อีเมล</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider">บทบาท</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider">ช่องทางสมัคร</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider text-center">วันที่เข้าร่วม</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider text-right pr-8">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center text-slate-400 font-medium">
                                        ไม่พบข้อมูลผู้ใช้งานในหมวดหมู่นี้
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user: any) => {
                                    const providers = getProviders(user);
                                    const isSelected = selectedIds.includes(user._id);

                                    return (
                                        <TableRow key={user._id} className={cn("hover:bg-slate-50/60 transition-colors border-slate-50", isSelected && "bg-blue-50/50")}>
                                            {/* Checkbox */}
                                            <TableCell className="text-center pl-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(user._id)}
                                                />
                                            </TableCell>

                                            {/* Name */}
                                            <TableCell className="py-4 pl-2">
                                                <div className="flex items-center gap-3">
                                                    <div suppressHydrationWarning className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-black text-sm shrink-0">
                                                        {user.name?.trim()?.[0]?.toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm leading-tight">{user.name}</p>
                                                        {user.profile?.position && (
                                                            <p className="text-[10px] text-slate-400 font-medium">{user.profile.position}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Email */}
                                            <TableCell className="py-4 text-sm text-slate-500 font-medium">{user.email}</TableCell>

                                            {/* Role */}
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    user.role === 'super_admin' ? 'bg-indigo-600 text-white' :
                                                        user.role === 'admin' ? 'bg-blue-600 text-white' :
                                                            user.role === 'supervisor' ? 'bg-orange-500 text-white' :
                                                                'bg-slate-100 text-slate-600'
                                                )}>
                                                    {user.role === 'super_admin' ? 'ผู้ดูแลสูงสุด' :
                                                        user.role === 'admin' ? 'ผู้ดูแลระบบ' :
                                                            user.role === 'supervisor' ? 'ศึกษานิเทศก์' :
                                                                'ครู / บุคลากร'}
                                                </Badge>
                                            </TableCell>

                                            {/* Provider Badges */}
                                            <TableCell className="py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {providers.map((p) => {
                                                        const cfg = PROVIDERS[p] || PROVIDERS.credentials;
                                                        return (
                                                            <div
                                                                key={p}
                                                                className={cn(
                                                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold",
                                                                    cfg.bg, cfg.text
                                                                )}
                                                            >
                                                                <span className="flex-shrink-0">{cfg.icon}</span>
                                                                {cfg.label}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell suppressHydrationWarning className="py-4 text-xs text-slate-400 font-bold text-center">
                                                {new Date(user.createdAt).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="py-4 text-right pr-8">
                                                <UserActions user={user} currentUserRole={currentUserRole} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Bulk Update Modal */}
            <Dialog open={isBulkUpdateModalOpen} onOpenChange={setIsBulkUpdateModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">
                            ยืนยันการเปลี่ยนบทบาท
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            คุณต้องการเปลี่ยนบทบาทของผู้ใช้งานที่เลือกจำนวน {selectedIds.length} รายการเป็น <span className="font-bold text-blue-600">{targetRole === 'teacher' ? 'ครู / บุคลากร' : targetRole === 'supervisor' ? 'ศึกษานิเทศก์' : 'ผู้ดูแลระบบ'}</span> ใช่หรือไม่?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsBulkUpdateModalOpen(false)}
                            disabled={isProcessing}
                            className="flex-1 rounded-xl font-bold border-slate-200"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleBulkRoleUpdate}
                            disabled={isProcessing}
                            className="flex-1 rounded-xl font-black bg-blue-600 hover:bg-blue-700"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            ยืนยัน
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Modal */}
            <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-red-600 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" /> ยืนยันการลบผู้ใช้
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            คุณกำลังจะลบผู้ใช้จำนวน <span className="font-bold text-slate-900">{selectedIds.length}</span> รายการ ออกจากระบบ การดำเนินการนี้ <span className="font-bold text-red-600">ไม่สามารถย้อนกลับได้</span> ข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบไปด้วย
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsBulkDeleteModalOpen(false)}
                            disabled={isProcessing}
                            className="flex-1 rounded-xl font-bold border-slate-200"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={isProcessing}
                            className="flex-1 rounded-xl font-black bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            ยืนยัน ลบข้อมูล
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
