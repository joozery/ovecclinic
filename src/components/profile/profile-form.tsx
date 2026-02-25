
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProfile } from "@/actions/profile";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserCircle, School, Phone, MapPinned, Building2, GraduationCap } from "lucide-react";

const profileFormSchema = z.object({
    name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุลจริง"),
    phone: z.string().min(10, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง"),
    college: z.string().min(2, "กรุณากรอกชื่อสถานศึกษา"),
    position: z.string().min(1, "กรุณาเลือกตำแหน่ง"),
    region: z.string().min(1, "กรุณาเลือกภาค"),
    affiliation: z.enum(['Government', 'Private']),
    academicStanding: z.string().min(1, "กรุณาเลือกวิทยฐานะ"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
    user: {
        name: string;
        phone?: string;
        college?: string;
        position?: string;
        region?: string;
        affiliation?: 'Government' | 'Private';
        academicStanding?: string;
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const { update } = useSession();
    const [isPending, startTransition] = useTransition();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user?.name || "",
            phone: user?.phone || "",
            college: user?.college || "",
            position: user?.position || "",
            region: user?.region || "Central",
            affiliation: user?.affiliation || "Government",
            academicStanding: user?.academicStanding || "ไม่มี",
        },
        mode: "onChange",
    });

    function onSubmit(data: ProfileFormValues) {
        startTransition(async () => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });

            try {
                await updateProfile(formData);

                // Update client session immediately
                await update({
                    name: data.name,
                    position: data.position
                });

                toast.success("อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว");
                router.refresh();
            } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
                <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        <UserCircle className="w-4 h-4 text-blue-600" /> ชื่อ-นามสกุล
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ระบุชื่อจริงและนามสกุลของคุณ"
                                            className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-blue-600" /> เบอร์โทรศัพท์
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="0812345678"
                                            className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="college"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-black text-slate-700 flex items-center gap-2">
                                    <School className="w-4 h-4 text-blue-600" /> ชื่อสถานศึกษา
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="เช่น วิทยาลัยเทคนิค..."
                                        className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        <UserCircle className="w-4 h-4 text-blue-600" /> ตำแหน่ง
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium">
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="academicStanding"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-blue-600" /> วิทยฐานะ
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium">
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="region"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        <MapPinned className="w-4 h-4 text-blue-600" /> ภาค
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium">
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="affiliation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-blue-600" /> สังกัด
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium">
                                                <SelectValue placeholder="เลือกสังกัด" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                            <SelectItem value="Government" className="font-bold py-3 px-4">รัฐบาล</SelectItem>
                                            <SelectItem value="Private" className="font-bold py-3 px-4">เอกชน</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-end">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="h-12 px-10 bg-[#1a237e] hover:bg-[#151b60] text-white rounded-xl font-black text-sm shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : "บันทึกการเปลี่ยนแปลง"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
