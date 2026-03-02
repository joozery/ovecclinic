
"use client";

import { useTransition, useState, useRef } from "react";
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
import Image from "next/image";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { UserCircle, School, Phone, MapPinned, Building2, GraduationCap, IdCard, Check, ChevronsUpDown, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const provinces = [
    "กระบี่", "กรุงเทพมหานคร", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร",
    "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท",
    "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง",
    "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม",
    "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส",
    "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
    "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา",
    "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์",
    "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน",
    "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง",
    "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย",
    "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
    "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี",
    "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย",
    "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์",
    "อุทัยธานี", "อุบลราชธานี"
];

const profileFormSchema = z.object({
    prefixTH: z.string().min(1, "กรุณาเลือกคำนำหน้า"),
    firstNameTH: z.string().min(2, "กรุณากรอกชื่อจริง (ไทย)"),
    lastNameTH: z.string().min(2, "กรุณากรอกนามสกุล (ไทย)"),
    prefixEN: z.string().min(1, "กรุณาเลือกคำนำหน้า (EN)"),
    firstNameEN: z.string().min(2, "กรุณากรอกชื่อจริง (EN)"),
    lastNameEN: z.string().min(2, "กรุณากรอกนามสกุล (EN)"),
    birthDay: z.string().min(1, "เลือกวัน"),
    birthMonth: z.string().min(1, "เลือกเดือน"),
    birthYear: z.string().min(1, "เลือกปี"),
    idCard: z.string().length(13, "หมายเลขบัตรประชาชนต้องมี 13 หลัก"),
    phone: z.string().min(10, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง"),
    college: z.string().min(2, "กรุณากรอกชื่อสถานศึกษา"),
    province: z.string().min(2, "กรุณากรอกจังหวัด"),
    position: z.string().min(1, "กรุณาเลือกตำแหน่ง"),
    region: z.string().min(1, "กรุณาเลือกภาค"),
    affiliation: z.enum(['Government', 'Private', 'Supervisor_Unit']),
    academicStanding: z.string().min(1, "กรุณาเลือกวิทยฐานะ"),
    teachingSubject: z.string().min(2, "กรุณาระบุกลุ่มสาระเทคนิค/วิชาที่สอน"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
    user: {
        name: string;
        image?: string | null;
        idCard?: string;
        prefixTH?: string;
        firstNameTH?: string;
        lastNameTH?: string;
        prefixEN?: string;
        firstNameEN?: string;
        lastNameEN?: string;
        birthDay?: string;
        birthMonth?: string;
        birthYear?: string;
        phone?: string;
        college?: string;
        province?: string;
        position?: string;
        region?: string;
        affiliation?: 'Government' | 'Private' | 'Supervisor_Unit';
        academicStanding?: string;
        teachingSubject?: string;
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [isPending, startTransition] = useTransition();
    const [imageUrl, setImageUrl] = useState<string | null>(user.image || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            prefixTH: user?.prefixTH || "",
            firstNameTH: user?.firstNameTH || "",
            lastNameTH: user?.lastNameTH || "",
            prefixEN: user?.prefixEN || "",
            firstNameEN: user?.firstNameEN || "",
            lastNameEN: user?.lastNameEN || "",
            birthDay: user?.birthDay || "",
            birthMonth: user?.birthMonth || "",
            birthYear: user?.birthYear || "",
            idCard: user?.idCard || "",
            phone: user?.phone || "",
            college: user?.college || "",
            province: user?.province || "",
            position: user?.position || "",
            region: user?.region || "Central",
            affiliation: user?.affiliation || "Government",
            academicStanding: user?.academicStanding || "ไม่มี",
            teachingSubject: user?.teachingSubject || "",
        },
        mode: "onChange",
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

    function onSubmit(data: ProfileFormValues) {
        if (isUploading) {
            toast.error("กรุณารอให้อัปโหลดรูปภาพเสร็จสิ้น");
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (imageUrl) {
                formData.append("image", imageUrl);
            }

            try {
                await updateProfile(formData);

                // Update client session immediately
                await update({
                    name: `${data.prefixTH} ${data.firstNameTH} ${data.lastNameTH}`,
                    position: data.position,
                    image: imageUrl
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
                <div className="flex flex-col items-center justify-center mb-8">
                    <div
                        className="w-24 h-24 bg-blue-50 rounded-full flex flex-col items-center justify-center mb-4 border-2 border-dashed border-blue-200 cursor-pointer hover:bg-blue-100 transition relative overflow-hidden group"
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
                    <p className="text-xs text-slate-500 font-medium">คลิกเพื่อเปลี่ยนรูปโปรไฟล์</p>
                </div>

                <div className="grid gap-10">
                    {/* ข้อมูลภาษาภาษาไทย */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">ข้อมูลส่วนตัว (ภาษาไทย)</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            <FormField
                                control={form.control}
                                name="prefixTH"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-1">
                                        <FormLabel className="text-xs font-black text-slate-500">คำนำหน้า</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="-" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="นาย">นาย</SelectItem>
                                                <SelectItem value="นาง">นาง</SelectItem>
                                                <SelectItem value="นางสาว">นางสาว</SelectItem>
                                                <SelectItem value="ว่าที่ร้อยตรี">ว่าที่ร้อยตรี</SelectItem>
                                                <SelectItem value="ว่าที่ร้อยตรีหญิง">ว่าที่ร้อยตรีหญิง</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="firstNameTH"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel className="text-xs font-black text-slate-500">ชื่อจริง (ไทย)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ชื่อจริงภาษาไทย" className="h-11 rounded-xl border-slate-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastNameTH"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-3">
                                        <FormLabel className="text-xs font-black text-slate-500">นามสกุล (ไทย)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="นามสกุลภาษาไทย" className="h-11 rounded-xl border-slate-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* ข้อมูลภาษาอังกฤษ */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">ข้อมูลส่วนตัว (ภาษาอังกฤษ)</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            <FormField
                                control={form.control}
                                name="prefixEN"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-1">
                                        <FormLabel className="text-xs font-black text-slate-500">Prefix</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="-" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Mr.">Mr.</SelectItem>
                                                <SelectItem value="Mrs.">Mrs.</SelectItem>
                                                <SelectItem value="Ms.">Ms.</SelectItem>
                                                <SelectItem value="Acting Sub Lt.">Acting Sub Lt.</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="firstNameEN"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel className="text-xs font-black text-slate-500">First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Full Name (EN)" className="h-11 rounded-xl border-slate-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastNameEN"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-3">
                                        <FormLabel className="text-xs font-black text-slate-500">Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Surname (EN)" className="h-11 rounded-xl border-slate-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* วันเกิดและเลขบัตร */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-4">
                            <FormLabel className="text-xs font-black text-slate-500">วัน/เดือน/ปีเกิด (พ.ศ.)</FormLabel>
                            <div className="grid grid-cols-3 gap-3">
                                <FormField
                                    control={form.control}
                                    name="birthDay"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="วัน" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from({ length: 31 }, (_, i) => (
                                                    <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                        {i + 1}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="birthMonth"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="เดือน" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"].map((month, i) => (
                                                    <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                        {month}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="birthYear"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="ปี" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from({ length: 80 }, (_, i) => {
                                                    const year = new Date().getFullYear() + 543 - i - 18;
                                                    return (
                                                        <SelectItem key={year} value={String(year)}>
                                                            {year}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="idCard"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black text-slate-500">เลขประจำตัวประชาชน</FormLabel>
                                    <FormControl>
                                        <Input disabled maxLength={13} className="h-11 rounded-xl border-slate-200 bg-slate-50" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black text-slate-500 flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-blue-600" /> เบอร์โทรศัพท์
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="0812345678" className="h-11 rounded-xl border-slate-200" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="teachingSubject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black text-slate-500 flex items-center gap-2">
                                        <GraduationCap className="w-3 h-3 text-blue-600" /> วิชาที่สอน
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="เช่น คอมพิวเตอร์ธุรกิจ" className="h-11 rounded-xl border-slate-200" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">ข้อมูลการทำงาน</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="college"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-black text-slate-500">ชื่อสถานศึกษา</FormLabel>
                                        <FormControl>
                                            <Input placeholder="สังกัดสถานศึกษา" className="h-11 rounded-xl border-slate-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-black text-slate-500">ตำแหน่ง</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="เลือกตำแหน่ง" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ครูอัตราจ้าง">ครูอัตราจ้าง</SelectItem>
                                                <SelectItem value="พนักงานราชการ">พนักงานราชการ</SelectItem>
                                                <SelectItem value="ครูผู้ช่วย">ครูผู้ช่วย</SelectItem>
                                                <SelectItem value="ครู">ครู</SelectItem>
                                                <SelectItem value="รองผู้อำนวยการ">รองผู้อำนวยการ</SelectItem>
                                                <SelectItem value="ผู้อำนวยการ">ผู้อำนวยการ</SelectItem>
                                                <SelectItem value="ศึกษานิเทศก์">ศึกษานิเทศก์</SelectItem>
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
                                        <FormLabel className="text-xs font-black text-slate-500">วิทยฐานะ</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="เลือกวิทยฐานะ" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ไม่มี">ไม่มี</SelectItem>
                                                <SelectItem value="ชำนาญการ">ชำนาญการ</SelectItem>
                                                <SelectItem value="ชำนาญการพิเศษ">ชำนาญการพิเศษ</SelectItem>
                                                <SelectItem value="เชี่ยวชาญ">เชี่ยวชาญ</SelectItem>
                                                <SelectItem value="เชี่ยวชาญพิเศษ">เชี่ยวชาญพิเศษ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="province"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs font-black text-slate-500 mb-2">จังหวัด</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "h-11 w-full justify-between rounded-xl border-slate-200 font-medium",
                                                            !field.value && "text-slate-500 font-normal"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? provinces.find((p) => p === field.value)
                                                            : "เลือกจังหวัด"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="ค้นหาจังหวัด..." />
                                                    <CommandList>
                                                        <CommandEmpty>ไม่พบข้อมูล</CommandEmpty>
                                                        <CommandGroup>
                                                            {provinces.map((p) => (
                                                                <CommandItem
                                                                    value={p}
                                                                    key={p}
                                                                    onSelect={() => form.setValue("province", p)}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", p === field.value ? "opacity-100" : "opacity-0")} />
                                                                    {p}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="region"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-black text-slate-500">ภาค</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="เลือกภาค" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="North">ภาคเหนือ</SelectItem>
                                                <SelectItem value="South">ภาคใต้</SelectItem>
                                                <SelectItem value="Central">ภาคกลาง</SelectItem>
                                                <SelectItem value="Northeast">ภาคตะวันออกเฉียงเหนือ</SelectItem>
                                                <SelectItem value="East_Bangkok">ภาคตะวันออกและกรุงเทพฯ</SelectItem>
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
                                        <FormLabel className="text-xs font-black text-slate-500">สังกัด</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                    <SelectValue placeholder="เลือกสังกัด" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Government">สถานศึกษาภาครัฐ</SelectItem>
                                                <SelectItem value="Private">สถานศึกษาภาคเอกชน</SelectItem>
                                                <SelectItem value="Supervisor_Unit">หน่วยงานศึกษานิเทศก์</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
