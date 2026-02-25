
"use client";

import { useTransition, useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { submitWork } from "@/actions/submission";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ExternalLink, FileText, UploadCloud, Loader2, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    links: z.array(z.string().url("กรุณาระบุ URL ให้ถูกต้อง").or(z.literal(""))),
});

interface SubmissionFormProps {
    registrationId: string;
    initialData?: any;
}

export function SubmissionForm({ registrationId, initialData }: SubmissionFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [files, setFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<any[]>(initialData?.files || []);
    const [isDragging, setIsDragging] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            links: initialData?.links?.length > 0 ? initialData.links : [""],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "links" as never,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    }, []);

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingFile = (index: number) => {
        setExistingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (files.length === 0 && existingFiles.length === 0 && (!values.links || values.links.every(l => !l.trim()))) {
            toast.error("กรุณาแนบไฟล์หรือระบุลิงก์ผลงานอย่างน้อย 1 รายการ");
            return;
        }

        startTransition(async () => {
            const formData = new FormData();

            values.links.forEach((link) => {
                if (link.trim()) formData.append("links", link.trim());
            });

            let uploadedFiles: any[] = [];
            try {
                if (files.length > 0) {
                    for (const file of files) {
                        const uploadFd = new FormData();
                        uploadFd.append("file", file);
                        const res = await fetch("/api/upload", {
                            method: "POST",
                            body: uploadFd
                        });

                        if (!res.ok) throw new Error("Upload failed");
                        const data = await res.json();

                        uploadedFiles.push({
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            url: data.url
                        });
                    }
                }
            } catch (error: any) {
                toast.error("เกิดข้อผิดพลาดในการอัปโหลดไฟล์: " + error.message);
                return;
            }

            const allFiles = [...existingFiles, ...uploadedFiles];
            formData.append("fileMetadata", JSON.stringify(allFiles));

            try {
                await submitWork(registrationId, formData);
                toast.success("ส่งผลงานเรียบร้อยแล้ว!");
                setFiles([]);
                router.refresh();
            } catch (error: any) {
                toast.error("ไม่สามารถส่งผลงานได้: " + error.message);
            }
        });
    };

    const isSubmitted = initialData?.status === 'Approved' || initialData?.status === 'Pending' || initialData?.status === 'In Review';

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <UploadCloud className="w-4 h-4" />
                        </div>
                        <h3 className="text-[15px] font-black text-slate-800">อัปโหลดไฟล์ผลงาน</h3>
                    </div>

                    {!isSubmitted && (
                        <div
                            className={cn(
                                "relative border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all bg-slate-50/50",
                                isDragging ? "border-blue-400 bg-blue-50/50 scale-[1.02]" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                            )}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isPending || isSubmitted}
                            />
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-blue-500 hover:scale-110 transition-transform">
                                <UploadCloud className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-bold text-slate-800 mb-1">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                            <p className="text-[11px] font-medium text-slate-400">รองรับไฟล์รูปภาพ, PDF, Word, Excel, PowerPoint (สูงสุด 10MB)</p>
                        </div>
                    )}

                    {(existingFiles.length > 0 || files.length > 0) && (
                        <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 space-y-3">
                            {existingFiles.map((file: any, index: number) => (
                                <div key={`ex-${index}`} className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div className="truncate pr-4">
                                            <a href={file.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-700 hover:text-blue-600 truncate block">
                                                {file.name}
                                            </a>
                                            <span className="text-[10px] font-medium text-slate-400">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB • อัปโหลดแล้ว
                                            </span>
                                        </div>
                                    </div>
                                    {!isSubmitted && (
                                        <Button
                                            type="button" variant="ghost" size="icon"
                                            onClick={() => removeExistingFile(index)}
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            {files.map((file, index) => (
                                <div key={`new-${index}`} className="flex items-center justify-between p-3.5 bg-blue-50/80 border border-blue-100 rounded-2xl group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl bg-white text-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                                            <FileText className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div className="truncate pr-4">
                                            <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                                            <span className="text-[10px] font-medium text-blue-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB • พร้อมส่ง
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        type="button" variant="ghost" size="icon" disabled={isPending}
                                        onClick={() => removeFile(index)}
                                        className="text-blue-400 hover:text-red-500 hover:bg-red-50 rounded-xl shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <LinkIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-black text-slate-800">แนบลิงก์ภายนอก</h3>
                            <p className="text-[11px] text-slate-400 font-medium">เช่น Google Drive, YouTube, หรือเว็บไซต์อื่นๆ</p>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 relative group">
                                <FormField
                                    control={form.control}
                                    name={`links.${index}`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <div className="relative">
                                                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        placeholder="https://..."
                                                        disabled={isSubmitted || isPending}
                                                        className="pl-11 h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-purple-500/20 shadow-sm"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[11px]" />
                                        </FormItem>
                                    )}
                                />
                                {!isSubmitted && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 rounded-xl shrink-0 border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1 && !form.getValues().links[0]}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}

                        {!isSubmitted && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl text-xs font-bold"
                                onClick={() => append("")}
                            >
                                <Plus className="w-4 h-4 mr-1.5" /> เพิ่มลิงก์
                            </Button>
                        )}
                    </div>
                </div>

                {!isSubmitted && (
                    <div className="pt-4 border-t border-slate-100">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
                        >
                            {isPending ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังบันทึกข้อมูล...</>
                            ) : (
                                "ยืนยันการส่งผลงาน"
                            )}
                        </Button>
                        <p className="text-[11px] text-center font-bold text-slate-400 mt-4 leading-relaxed group">
                            เมื่อส่งผลงานแล้ว <span className="text-blue-600 group-hover:text-blue-700 transition-colors">ศึกษานิเทศก์จะทำการตรวจพิจารณาชิ้นงาน</span><br />
                            หากผ่านการประเมินจึงจะสามารถรับเกียรติบัตรได้
                        </p>
                    </div>
                )}
            </form>
        </Form>
    );
}
