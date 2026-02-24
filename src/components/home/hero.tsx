"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";

export function Hero() {
    return (
        <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-20 overflow-hidden min-h-[450px] flex items-center">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero.jpg"
                    alt="Hero Background"
                    fill
                    className="object-cover object-right lg:object-center"
                    priority
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 items-center">
                    <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                        <div className="space-y-4 text-left">
                            <h1 className="text-4xl lg:text-7xl font-black text-slate-900 leading-[1.15] tracking-tight">
                                ยกระดับการนิเทศ <br />
                                สู่มาตรฐานสากล
                            </h1>

                            <p className="text-base lg:text-xl text-slate-700 leading-relaxed max-w-xl font-medium">
                                ระบบบริหารจัดการกิจกรรมการนิเทศออนไลน์ที่ทันสมัย <br className="hidden md:block" /> และครบวงจรที่สุดสำหรับบุคลากรทางการศึกษา
                            </p>
                        </div>

                        <div className="relative max-w-lg group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within:text-[#1a237e] transition-colors">
                                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#1a237e] transition-colors" />
                            </div>
                            <Input
                                placeholder="ค้นหากิจกรรมการนิเทศหรือข้อมูลที่ต้องการ..."
                                className="h-16 pl-14 pr-32 rounded-full border-2 border-slate-100 bg-white shadow-xl shadow-slate-200/50 focus-visible:ring-blue-100 focus-visible:border-[#1a237e] transition-all text-base font-medium placeholder:text-slate-400"
                            />
                            <Button className="absolute right-2 top-2 bottom-2 px-8 bg-[#1a237e] hover:bg-[#151b60] text-white rounded-full font-bold text-base shadow-lg transition-all active:scale-95">
                                ค้นหา
                            </Button>
                        </div>

                        <div className="flex items-center gap-6 pt-4 text-left">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-md">
                                        <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} width={40} height={40} alt="Avatar" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900 text-base">ผู้ใช้งานกว่า 5,000+ ราย</p>
                                <p className="text-slate-600 font-medium text-sm">เข้าร่วมระบบนิเทศทั่วประเทศแล้ววันนี้</p>
                            </div>
                        </div>
                    </div>
                    {/* Right column empty to keep content on the left */}
                    <div className="hidden lg:block"></div>
                </div>
            </div>
        </section>
    );
}
