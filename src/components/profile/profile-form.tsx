
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const profileFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    phone: z.string().optional(),
    bio: z.string().max(160).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
    user: {
        name: string;
        phone?: string;
        bio?: string;
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user?.name || "",
            phone: user?.phone || "",
            bio: user?.bio || "",
        },
        mode: "onChange",
    });

    function onSubmit(data: ProfileFormValues) {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("name", data.name);
            if (data.phone) formData.append("phone", data.phone);
            if (data.bio) formData.append("bio", data.bio);

            try {
                await updateProfile(formData);
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
                <div className="grid gap-8">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-black text-slate-700">ชื่อ-นามสกุล</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="ระบุชื่อจริงและนามสกุลของคุณ"
                                        className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription className="text-xs font-medium text-slate-400">
                                    ชื่อนี้จะถูกนำไปใช้ในเกียรติบัตร โปรดตรวจสอบความถูกต้องของตัวสะกด
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-black text-slate-700">เบอร์โทรศัพท์</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="ระบุเบอร์โทรศัพท์ที่ติดต่อได้"
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
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-black text-slate-700">ประวัติโดยย่อ / ตำแหน่งงาน</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="บอกเราเล็กน้อยเกี่ยวกับตัวคุณหรือสถานศึกษาที่สังกัด"
                                        className="resize-none min-h-[120px] rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium p-4"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription className="text-xs font-medium text-slate-400">
                                    คุณสามารถสรุปวิทยฐานะหรือประสบการณ์การทำงานสั้นๆ ได้ที่นี่
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="pt-4 border-t border-slate-100">
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
