
"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Settings, LogOut } from "lucide-react";

interface UserNavProps {
    user: any;
}

export function UserNav({ user }: UserNavProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-slate-100 hover:ring-blue-300 transition-all focus:outline-none focus:ring-blue-400">
                    {user?.image ? (
                        <Image
                            src={user.image}
                            alt={user?.name || "User"}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0">
                            {user?.image ? (
                                <Image
                                    src={user.image}
                                    alt={user?.name || "User"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col space-y-0.5 min-w-0">
                            <p className="text-sm font-bold leading-none truncate">{user?.name}</p>
                            <p className="text-xs leading-none text-muted-foreground truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <Link href="/settings">
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>ตั้งค่าบัญชี</span>
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ออกจากระบบ</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
