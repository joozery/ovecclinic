
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProfile } from "@/actions/user";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Phone, School, UserCircle, MapPinned, Building2, Loader2, GraduationCap } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุลจริง"),
    phone: z.string().min(10, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง"),
    college: z.string().min(2, "กรุณากรอกชื่อสถานศึกษา"),
    position: z.string().min(1, "กรุณาเลือกตำแหน่ง"),
    region: z.string().min(1, "กรุณาเลือกภาค"),
    affiliation: z.enum(['Government', 'Private']),
    academicStanding: z.string().min(1, "กรุณาเลือกวิทยฐานะ"),
});

export function OnboardingForm() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { data: session, update } = useSession();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: session?.user?.name || "",
            phone: "",
            college: "",
            position: "",
            region: "Central",
            affiliation: "Government",
            academicStanding: "ไม่มี",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value);
            });

            try {
                const result = await updateProfile(formData);

                if (result.success) {
                    await update({
                        user: {
                            ...session?.user,
                            name: values.name,
                            isProfileComplete: true,
                        }
                    });

                    toast.success("บันทึกข้อมูลสำเร็จ กำลังพาคุณไปที่หน้า Dashboard...");

                    // ใช้ window.location เพื่อให้ Middleware โหลด Session ใหม่จากคุกกี้โดยตรง
                    setTimeout(() => {
                        window.location.href = "/dashboard";
                    }, 1000);
                }
            } catch (error) {
                console.error("Failed to update profile", error);
                toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        });
    }

    return (
        <Card className="w-full max-w-[500px] border-none shadow-[0_8px_40px_rgba(0,0,0,0.08)] bg-white rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-2 pt-8">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                    <UserCircle className="w-10 h-10 text-[#1a237e]" />
                </div>
                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">
                    กรุณาข้อมูลเพิ่มเติม
                </CardTitle>
                <CardDescription className="text-slate-400 font-medium">
                    กรุณากรอกข้อมูลให้ครบถ้วนเพื่อเริ่มใช้งานระบบ
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-slate-400 font-medium text-[11px] ml-1 flex items-center gap-2">
                                            <UserCircle className="w-3.5 h-3.5" /> ชื่อ - นามสกุล
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="กรอกชื่อ-นามสกุลจริง" {...field} className="h-12 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base shadow-inner" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-slate-400 font-medium text-[11px] ml-1 flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5" /> เบอร์โทรศัพท์
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น 0812345678" {...field} className="h-12 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base shadow-inner" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="college"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-slate-400 font-medium text-[11px] ml-1 flex items-center gap-2">
                                            <School className="w-3.5 h-3.5" /> ชื่อสถานศึกษา
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น วิทยาลัยเทคนิค..." {...field} className="h-12 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base shadow-inner" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-slate-400 font-medium text-[11px] ml-1 flex items-center gap-2">
                                            <UserCircle className="w-3.5 h-3.5" /> ตำแหน่ง
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base shadow-inner">
                                                    <SelectValue placeholder="เลือกตำแหน่ง" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                <SelectItem value="ครูอัตราจ้าง" className="font-bold py-3 px-4">ครูอัตราจ้าง</SelectItem>
                                                <SelectItem value="พนักงานราชการ" className="font-bold py-3 px-4">พนักงานราชการ</SelectItem>
                                                <SelectItem value="ครูผู้ช่วย" className="font-bold py-3 px-4">ครูผู้ช่วย</SelectItem>
                                                <SelectItem value="ครู" className="font-bold py-3 px-4">ครู</SelectItem>
                                                <SelectItem value="รองผู้อำนวยการ" className="font-bold py-3 px-4">รองผู้อำนวยการ</SelectItem>
                                                <SelectItem value="ผู้อำนวยการ" className="font-bold py-3 px-4">ผู้อำนวยการ</SelectItem>
                                                <SelectItem value="ศึกษานิเทศก์" className="font-bold py-3 px-4">ศึกษานิเทศก์</SelectItem>
                                                <SelectItem value="อื่นๆ" className="font-bold py-3 px-4">อื่นๆ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="academicStanding"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-slate-400 font-medium text-[11px] ml-1 flex items-center gap-2">
                                            <GraduationCap className="w-3.5 h-3.5" /> วิทยฐานะ
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base shadow-inner">
                                                    <SelectValue placeholder="เลือกวิทยฐานะ" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                <SelectItem value="ไม่มี" className="font-bold py-3 px-4">ไม่มี</SelectItem>
                                                <SelectItem value="ชำนาญการ" className="font-bold py-3 px-4">ชำนาญการ</SelectItem>
                                                <SelectItem value="ชำนาญการพิเศษ" className="font-bold py-3 px-4">ชำนาญการพิเศษ</SelectItem>
                                                <SelectItem value="เชี่ยวชาญ" className="font-bold py-3 px-4">เชี่ยวชาญ</SelectItem>
                                                <SelectItem value="เชี่ยวชาญพิเศษ" className="font-bold py-3 px-4">เชี่ยวชาญพิเศษ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-slate-400 font-medium text-[11px] ml-1 flex items-center gap-2">
                                                <MapPinned className="w-3.5 h-3.5" /> ภาค
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base shadow-inner">
                                                        <SelectValue placeholder="เลือกภาค" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    <SelectItem value="North" className="font-bold py-3 px-4">เหนือ</SelectItem>
                                                    <SelectItem value="South" className="font-bold py-3 px-4">ใต้</SelectItem>
                                                    <SelectItem value="Central" className="font-bold py-3 px-4">กลาง</SelectItem>
                                                    <SelectItem value="Northeast" className="font-bold py-3 px-4">ตะวันออกเฉียงเหนือ</SelectItem>
                                                    <SelectItem value="East_Bangkok" className="font-bold py-3 px-4">ตะวันออกและกรุงเทพมหานคร</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="affiliation"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-slate-400 font-medium text-[11px] ml-1 flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5" /> สังกัด
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-base shadow-inner">
                                                        <SelectValue placeholder="เลือกสังกัด" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    <SelectItem value="Government" className="font-bold py-3 px-4">รัฐบาล</SelectItem>
                                                    <SelectItem value="Private" className="font-bold py-3 px-4">เอกชน</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#1a237e] hover:bg-[#151b60] h-12 rounded-xl font-black text-lg shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-4 gap-2"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    กำลังบันทึกข้อมูล...
                                </>
                            ) : "บันทึกและเริ่มใช้งาน Dashboard"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
