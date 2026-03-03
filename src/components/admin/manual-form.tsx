"use client";

import { useTransition, useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { createManual, updateManual } from "@/actions/manual";
import { uploadFile } from "@/actions/upload";

const formSchema = z.object({
    title: z.string().min(2, "หัวข้อจำเป็นต้องระบุ"),
    description: z.string().min(2, "คำอธิบายจำเป็นต้องระบุ"),
    imageUrl: z.string().optional(),
    order: z.string().refine((val) => !isNaN(Number(val)), "ต้องเป็นตัวเลข").optional(),
    isActive: z.boolean(),
});

interface ManualFormProps {
    initialData?: any;
    onSuccess?: () => void;
}

export function ManualForm({ initialData, onSuccess }: ManualFormProps) {
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
    const imageRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            imageUrl: initialData?.imageUrl || "",
            order: initialData?.order !== undefined ? String(initialData.order) : "0",
            isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const result = await uploadFile(formData);

            form.setValue("imageUrl", result.secure_url);
            setImagePreview(result.secure_url);
            toast.success("อัปโหลดรูปภาพสำเร็จ");
        } catch (error) {
            toast.error("อัปโหลดรูปภาพล้มเหลว");
        } finally {
            setIsUploading(false);
        }
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description);
            if (values.imageUrl) formData.append("imageUrl", values.imageUrl);
            formData.append("order", values.order || "0");
            formData.append("isActive", String(values.isActive));

            try {
                if (initialData?._id) {
                    await updateManual(initialData._id, formData);
                    toast.success("อัปเดตคู่มือสำเร็จ");
                } else {
                    await createManual(formData);
                    toast.success("สร้างคู่มือสำเร็จ");
                }

                if (!initialData) {
                    form.reset();
                    setImagePreview(null);
                }
                if (onSuccess) onSuccess();
            } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการบันทึก");
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                    <FormLabel>รูปภาพประกอบขั้นตอน (ตัวเลือก)</FormLabel>
                    <div
                        onClick={() => imageRef.current?.click()}
                        className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden"
                    >
                        {imagePreview ? (
                            <>
                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2">
                                    <ImagePlus className="w-6 h-6" /> เปลี่ยนรูปภาพ
                                </div>
                            </>
                        ) : (
                            isUploading ? (
                                <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
                                        <ImagePlus className="w-6 h-6 text-[#1a237e]" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">คลิกเพื่ออัปโหลดรูปภาพประกอบ</p>
                                    <p className="text-[10px] text-slate-400">แนะนำขนาด 16:9 เพื่อง่ายต่อการดู</p>
                                </>
                            )
                        )}
                        <input
                            type="file"
                            ref={imageRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>หัวข้อขั้นตอน</FormLabel>
                            <FormControl>
                                <Input placeholder="เช่น ขั้นตอนที่ 1: การเข้าสู่ระบบ" className="rounded-xl h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>คำอธิบายเพิ่มเติม</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="อธิบายรายละเอียดขั้นตอน..."
                                    className="rounded-xl min-h-[120px] py-4"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ลำดับการแสดงผล</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="เช่น 1, 2, 3" className="rounded-xl h-12" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-100 p-4 shadow-sm bg-slate-50/50 mt-2 md:mt-0">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base text-slate-700 font-bold">สถานะการแสดงผล</FormLabel>
                                    <div className="text-[11px] text-slate-500 font-medium">เปิด/ปิด การแสดงขั้นตอนนี้ในหน้าคู่มือ</div>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 bg-[#1a237e] hover:bg-[#151b60] text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] text-base"
                    disabled={isPending || isUploading}
                >
                    {isPending ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            กำลังบันทึกข้อมูล...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            {initialData ? "บันทึกการแก้ไข" : "เพิ่มคู่มือการใช้งาน"}
                        </div>
                    )}
                </Button>
            </form>
        </Form>
    );
}
