
"use client";

import { useTransition, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createActivity, updateActivity } from "@/actions/activity";
import { uploadFile } from "@/actions/upload";
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
import { ImagePlus, FileUp, X, Loader2, FileText, CheckCircle2, BookOpen, ChevronsUpDown, Check } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const formSchema = z.object({
    title: z.string().min(2, "หัวข้อกิจกรรมจำเป็นต้องระบุ"),
    description: z.string().min(10, "คำอธิบายจำเป็นต้องระบุ"),
    startTime: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "วันที่เริ่มไม่ถูกต้อง" }),
    endTime: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "วันที่สิ้นสุดไม่ถูกต้อง" }),
    quota: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "จำนวนที่นั่งต้องเป็นตัวเลขที่มากกว่า 0" }),
    location: z.string().min(2, "สถานที่หรือลิงก์จำเป็นต้องระบุ"),
    targetBranch: z.string().optional(),
    meetingId: z.string().optional(),
    meetingPassword: z.string().optional(),
    bannerImage: z.string().optional(),
});

const branchOptions = [
    "ทุกสาขาวิชา",
    // กลุ่มเกษตรกรรม
    "เกษตรกรรม", "พืชศาสตร์", "สัตวศาสตร์", "ประมง", "อุตสาหกรรมเกษตร",
    // กลุ่มอุตสาหกรรม
    "ช่างยนต์", "ช่างกลโรงงาน", "ช่างเชื่อมโลหะ", "ช่างไฟฟ้ากำลัง", "ช่างอิเล็กทรอนิกส์",
    "ช่างก่อสร้าง", "ช่างโยธา", "ช่างสถาปัตยกรรม", "ช่างเทคนิคคอมพิวเตอร์", "เมคคาทรอนิกส์",
    // กลุ่มพาณิชยกรรม/บริหารธุรกิจ
    "การบัญชี", "การตลาด", "การเลขานุการ", "คอมพิวเตอร์ธุรกิจ", "ธุรกิจค้าปลีก",
    "การจัดการสำนักงาน", "การจัดการโลจิสติกส์",
    // กลุ่มคหกรรม
    "คหกรรมศาสตร์", "อาหารและโภชนาการ", "แฟชั่นและสิ่งทอ", "เสริมสวยและความงาม",
    // กลุ่มศิลปกรรม
    "วิจิตรศิลป์", "การออกแบบ", "คอมพิวเตอร์กราฟิก", "ดนตรี",
    // กลุ่มท่องเที่ยวและการโรงแรม
    "การโรงแรม", "การท่องเที่ยว",
    // อื่นๆ
    "เทคโนโลยีสารสนเทศ", "อื่นๆ",
];

interface ActivityFormProps {
    onSuccess?: () => void;
    onSuccessRedirect?: string;
    initialData?: any;
    activityId?: string;
}

