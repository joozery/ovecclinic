"use client";

import { useEffect, useState } from "react";
import { getPublicSupervisors } from "@/actions/public";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SupervisorsSection() {
    const [supervisors, setSupervisors] = useState<any[]>([]);

    useEffect(() => {
        async function fetchSupervisors() {
            try {
                const data = await getPublicSupervisors();
                setSupervisors(data);
            } catch (error) {
                console.error("Failed to fetch supervisors:", error);
            }
        }
        fetchSupervisors();
    }, []);

    return (
        <section className="py-24 bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div className="space-y-4">
                        <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">Our Experts</h2>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                            ทำความรู้จักกับ <br /> <span className="text-[#1a237e]">คณะกรรมการนิเทศ</span>
                        </h3>
                    </div>
                    <div className="flex gap-2 mb-2">
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-slate-200">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-slate-200 bg-white">
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {supervisors.length > 0 ? (
                        supervisors.map((supervisor, i) => (
                            <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                                {/* Image Section */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <Image
                                        src={supervisor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supervisor.name}`}
                                        alt={supervisor.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute top-4 left-4">
                                        <div className="bg-[#1a237e] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                            Supervisor
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 space-y-4 flex-grow flex flex-col">
                                    <div>
                                        <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">
                                            Expert in Education
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 leading-snug group-hover:text-[#1a237e] transition-colors">
                                            {supervisor.name}
                                        </h4>
                                    </div>

                                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                        {supervisor.profile?.position || "ศึกษานิเทศก์เชี่ยวชาญ"} ณ {supervisor.profile?.college || "สถาบันการอาชีวศึกษา"}
                                    </p>

                                    <div className="flex items-center gap-1 pt-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`w-3 h-3 ${star <= 4 ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
                                        ))}
                                        <span className="text-xs font-bold text-slate-400 ml-1">4.8</span>
                                    </div>

                                    <div className="pt-4 mt-auto flex items-center justify-between border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                                <Image src="/logo/logo.jpg" width={32} height={32} alt="OVEC" className="object-contain" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">
                                                {supervisor.profile?.affiliation === 'Government' ? "ภาครัฐ" : "ภาคเอกชน"}
                                            </span>
                                        </div>
                                        <div className="text-emerald-500 text-[10px] font-bold">
                                            Active
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Skeleton / Placeholder if no real supervisors yet
                        [1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm animate-pulse">
                                <div className="aspect-[4/3] bg-slate-100" />
                                <div className="p-6 space-y-4">
                                    <div className="h-2 w-20 bg-slate-100 rounded" />
                                    <div className="h-4 w-40 bg-slate-100 rounded" />
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-slate-100 rounded" />
                                        <div className="h-2 w-2/3 bg-slate-100 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
