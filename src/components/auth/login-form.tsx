
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
                        <h2 className="text-lg font-bold text-slate-700 mb-1">เข้าสู่ระบบด้วย ThaiD</h2>
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            onClick={() => signIn("thaid", { callbackUrl: "/dashboard" })}
                            className="w-full h-14 flex items-center justify-between px-5 rounded-xl border border-slate-200 hover:bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 group shadow-sm bg-white"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-8 h-8 relative flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden rounded-md bg-white shadow-sm border border-slate-100">
                                    <Image
                                        src="/logo/thaiidlogo.png"
                                        alt="ThaiD Logo"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="text-slate-700 font-black text-sm tracking-tight group-hover:text-indigo-600 transition-colors">แอปพลิเคชัน ThaiD</span>
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
                        <h2 className="text-lg font-bold text-slate-700 mb-1">เข้าสู่ระบบ</h2>
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
