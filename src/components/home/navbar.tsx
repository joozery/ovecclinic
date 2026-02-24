"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface NavbarProps {
    isLoggedIn: boolean;
}

export function Navbar({ isLoggedIn }: NavbarProps) {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="group">
                        <div className="relative w-40 h-10 group-hover:scale-105 transition-transform">
                            <Image
                                src="/logo/logo.jpg"
                                alt="OVEC Logo"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {isLoggedIn ? (
                            <Link href="/dashboard">
                                <Button className="bg-[#1a237e] hover:bg-[#151b60] text-sm font-bold px-8 h-10 rounded-full shadow-lg shadow-indigo-100 transition-all">ไปยัง Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="text-sm font-bold text-[#1a237e] hover:bg-indigo-50 px-6">เข้าสู่ระบบ</Button>
                                </Link>
                                <Link href="/login">
                                    <Button className="bg-[#1a237e] hover:bg-[#151b60] text-sm font-bold px-8 h-10 rounded-full shadow-lg shadow-indigo-100 transition-all">เริ่มต้นใช้งาน</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden">
                        <Link href="/login">
                            <Button className="bg-[#1a237e] h-10 px-6 rounded-full font-bold text-xs">เริ่มต้น</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
