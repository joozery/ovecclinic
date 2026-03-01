"use client";

import { UserNav } from "@/components/layout/user-nav";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useSession } from "next-auth/react";
import { SearchInput } from "@/components/search-input";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

export function Header() {
    const { data: session } = useSession();

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/60 backdrop-blur-md">
            <div className="flex h-16 items-center px-4 md:px-10">
                {/* Mobile Toggle */}
                <MobileNav />

                <div className="flex flex-1 items-center justify-between gap-4 md:gap-8">
                    {/* Page Context / Search */}
                    <div className="flex-1 flex items-center gap-4 max-w-xl hidden sm:flex">
                        <Suspense fallback={<div className="w-full h-10 bg-slate-100 animate-pulse rounded-md"></div>}>
                            <SearchInput
                                placeholder="ค้นหากิจกรรม, ประกาศ หรือเกียรติบัตร..."
                                className="w-full bg-slate-50/50 border-none shadow-none focus-within:bg-white focus-within:shadow-sm transition-all"
                            />
                        </Suspense>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 md:gap-4 ml-auto">
                        {session ? (
                            <>
                                <NotificationDropdown />
                                <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
                                <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
                                    <div className="flex flex-col items-end hidden sm:flex">
                                        <span className="text-sm font-black text-slate-800 leading-tight tracking-tight">
                                            {session.user.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider bg-blue-50/50 px-2 py-0.5 rounded-md mt-0.5">
                                            {(session.user as any).position || (
                                                session.user.role === 'teacher' ? 'ครู / บุคลากร' :
                                                    session.user.role === 'supervisor' ? 'ศึกษานิเทศก์' : 'ผู้ดูแลระบบ'
                                            )}
                                        </span>
                                    </div>
                                    <UserNav user={session.user} />
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                {/* This case shouldn't happen much in DashboardLayout but useful for safety */}
                                <a href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700">เข้าสู่ระบบ</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
