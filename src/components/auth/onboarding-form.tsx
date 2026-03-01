
"use client";

import { useTransition, useState, useRef } from "react";
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
import Image from "next/image";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Phone, School, UserCircle, MapPinned, Building2, Loader2, GraduationCap, IdCard, Camera } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุลจริง"),
    idCard: z.string().length(13, "หมายเลขบัตรประชาชนต้องมี 13 หลัก"),
    phone: z.string().min(10, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง"),
    college: z.string().min(2, "กรุณากรอกชื่อสถานศึกษา"),
    province: z.string().min(2, "กรุณากรอกจังหวัด"),
    position: z.string().min(1, "กรุณาเลือกตำแหน่ง"),
    region: z.string().min(1, "กรุณาเลือกภาค"),
    affiliation: z.enum(['Government', 'Private']),
    academicStanding: z.string().min(1, "กรุณาเลือกวิทยฐานะ"),
});

export function OnboardingForm() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { data: session, update } = useSession();
    const [imageUrl, setImageUrl] = useState<string | null>(session?.user?.image || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: session?.user?.name || "",
            idCard: "",
            phone: "",
            college: "",
            province: "",
            position: "",
            region: "Central",
            affiliation: "Government",
            academicStanding: "ไม่มี",
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.url) {
                setImageUrl(data.url);
                toast.success("อัปโหลดรูปภาพสำเร็จ");
            } else {
                toast.error(data.error || "อัปโหลดรูปภาพไม่สำเร็จ");
            }
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        } finally {
            setIsUploading(false);
        }
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (isUploading) {
            toast.error("กรุณารอให้อัปโหลดรูปภาพเสร็จสิ้น");
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (imageUrl) {
                formData.append("image", imageUrl);
            }

            try {
                const result = await updateProfile(formData);

                if (result.success) {
                    await update({
                        user: {
                            ...session?.user,
                            name: values.name,
                            image: imageUrl || session?.user?.image,
                            isProfileComplete: true,
                        }
                    });

                    toast.success("บันทึกข้อมูลสำเร็จ กำลังพาคุณไปที่หน้า Dashboard...");

                    // ใช้ window.location เพื่อให้ Middleware โหลด Session ใหม่จากคุกกี้โดยตรง
                    setTimeout(() => {
                        window.location.href = "/dashboard";
                    }, 1000);
                } else if (result.error) {
                    toast.error(result.error, {
                        duration: 6000,
                    });
                }
            } catch (error) {
                console.error("Failed to update profile", error);
                toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        });
    }

    return (
        <Card className="w-full max-w-[800px] border-none shadow-[0_8px_40px_rgba(0,0,0,0.08)] bg-white rounded-2xl overflow-hidden mx-auto">
            <CardHeader className="text-center pb-2 pt-8">
                <div
                    className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex flex-col items-center justify-center mb-4 border-2 border-dashed border-blue-200 cursor-pointer hover:bg-blue-100 transition relative overflow-hidden group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imageUrl ? (
                        <>
                            <Image src={imageUrl} alt="Profile" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </>
                    ) : (
                        <>
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-[#1a237e] animate-spin" />
                            ) : (
                                <>
                                    <Camera className="w-8 h-8 text-[#1a237e] mb-1 group-hover:scale-110 transition" />
                                    <span className="text-[10px] font-bold text-blue-600">อัปโหลดรูป</span>
                                </>
                            )}
                        </>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    disabled={isUploading}
                />

                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">
                    กรุณากรอกข้อมูลเพิ่มเติม
                </CardTitle>
                <CardDescription className="text-slate-400 font-medium max-w-md mx-auto">
                    กรุณากรอกข้อมูลให้ครบถ้วนเพื่อเริ่มใช้งานระบบและรับเอกสารนิเทศทางอิเล็กทรอนิกส์
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* ฝั่งข้อมูลส่วนตัว */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                                    <UserCircle className="w-4 h-4 text-[#1a237e]" /> ข้อมูลส่วนบุคคล
                                </h3>

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-slate-500 font-medium text-[11px] ml-1">
                                                ชื่อ - นามสกุล
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="กรอกชื่อ-นามสกุลจริง" {...field} className="h-11 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-[13px]" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="idCard"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-slate-500 font-medium text-[11px] ml-1 flex items-center gap-1.5">
                                                เลขประจำตัวประชาชน
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="เลข 13 หลัก" {...field} maxLength={13} className="h-11 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-[13px]" />
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
                                            <FormLabel className="text-slate-500 font-medium text-[11px] ml-1">
                                                เบอร์โทรศัพท์
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="เช่น 0812345678" {...field} className="h-11 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-[13px]" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* ฝั่งข้อมูลการงาน */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-800 border-b pb-2 flex items-center gap-2">
                                    <School className="w-4 h-4 text-[#1a237e]" /> ข้อมูลหน่วยงาน
                                </h3>

                                <FormField
                                    control={form.control}
                                    name="college"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-slate-500 font-medium text-[11px] ml-1">
                                                ชื่อสถานศึกษา
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="เช่น วิทยาลัยเทคนิค..." {...field} className="h-11 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-[13px]" />
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="province"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-slate-500 font-medium text-[11px] ml-1">จังหวัด</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="กรอกจังหวัด" {...field} className="h-11 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-[13px]" />
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="region"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-slate-500 font-medium text-[11px] ml-1">ภาค</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-[13px]">
                                                            <SelectValue placeholder="เลือกภาค" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="North" className="font-bold py-3 px-4">เหนือ</SelectItem>
                                                        <SelectItem value="South" className="font-bold py-3 px-4">ใต้</SelectItem>
                                                        <SelectItem value="Central" className="font-bold py-3 px-4">กลาง</SelectItem>
                                                        <SelectItem value="Northeast" className="font-bold py-3 px-4">ตะวันออกเฉียงเหนือ</SelectItem>
                                                        <SelectItem value="East_Bangkok" className="font-bold py-3 px-4">ตะวันออกและกทม.</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px] font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="position"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-slate-500 font-medium text-[11px] ml-1">ตำแหน่ง</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-[13px]">
                                                            <SelectValue placeholder="เลือกตำแหน่ง" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="ครูอัตราจ้าง" className="font-bold py-3 px-4">ครูอัตราจ้าง</SelectItem>
                                                        <SelectItem value="พนักงานราชการ" className="font-bold py-3 px-4">พนักงานราชการ</SelectItem>
                                                        <SelectItem value="ครูผู้ช่วย" className="font-bold py-3 px-4">ครูผู้ช่วย</SelectItem>
                                                        <SelectItem value="ครู" className="font-bold py-3 px-4">ครู</SelectItem>
                                                        <SelectItem value="รองผู้อำนวยการ" className="font-bold py-3 px-4">รองผอ.</SelectItem>
                                                        <SelectItem value="ผู้อำนวยการ" className="font-bold py-3 px-4">ผอ.</SelectItem>
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
                                                <FormLabel className="text-slate-500 font-medium text-[11px] ml-1">วิทยฐานะ</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-[13px]">
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
                                </div>

                                <FormField
                                    control={form.control}
                                    name="affiliation"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-slate-500 font-medium text-[11px] ml-1">สังกัด</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 px-4 rounded-xl border-none bg-[#f1f5fa] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold text-[13px]">
                                                        <SelectValue placeholder="เลือกสังกัด" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    <SelectItem value="Government" className="font-bold py-3 px-4">รัฐบาล (อาชีวศึกษา)</SelectItem>
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
                            className="w-full md:w-auto md:min-w-[300px] mx-auto flex bg-[#1a237e] hover:bg-[#151b60] h-12 rounded-xl font-black text-base shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-8 gap-2"
                            disabled={isPending || isUploading}
                        >
                            {isPending || isUploading ? (
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
