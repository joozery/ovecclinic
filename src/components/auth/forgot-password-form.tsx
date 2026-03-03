"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    sendForgotPasswordOTP,
    verifyForgotPasswordOTP,
    resetPasswordWithOTP
} from "@/actions/auth";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, KeyRound, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const emailSchema = z.object({
    email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
});

const otpSchema = z.object({
    otp: z.string().length(6, "รหัส OTP ต้องมีความยาว 6 หลัก"),
});

const resetSchema = z.object({
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string().min(6, "กรุณายืนยันรหัสผ่าน"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
});

type Step = "EMAIL" | "OTP" | "RESET" | "SUCCESS";

export function ForgotPasswordForm() {
    const [step, setStep] = useState<Step>("EMAIL");
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form instances
    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    const resetForm = useForm<z.infer<typeof resetSchema>>({
        resolver: zodResolver(resetSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    // Handlers
    const onEmailSubmit = (values: z.infer<typeof emailSchema>) => {
        startTransition(async () => {
            const result = await sendForgotPasswordOTP(values.email);
            if (result.error) {
                toast.error(result.error);
                return;
            }
            setEmail(values.email);
            setStep("OTP");
            toast.success("ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว");
        });
    };

    const onOTPSubmit = (values: z.infer<typeof otpSchema>) => {
        startTransition(async () => {
            const result = await verifyForgotPasswordOTP(email, values.otp);
            if (result.error) {
                toast.error(result.error);
                return;
            }
            setOtpCode(values.otp);
            setStep("RESET");
        });
    };

    const onResetSubmit = (values: z.infer<typeof resetSchema>) => {
        startTransition(async () => {
            const result = await resetPasswordWithOTP(email, otpCode, values.password);
            if (result.error) {
                toast.error(result.error);
                return;
            }
            setStep("SUCCESS");
            toast.success("เปลี่ยนรหัสผ่านสำเร็จแล้ว!");
        });
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#1a237e] transition-colors group px-1"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                กลับไปหน้าเข้าสู่ระบบ
            </Link>

            <Card className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.08)] rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
                <CardHeader className="space-y-4 p-8 pb-4 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-[#1a237e]/5 flex items-center justify-center text-[#1a237e]">
                        {step === "EMAIL" && <Mail className="w-8 h-8" />}
                        {step === "OTP" && <ShieldCheck className="w-8 h-8" />}
                        {step === "RESET" && <KeyRound className="w-8 h-8" />}
                        {step === "SUCCESS" && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                    </div>

                    <div>
                        <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">
                            {step === "EMAIL" && "ลืมรหัสผ่าน?"}
                            {step === "OTP" && "ยืนยันรหัส OTP"}
                            {step === "RESET" && "ตั้งรหัสผ่านใหม่"}
                            {step === "SUCCESS" && "สำเร็จแล้ว!"}
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium text-sm mt-2 px-4 leading-relaxed">
                            {step === "EMAIL" && "ระบุอีเมลที่ใช้สมัครสมาชิก เพื่อรับรหัสยืนยันการตั้งรหัสผ่านใหม่"}
                            {step === "OTP" && `กรอกรหัส 6 หลักที่ส่งไปยังอีเมล ${email}`}
                            {step === "RESET" && "ระบุรหัสผ่านใหม่ที่คุณต้องการใช้งาน (อย่างน้อย 6 ตัวอักษร)"}
                            {step === "SUCCESS" && "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ท่านสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที"}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="p-8 pt-6">
                    {step === "EMAIL" && (
                        <Form {...emailForm}>
                            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
                                <FormField
                                    control={emailForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-slate-500 font-black text-xs uppercase tracking-wider ml-1">อีเมลผู้ใช้งาน</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                    <Input
                                                        placeholder="example@mail.com"
                                                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all font-bold text-slate-800 shadow-sm"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold text-xs mt-1" />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    className="w-full h-14 bg-[#1a237e] hover:bg-indigo-900 rounded-2xl font-black text-base shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังส่งรหัส...</>
                                    ) : "ส่งรหัสยืนยัน"}
                                </Button>
                            </form>
                        </Form>
                    )}

                    {step === "OTP" && (
                        <Form {...otpForm}>
                            <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-5">
                                <FormField
                                    control={otpForm.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-slate-500 font-black text-xs uppercase tracking-wider ml-1 text-center block">รหัส OTP 6 หลัก</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="000000"
                                                    maxLength={6}
                                                    className="h-16 text-center text-3xl tracking-[1rem] pl-[1rem] rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all font-black text-[#1a237e] shadow-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-center font-bold text-xs mt-1" />
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-3">
                                    <Button
                                        className="w-full h-14 bg-[#1a237e] hover:bg-indigo-900 rounded-2xl font-black text-base shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังตรวจสอบ...</>
                                        ) : "ยืนยันรหัส OTP"}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setStep("EMAIL")}
                                        className="w-full text-center text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        ย้อนกลับไปแก้ไขอีเมล
                                    </button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {step === "RESET" && (
                        <Form {...resetForm}>
                            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
                                <FormField
                                    control={resetForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-slate-500 font-black text-xs uppercase tracking-wider ml-1">รหัสผ่านใหม่</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all font-bold text-slate-800 shadow-sm"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold text-xs mt-1" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={resetForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-slate-500 font-black text-xs uppercase tracking-wider ml-1">ยืนยันรหัสผ่านใหม่อีกครั้ง</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                    <Input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all font-bold text-slate-800 shadow-sm"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold text-xs mt-1" />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black text-base shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังบันทึก...</>
                                    ) : "เปลี่ยนรหัสผ่าน"}
                                </Button>
                            </form>
                        </Form>
                    )}

                    {step === "SUCCESS" && (
                        <div className="space-y-6 text-center">
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-6">
                                <p className="text-sm font-bold text-emerald-800">เปลี่ยนรหัสผ่านของคุณเรียบร้อยแล้ว<br />ท่านสามารถเข้าใช้งานระบบด้วยรหัสผ่านใหม่ได้ทันที</p>
                            </div>
                            <Link href="/login" className="block w-full">
                                <Button className="w-full h-14 bg-[#1a237e] hover:bg-indigo-900 rounded-2xl font-black text-base shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                                    ลงชื่อเข้าสู่ระบบ
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="text-center">
                <p className="text-xs font-bold text-slate-400">
                    หากมีความต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อ <br className="md:hidden" />
                    <a href="mailto:support@ovec.go.th" className="text-[#1a237e] hover:underline underline-offset-4">หน่วยสนับสนุนทางเทคนิค</a>
                </p>
            </div>
        </div>
    );
}
