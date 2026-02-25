
"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, Shield } from "lucide-react";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

import Image from "next/image";

interface ProviderAccount {
    provider: string;
    providerAccountId: string;
}

export function SettingsTabs({
    user,
    providers = [],
    hasPassword = false
}: {
    user: any,
    providers?: ProviderAccount[],
    hasPassword?: boolean
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center bg-white border border-slate-200 rounded-3xl opacity-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const providerConfig: Record<string, { name: string, icon: string, color: string }> = {
        google: { name: "Google Account", icon: "/logo/google.png", color: "text-blue-600" },
        line: { name: "LINE Application", icon: "/logo/logoline.png", color: "text-[#06C755]" },
        thaid: { name: "ThaiID Application", icon: "/logo/thaiidlogo.png", color: "text-indigo-600" },
    };

    return (
        <Tabs defaultValue="profile" className="w-full space-y-8">
            <div className="flex justify-center md:justify-start">
                <TabsList className="bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-inner inline-flex h-12">
                    <TabsTrigger value="profile" className="flex items-center gap-2 rounded-lg font-bold px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-[#1a237e] data-[state=active]:shadow-sm transition-all text-slate-500 text-sm">
                        <UserIcon className="w-4 h-4" /> ข้อมูลส่วนตัว
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2 rounded-lg font-bold px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-[#1a237e] data-[state=active]:shadow-sm transition-all text-slate-500 text-sm">
                        <Shield className="w-4 h-4" /> ความปลอดภัย
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="profile" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 md:p-12 space-y-10">
                    <div className="flex items-start gap-6 border-b border-slate-100 pb-10">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1a237e] shrink-0">
                            <UserIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">จัดการข้อมูลโปรไฟล์</h3>
                            <p className="text-slate-500 font-medium mt-1">ข้อมูลนี้จะใช้สำหรับการแสดงผลในเกียรติบัตรและระบบส่งงาน โปรดตรวจสอบความถูกต้อง</p>
                        </div>
                    </div>
                    <ProfileForm user={user} />
                </div>
            </TabsContent>

            <TabsContent value="security" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 md:p-12 space-y-10">
                    <div className="flex items-start gap-6 border-b border-slate-100 pb-10">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">ความปลอดภัยของบัญชี</h3>
                            <p className="text-slate-500 font-medium mt-1">จัดการวิธีการเข้าสู่ระบบและความปลอดภัยของบัญชีคุณ</p>
                        </div>
                    </div>

                    <div className="max-w-xl space-y-8">
                        {/* Linked Accounts Section */}
                        {providers.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider">บัญชีที่เชื่อมต่ออยู่</h4>
                                <div className="grid gap-3">
                                    {providers.map((acc) => {
                                        const config = providerConfig[acc.provider] || { name: acc.provider, icon: "", color: "text-slate-600" };
                                        return (
                                            <div key={acc.provider} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-slate-200">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 relative bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden p-2">
                                                        {config.icon ? (
                                                            <Image src={config.icon} alt={config.name} fill className="object-contain p-2" />
                                                        ) : (
                                                            <Shield className="w-5 h-5 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-700">{config.name}</p>
                                                        <div className="text-[11px] font-bold text-green-500 flex items-center gap-1">
                                                            <div className="w-1 h-1 rounded-full bg-green-500" /> เชื่อมต่อแล้ว
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-black px-3 py-1 bg-white rounded-lg border border-slate-100 text-slate-400">
                                                    ID: {acc.providerAccountId.substring(0, 8)}...
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Password Section */}
                        {hasPassword ? (
                            <div className="space-y-6 pt-2">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider">เปลี่ยนรหัสผ่าน</h4>
                                    <p className="text-xs font-medium text-slate-400">แนะนำให้เปลี่ยนรหัสผ่านเป็นประจำทุก 3 เดือน</p>
                                </div>
                                <ChangePasswordForm />
                            </div>
                        ) : (
                            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100 text-center">
                                <p className="text-xs font-bold text-blue-600/70">
                                    คุณเข้าสู่ระบบผ่านผู้ให้บริการภายนอก จึงไม่ต้องตั้งรหัสผ่านในระบบนี้
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}
