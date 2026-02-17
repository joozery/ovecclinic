
"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, Shield } from "lucide-react";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

export function SettingsTabs({ user }: { user: any }) {
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
                            <p className="text-slate-500 font-medium mt-1">แนะนำให้เปลี่ยนรหัสผ่านเป็นประจำทุก 3 เดือนเพื่อความปลอดภัยสูงสุดของข้อมูลคุณ</p>
                        </div>
                    </div>
                    <div className="max-w-xl">
                        <ChangePasswordForm />
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}