export function ActivityForm({ onSuccess, onSuccessRedirect, initialData, activityId }: ActivityFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [documents, setDocuments] = useState<any[]>(initialData?.documents || []);
    const [bannerPreview, setBannerPreview] = useState<string | null>(initialData?.bannerImage || null);
    const [branchOpen, setBranchOpen] = useState(false);

    const bannerRef = useRef<HTMLInputElement>(null);
    const docRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : "",
            endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : "",
            quota: initialData?.quota ? String(initialData.quota) : "",
            location: initialData?.location || "",
            targetBranch: initialData?.targetBranch || "",
            meetingId: initialData?.meetingId || "",
            meetingPassword: initialData?.meetingPassword || "",
            bannerImage: initialData?.bannerImage || "",
        },
    });

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const result = await uploadFile(formData);

            form.setValue("bannerImage", result.secure_url);
            setBannerPreview(result.secure_url);
            toast.success("อัปโหลดรูปภาพสำเร็จ");
        } catch (error) {
            toast.error("อัปโหลดรูปภาพล้มเหลว");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const result = await uploadFile(formData);

            const newDoc = {
                name: file.name,
                url: result.secure_url,
                type: file.type,
                size: file.size
            };

            setDocuments(prev => [...prev, newDoc]);
            toast.success("อัปโหลดเอกสารสำเร็จ");
        } catch (error) {
            toast.error("อัปโหลดเอกสารล้มเหลว");
        } finally {
            setIsUploading(false);
        }
    };

    const removeDoc = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append("documents", JSON.stringify(documents));

            try {
                if (activityId) {
                    await updateActivity(activityId, formData);
                    toast.success("อัปเดตกิจกรรมสำเร็จ");
                } else {
                    await createActivity(formData);
                    toast.success("สร้างกิจกรรมสำเร็จ");
                }

                if (!activityId) {
                    form.reset();
                    setBannerPreview(null);
                    setDocuments([]);
                }

                if (onSuccess) onSuccess();
                if (onSuccessRedirect) {
                    router.push(onSuccessRedirect);
                    router.refresh();
                }
            } catch (error) {
                toast.error("ไม่สามารถบันทึกกิจกรรมได้");
                console.error("Failed to save activity", error);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Banner Upload Section */}
                <div className="space-y-3">
                    <FormLabel>รูปภาพหน้าปกกิจกรรม</FormLabel>
                    <div
                        onClick={() => bannerRef.current?.click()}
                        className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden"
                    >
                        {bannerPreview ? (
                            <>
                                <Image src={bannerPreview} alt="Banner Preview" fill className="object-cover" />
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
                                    <p className="text-sm font-bold text-slate-500">คลิกเพื่ออัปโหลดรูปภาพ</p>
                                    <p className="text-[10px] text-slate-400">แนะนำขนาด 16:9 (เช่น 1280x720px)</p>
                                </>
                            )
                        )}
                        <input
                            type="file"
                            ref={bannerRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleBannerUpload}
                        />
                    </div>
                </div>

                <div className="grid gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ชื่อกิจกรรม</FormLabel>
                                <FormControl>
                                    <Input placeholder="เช่น อบรมการใช้งานระบบนิเทศออนไลน์..." className="rounded-xl h-12" {...field} />
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
                                <FormLabel>รายละเอียดกิจกรรม</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="ระบุวัตถุประสงค์และกำหนดการคร่าวๆ..."
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
                            name="startTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>วันที่เริ่ม</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" className="rounded-xl h-12" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>วันที่สิ้นสุด</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" className="rounded-xl h-12" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="quota"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>จำนวนที่รับสมัคร (ที่นั่ง)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="50" className="rounded-xl h-12" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>สถานที่ หรือ ลิงก์ออนไลน์</FormLabel>
                                    <FormControl>
                                        <Input placeholder="เช่น อาคาร A2 หรือ ลิงก์ Zoom" className="rounded-xl h-12" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* สาขาวิชาที่สอน — Searchable Combobox */}
                    <FormField
                        control={form.control}
                        name="targetBranch"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                    สาขาวิชาที่สอน (กลุ่มเป้าหมาย)
                                </FormLabel>
                                <Popover open={branchOpen} onOpenChange={setBranchOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <button
                                                type="button"
                                                role="combobox"
                                                aria-expanded={branchOpen}
                                                className="w-full flex items-center justify-between h-12 px-4 rounded-xl border border-input bg-background text-sm ring-offset-background hover:bg-accent/30 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            >
                                                <span className={field.value ? "text-foreground" : "text-muted-foreground"}>
                                                    {field.value || "เลือกสาขาวิชา... (เว้นว่างหากเปิดทุกสาขา)"}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="พิมค้นหาสาขาวิชา..." />
                                            <CommandList className="max-h-56">
                                                <CommandEmpty>ไม่พบสาขาวิชาที่ต้องการ</CommandEmpty>
                                                <CommandGroup>
                                                    {branchOptions.map((b) => (
                                                        <CommandItem
                                                            key={b}
                                                            value={b}
                                                            onSelect={(val) => {
                                                                field.onChange(val === field.value ? "" : val);
                                                                setBranchOpen(false);
                                                            }}
                                                        >
                                                            <Check className={`mr-2 h-4 w-4 ${field.value === b ? "opacity-100" : "opacity-0"}`} />
                                                            {b}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {field.value && (
                                    <button
                                        type="button"
                                        onClick={() => field.onChange("")}
                                        className="text-[11px] text-slate-400 hover:text-red-500 font-medium mt-1 flex items-center gap-1"
                                    >
                                        <X className="w-3 h-3" /> ล้างค่า
                                    </button>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="meetingId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meeting ID (สำหรับระบบ Zoom/Teams)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="เช่น 123 456 7890 (ถ้ามี)" className="rounded-xl h-12" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="meetingPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meeting Password (สำหรับระบบ Zoom/Teams)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="เช่น abc1234 (ถ้ามี)" className="rounded-xl h-12" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Documents Upload Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <FormLabel>เอกสารประกอบ (เลือกได้หลายไฟล์)</FormLabel>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-[#1a237e] font-bold h-8 gap-1.5"
                            onClick={() => docRef.current?.click()}
                        >
                            <FileUp className="w-4 h-4" /> เพิ่มไฟล์
                        </Button>
                    </div>

                    <input
                        type="file"
                        ref={docRef}
                        className="hidden"
                        onChange={handleDocUpload}
                    />

                    <div className="grid gap-3">
                        {documents.map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <FileText className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{doc.name}</p>
                                        <p className="text-[10px] text-slate-500">{(doc.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    onClick={() => removeDoc(i)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}

                        {documents.length === 0 && !isUploading && (
                            <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400">ยังไม่มีเอกสารแนบ</p>
                            </div>
                        )}

                        {isUploading && (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 text-[#1a237e] animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4">
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
                                {activityId ? "บันทึกการแก้ไข" : "สร้างกิจกรรมเลย"}
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
