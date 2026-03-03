
import { auth } from "@/auth";
import { SettingsTabs } from "@/components/profile/settings-tabs";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { User as UserIcon, Settings } from "lucide-react";

export default async function SettingsPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select("+password");

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="space-y-10 pb-20 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-[#1a237e] p-8 md:p-10 rounded-xl shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-100 text-[9px] font-bold uppercase tracking-widest">
                            <Settings className="w-3 h-3" /> Account Preferences
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                            ตั้งค่าบัญชี<span className="text-blue-400">.</span>
                        </h1>
                        <p className="text-blue-100/70 max-w-sm font-medium text-sm leading-relaxed">
                            จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชีคุณได้ครบในที่เดียว
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl transition-transform duration-500 hover:scale-105">
                        <UserIcon className="w-10 h-10 text-white opacity-80" />
                    </div>
                </div>
            </div>

            <SettingsTabs
                user={JSON.parse(JSON.stringify({
                    name: user.name,
                    email: user.email || "",
                    idCard: user.idCard || "",
                    image: user.image || null,
                    ...user.profile,
                    birthDay: user.profile?.birthDate ? new Date(user.profile.birthDate).getDate().toString().padStart(2, '0') : "",
                    birthMonth: user.profile?.birthDate ? (new Date(user.profile.birthDate).getMonth() + 1).toString().padStart(2, '0') : "",
                    birthYear: user.profile?.birthDate ? (new Date(user.profile.birthDate).getFullYear() + 543).toString() : "",
                }))}
                providers={JSON.parse(JSON.stringify(user.providerAccounts || []))}
                hasPassword={!!user.password}
            />
        </div>
    );
}
