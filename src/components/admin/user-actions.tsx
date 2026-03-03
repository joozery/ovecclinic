
"use client";

import { useState } from "react";
import { MoreHorizontal, Shield, Loader2, Trash2, AlertTriangle, UserPen, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { updateUserRole, deleteUser } from "@/actions/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserEditForm } from "./user-edit-form";
import { UserPasswordForm } from "./user-password-form";

interface UserActionsProps {
    user: {
        _id: string;
        name: string;
        role: string;
        email?: string;
        image?: string;
        profile?: any;
    };
    currentUserRole: string;
}

export function UserActions({ user, currentUserRole }: UserActionsProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const canEdit = currentUserRole === 'super_admin' || (currentUserRole === 'admin' && user.role !== 'super_admin' && user.role !== 'admin');

    const handleRoleChange = async (newRole: string) => {
        if (newRole === user.role) return;
        setIsPending(true);
        try {
            await updateUserRole(user._id, newRole);
            toast.success(`เปลี่ยนบทบาทเป็น "${newRole}" เรียบร้อยแล้ว`);
            router.refresh();
        } catch (error) {
            toast.error("ไม่สามารถเปลี่ยนบทบาทได้");
            console.error(error);
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteUser(user._id);
            toast.success(`ลบบัญชีผู้ใช้ "${user.name}" เรียบร้อยแล้ว`);
            setShowDeleteDialog(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error?.message || "ไม่สามารถลบบัญชีได้");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!canEdit) return null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                        <span className="sr-only">เปิดเมนู</span>
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                        ) : (
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-slate-100 p-1.5">
                    <DropdownMenuLabel className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-2 pb-1">
                        จัดการ: {user.name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-100" />

                    {/* Change Role */}
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-lg text-sm font-bold cursor-pointer">
                            <Shield className="mr-2 h-4 w-4 text-blue-500" />
                            <span>เปลี่ยนบทบาท</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="rounded-xl shadow-xl border-slate-100 p-1.5 w-44">
                            <DropdownMenuRadioGroup value={user.role} onValueChange={handleRoleChange}>
                                <DropdownMenuRadioItem value="teacher" className="rounded-lg text-sm font-bold cursor-pointer">
                                    ครู / บุคลากร
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="supervisor" className="rounded-lg text-sm font-bold cursor-pointer">
                                    ศึกษานิเทศก์
                                </DropdownMenuRadioItem>
                                {currentUserRole === 'super_admin' && (
                                    <>
                                        <DropdownMenuSeparator className="bg-slate-100 my-1" />
                                        <DropdownMenuRadioItem value="admin" className="rounded-lg text-sm font-bold cursor-pointer">
                                            ผู้ดูแลระบบ
                                        </DropdownMenuRadioItem>
                                    </>
                                )}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator className="bg-slate-100 my-1" />

                    {/* Edit Profile */}
                    <DropdownMenuItem
                        className="rounded-lg text-sm font-bold text-slate-700 cursor-pointer"
                        onSelect={() => setShowEditDialog(true)}
                    >
                        <UserPen className="mr-2 h-4 w-4 text-emerald-500" />
                        แก้ไขข้อมูลส่วนตัว
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-slate-100 my-1" />

                    {/* Change Password */}
                    <DropdownMenuItem
                        className="rounded-lg text-sm font-bold text-slate-700 cursor-pointer"
                        onSelect={() => setShowPasswordDialog(true)}
                    >
                        <KeyRound className="mr-2 h-4 w-4 text-orange-500" />
                        เปลี่ยนรหัสผ่าน
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-slate-100 my-1" />

                    {/* Delete */}
                    <DropdownMenuItem
                        className="rounded-lg text-sm font-bold text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                        onSelect={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        ลบบัญชีผู้ใช้นี้
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Profile Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-2xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <UserPen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-white">แก้ไขข้อมูลส่วนตัว</DialogTitle>
                                <DialogDescription className="text-blue-100/70 text-sm font-medium">
                                    ปรับปรุงรายละเอียดข้อมูลโปรไฟล์ของ <span className="text-white font-bold">{user.name}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 max-h-[70vh] overflow-y-auto">
                        <UserEditForm user={user} onSuccess={() => setShowEditDialog(false)} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-orange-500 to-red-600 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <KeyRound className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black text-white">เปลี่ยนรหัสผ่าน</DialogTitle>
                                <DialogDescription className="text-orange-100/70 text-sm font-medium">
                                    ตั้งรหัสผ่านใหม่ให้กับ <span className="text-white font-bold">{user.name}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8">
                        <UserPasswordForm user={user} onSuccess={() => setShowPasswordDialog(false)} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
                    <DialogHeader className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-7 h-7 text-red-500" />
                        </div>
                        <DialogTitle className="text-center text-xl font-black text-slate-900">
                            ยืนยันการลบบัญชี?
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm font-medium text-slate-500 leading-relaxed">
                            คุณกำลังจะลบบัญชีของ{" "}
                            <span className="font-black text-slate-900">"{user.name}"</span>{" "}
                            ออกจากระบบ การดำเนินการนี้{" "}
                            <span className="font-black text-red-600">ไม่สามารถย้อนกลับได้</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-red-50/60 border border-red-100 rounded-xl p-4 text-xs font-bold text-red-700 space-y-1 mt-2">
                        <p>⚠️ ข้อมูลที่จะถูกลบ:</p>
                        <ul className="ml-4 space-y-0.5 font-medium text-red-600">
                            <li>• ข้อมูลโปรไฟล์ทั้งหมด</li>
                            <li>• ประวัติการลงทะเบียนกิจกรรม</li>
                            <li>• ประกาศนียบัตรที่เชื่อมโยง</li>
                        </ul>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                            className="flex-1 rounded-xl font-bold border-slate-200"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 rounded-xl font-black bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    กำลังลบ...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    ยืนยัน ลบบัญชี
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
