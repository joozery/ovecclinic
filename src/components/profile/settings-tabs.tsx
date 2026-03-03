
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

    const providerConfig: Record<string, { name: string, iconType: "svg" | "image", iconSrc?: string, color: string }> = {
        google: { name: "Google Account", iconType: "svg", color: "text-blue-600" },
        line: { name: "LINE Application", iconType: "image", iconSrc: "/logo/logoline.png", color: "text-[#06C755]" },
        thaid: { name: "ThaiD", iconType: "image", iconSrc: "/logo/thaiidlogo.png", color: "text-indigo-600" },
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
                                        const config = providerConfig[acc.provider] || { name: acc.provider, iconType: "svg", color: "text-slate-600" };
                                        return (
                                            <div key={acc.provider} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-slate-200">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 relative bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden p-2">
                                                        {config.iconType === "image" && config.iconSrc ? (
                                                            <Image src={config.iconSrc} alt={config.name} fill className="object-contain p-2" />
                                                        ) : config.iconType === "svg" && acc.provider === "google" ? (
                                                            <svg className="w-full h-full" viewBox="0 0 24 24">
                                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                            </svg>
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
