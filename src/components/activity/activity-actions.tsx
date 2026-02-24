
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { deleteActivity } from "@/actions/activity";
import Link from "next/link";

export function ActivityActions({ activity }: { activity: any }) {
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteActivity(activity._id);
            setShowDeleteAlert(false);
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/activities/manage/${activity._id}/edit`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" /> แก้ไข
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteAlert(true)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> ลบ
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบกิจกรรม?</AlertDialogTitle>
                        <AlertDialogDescription>
                            การดำเนินการนี้ไม่สามารถย้อนกลับได้ กิจกรรมนี้จะถูกลบออกจากระบบอย่างถาวร
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">ลบทิ้ง</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
