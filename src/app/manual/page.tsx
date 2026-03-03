import { getActiveManuals } from "@/actions/manual";
import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ManualPage() {
    const manuals = await getActiveManuals();

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Navbar isLoggedIn={false} />

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-24">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mx-auto">
                        <BookOpen className="w-4 h-4" /> USER MANUAL
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">คู่มือการใช้งานระบบ</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">ศึกษาขั้นตอนการเข้าสู่ระบบและสร้างกิจกรรมการนิเทศผ่านแพลตฟอร์มของเรา</p>
                </div>

                {manuals.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-600">ยังไม่มีข้อมูลคู่มือการใช้งาน</h2>
                        <p className="text-slate-400 mt-2">โปรดรอแอดมินอัปเดตข้อมูล</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {manuals.map((manual: any, index: number) => {
                            const isEven = index % 2 !== 0; // Alternating layout
                            return (
                                <div key={manual._id} className={cn(
                                    "bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6 md:p-8 flex flex-col gap-8 items-center",
                                    isEven ? "md:flex-row-reverse" : "md:flex-row"
                                )}>
                                    {/* Text Content */}
                                    <div className="flex-1 space-y-4 text-center md:text-left">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-black text-xl mb-2">
                                            {manual.order || index + 1}
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 leading-tight">
                                            {manual.title}
                                        </h2>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {manual.description}
                                        </p>
                                    </div>

                                    {/* Image Content */}
                                    <div className="w-full md:w-1/2 shrink-0 relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-50 flex items-center justify-center">
                                        {manual.imageUrl ? (
                                            <Image
                                                src={manual.imageUrl}
                                                alt={manual.title}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <span className="text-slate-400 font-bold text-sm">ไม่มีรูปภาพประกอบ</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
