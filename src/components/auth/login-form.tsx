
"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, Globe } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { loginSchema } from "@/lib/zod";

export function LoginForm() {
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    function onSubmit(values: z.infer<typeof loginSchema>) {
        startTransition(async () => {
            await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: true,
                callbackUrl: "/dashboard"
            });
        });
    }

    return (
        <Card className="border-none bg-white shadow-[0_4px_30px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden">
            <div className="text-center py-6 border-b border-slate-50">
                <h1 className="text-xl font-black text-slate-800 tracking-tight">เข้าสู่ระบบ</h1>
            </div>

            <CardContent className="p-0 flex flex-col md:flex-row">
                {/* Left Column: Digital ID / Socials */}
                <div className="flex-1 p-6 md:p-8 space-y-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-lg font-bold text-slate-700 mb-1">เข้าสู่ระบบด้วย Digital ID</h2>
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="w-full h-14 flex items-center justify-between px-5 rounded-xl border border-slate-200 hover:bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm bg-white"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <svg className="w-full h-full group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <span className="text-slate-700 font-black text-sm tracking-tight group-hover:text-blue-600 transition-colors">Google Account</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:translate-x-1 transition-all">
                                <LogIn className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600" />
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => signIn("line", { callbackUrl: "/dashboard" })}
                            className="w-full h-14 flex items-center justify-between px-5 rounded-xl border border-slate-200 hover:bg-white hover:border-[#06C755] hover:shadow-lg hover:shadow-[#06C755]/10 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm bg-white"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-8 h-8 relative flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden rounded-md shadow-sm">
                                    <Image
                                        src="/logo/logoline.png"
                                        alt="LINE Logo"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="text-slate-700 font-black text-sm tracking-tight group-hover:text-[#06C755] transition-colors">แอปพลิเคชัน LINE</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-[#06C755]/10 group-hover:translate-x-1 transition-all">
                                <LogIn className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#06C755]" />
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full h-14 flex items-center justify-between px-5 rounded-xl border border-slate-200 hover:bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm bg-white"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-8 h-8 relative flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden rounded-md bg-white shadow-sm border border-slate-100">
                                    <Image
                                        src="/logo/thaiidlogo.png"
                                        alt="Thai ID Logo"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="text-slate-700 font-black text-sm tracking-tight group-hover:text-indigo-600 transition-colors">แอปพลิเคชัน Thai ID</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:translate-x-1 transition-all">
                                <LogIn className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600" />
                            </div>
                        </Button>
                    </div>


                </div>

                {/* Divider */}
                <div className="hidden md:block w-px bg-slate-100 self-stretch my-8" />

                {/* Right Column: Form */}
                <div className="flex-1 p-6 md:p-8 space-y-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-lg font-bold text-slate-700 mb-1">เข้าสู่ระบบด้วย OVEC ID</h2>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-slate-400 font-medium text-[11px] ml-1">อีเมลผู้ใช้งาน หรือ อีเมลบุคลากร</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="example@mail.com"
                                                {...field}
                                                className="h-12 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base placeholder:text-slate-300 shadow-inner"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold mt-1" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-slate-400 font-medium text-[11px] ml-1">รหัสผ่าน</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    {...field}
                                                    className="h-12 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base placeholder:text-slate-300 shadow-inner"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold mt-1" />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between items-center px-1 text-xs">
                                <div>
                                    <span className="text-slate-400">ไม่มีบัญชี? </span>
                                    <Link href="/register" className="text-[#1a237e] font-bold hover:underline underline-offset-4">สมัครสมาชิก</Link>
                                </div>
                                <button type="button" className="text-[#1a237e] font-bold hover:underline underline-offset-4">ลืมรหัสผ่าน</button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#1a237e] hover:bg-[#151b60] text-white rounded-xl font-black text-lg shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-2"
                                disabled={isPending}
                            >
                                {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                            </Button>


                        </form>
                    </Form>
                </div>
            </CardContent>
        </Card>
    );
}
