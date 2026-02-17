
"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function MobileNav() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" className="md:hidden" size="icon">
                <Menu className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                    <Link
                        href="/"
                        className="w-full flex items-center justify-center mb-10 group"
                        onClick={() => setOpen(false)}
                    >
                        <div className="relative w-full h-12 group-hover:scale-[1.02] transition-transform duration-200">
                            <Image
                                src="/logo/logo.jpg"
                                alt="OVEC Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                    {session && (
                        <Link
                            href="/dashboard"
                            className="text-lg font-medium hover:text-blue-600 transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            แดชบอร์ด
                        </Link>
                    )}
                    <Link
                        href={session ? "/activities" : "/activities/public"}
                        className="text-lg font-medium hover:text-blue-600 transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        กิจกรรมการอบรม
                    </Link>

                    {session ? (
                        <>
                            {session.user.role === 'teacher' && (
                                <>
                                    <Link
                                        href="/my-activities"
                                        className="text-lg font-medium hover:text-blue-600 transition-colors"
                                        onClick={() => setOpen(false)}
                                    >
                                        งานของฉัน
                                    </Link>
                                    <Link
                                        href="/my-certificates"
                                        className="text-lg font-medium hover:text-blue-600 transition-colors"
                                        onClick={() => setOpen(false)}
                                    >
                                        เกียรติบัตร
                                    </Link>
                                </>
                            )}
                            {(session.user.role === 'supervisor' || session.user.role === 'admin' || session.user.role === 'super_admin') && (
                                <>
                                    <Link
                                        href="/activities/manage"
                                        className="text-lg font-medium hover:text-blue-600 transition-colors"
                                        onClick={() => setOpen(false)}
                                    >
                                        จัดการกิจกรรม
                                    </Link>
                                    <Link
                                        href="/supervision"
                                        className="text-lg font-medium hover:text-blue-600 transition-colors"
                                        onClick={() => setOpen(false)}
                                    >
                                        ตรวจผลงาน
                                    </Link>
                                </>
                            )}
                            {(session.user.role === 'admin' || session.user.role === 'super_admin') && (
                                <Link
                                    href="/admin/users"
                                    className="text-lg font-medium hover:text-blue-600 transition-colors"
                                    onClick={() => setOpen(false)}
                                >
                                    จัดการผู้ใช้งาน
                                </Link>
                            )}
                            <Link
                                href="/settings"
                                className="text-lg font-medium hover:text-blue-600 transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                ตั้งค่า
                            </Link>
                        </>
                    ) : (
                        <div className="flex flex-col space-y-2 pt-4 border-t">
                            <Button asChild onClick={() => setOpen(false)}>
                                <Link href="/login">เข้าสู่ระบบ</Link>
                            </Button>
                            <Button asChild variant="outline" onClick={() => setOpen(false)}>
                                <Link href="/register">ลงทะเบียน</Link>
                            </Button>
                        </div>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
