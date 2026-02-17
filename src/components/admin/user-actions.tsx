
"use client";

import { useState } from "react";
import { MoreHorizontal, Shield, Loader2 } from "lucide-react";
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
import { updateUserRole } from "@/actions/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UserActionsProps {
    user: {
        _id: string;
        name: string;
        role: string;
    };
    currentUserRole: string;
}

export function UserActions({ user, currentUserRole }: UserActionsProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    // Prevent editing Super Admins unless you are one
    const canEdit = currentUserRole === 'super_admin' || (currentUserRole === 'admin' && user.role !== 'super_admin');

    const handleRoleChange = async (newRole: string) => {
        if (newRole === user.role) return;

        setIsPending(true);
        try {
            await updateUserRole(user._id, newRole);
            toast.success(`User role updated to ${newRole}`);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update role");
            console.error(error);
        } finally {
            setIsPending(false);
        }
    };

    if (!canEdit) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Change Role</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={user.role} onValueChange={handleRoleChange}>
                            <DropdownMenuRadioItem value="teacher">
                                Teacher
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="supervisor">
                                Supervisor
                            </DropdownMenuRadioItem>
                            {currentUserRole === 'super_admin' && (
                                <DropdownMenuRadioItem value="admin">
                                    Admin
                                </DropdownMenuRadioItem>
                            )}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}
