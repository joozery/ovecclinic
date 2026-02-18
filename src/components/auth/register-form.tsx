
"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { User, Mail, Lock, UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { register } from "@/actions/register";
import { registerSchema } from "@/lib/zod";

export function RegisterForm() {
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    function onSubmit(values: z.infer<typeof registerSchema>) {
        startTransition(async () => {
            const result = await register(values);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.success) {
                toast.success("ลงทะเบียนสำเร็จ กำลังเข้าสู่ระบบ...");

                // Auto-login
                const loginResult = await signIn("credentials", {
                    email: values.email,
                    password: values.password,
                    redirect: false,
                });

                if (loginResult?.error) {
                    toast.error("ลงทะเบียนสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยตนเอง");
                    router.push("/login");
                } else {
                    window.location.href = "/onboarding";
                }
            }
        });
    }

    return (
        <Card className="border-none bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] rounded-xl overflow-hidden">
            <div className="text-center py-6 border-b border-slate-50">
                <h1 className="text-xl font-black text-slate-800 tracking-tight">ลงทะเบียนสมาชิกใหม่</h1>
                <p className="text-sm text-slate-500 font-medium">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างบัญชี</p>
            </div>

            <CardContent className="p-8 space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="text-slate-400 font-medium text-[11px] ml-1">ชื่อ-นามสกุล</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a237e] transition-colors">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <Input
                                                placeholder="ชื่อจริง นามสกุล"
                                                {...field}
                                                className="h-12 pl-11 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base placeholder:text-slate-300 shadow-inner"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold mt-1" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className="text-slate-400 font-medium text-[11px] ml-1">อีเมลผู้ใช้งาน</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a237e] transition-colors">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <Input
                                                placeholder="example@mail.com"
                                                {...field}
                                                className="h-12 pl-11 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base placeholder:text-slate-300 shadow-inner"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold mt-1" />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-slate-400 font-medium text-[11px] ml-1">รหัสผ่าน</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a237e] transition-colors">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    {...field}
                                                    className="h-12 pl-11 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base placeholder:text-slate-300 shadow-inner"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold mt-1" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-slate-400 font-medium text-[11px] ml-1">ยืนยันรหัสผ่าน</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a237e] transition-colors">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    {...field}
                                                    className="h-12 pl-11 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base placeholder:text-slate-300 shadow-inner"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold mt-1" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-end px-1">
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[#1a237e] text-xs font-bold hover:underline underline-offset-4 flex items-center gap-1.5"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-[#1a237e] hover:bg-[#151b60] text-white rounded-xl font-black text-lg shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-2 gap-2"
                            disabled={isPending}
                        >
                            <UserPlus className="w-5 h-5" />
                            {isPending ? "กำลังลงทะเบียน..." : "ลงทะเบียนเข้าใช้งาน"}
                        </Button>

                        <div className="pt-4 text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1a237e] text-sm font-bold transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                กลับไปหน้าเข้าสู่ระบบ
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
