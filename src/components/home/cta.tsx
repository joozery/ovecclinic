"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-[#1a237e] rounded-[3rem] p-12 md:p-20 overflow-hidden shadow-2xl shadow-indigo-200">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />

                    <div className="relative max-w-2xl mx-auto text-center space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">พร้อมเริ่มต้นพัฒนาการนิเทศของคุณแล้วหรือยัง?</h2>
                        <p className="text-blue-100/70 text-lg font-medium">สมัครสมาชิกวันนี้เพื่อรับสิทธิการเข้าถึงระบบที่ทันสมัยที่สุด</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/login">
                                <Button className="w-full sm:w-auto bg-white text-[#1a237e] hover:bg-blue-50 h-14 px-10 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95">
                                    สมัครใช้งานฟรี
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-2xl font-bold text-white border-white/20 hover:bg-white/10">
                                    ติดต่อเจ้าหน้าที่
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
