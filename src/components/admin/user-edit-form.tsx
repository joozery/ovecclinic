
"use client";

import { useTransition, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUserByAdmin } from "@/actions/user";
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

const userFormSchema = z.object({
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
    email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
    phone: z.string().min(10, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง"),
    college: z.string().min(2, "กรุณากรอกชื่อสถานศึกษา"),
    province: z.string().min(2, "กรุณากรอกจังหวัด"),
    position: z.string().min(1, "กรุณาเลือกตำแหน่ง"),
    region: z.string().min(1, "กรุณาเลือกภาค"),
    affiliation: z.string().min(1, "กรุณาเลือกสังกัด"),
    academicStanding: z.string().min(1, "กรุณาเลือกวิทยฐานะ"),
    teachingSubject: z.string().min(2, "กรุณาระบุกลุ่มสาระเทคนิค/สาขาวิชา"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserEditFormProps {
    user: any;
    onSuccess: () => void;
}

export function UserEditForm({ user, onSuccess }: UserEditFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [imageUrl, setImageUrl] = useState<string | null>(user.image || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            prefixTH: user?.profile?.prefixTH || "",
            firstNameTH: user?.profile?.firstNameTH || "",
            lastNameTH: user?.profile?.lastNameTH || "",
            prefixEN: user?.profile?.prefixEN || "",
            firstNameEN: user?.profile?.firstNameEN || "",
            lastNameEN: user?.profile?.lastNameEN || "",
            birthDay: user?.profile?.birthDate ? String(new Date(user.profile.birthDate).getDate()).padStart(2, '0') : "",
            birthMonth: user?.profile?.birthDate ? String(new Date(user.profile.birthDate).getMonth() + 1).padStart(2, '0') : "",
            birthYear: user?.profile?.birthDate ? String(new Date(user.profile.birthDate).getFullYear() + 543) : "",
            idCard: user?.idCard || "",
            email: user?.email || "",
            phone: user?.profile?.phone || "",
            college: user?.profile?.college || "",
            province: user?.profile?.province || "",
            position: user?.profile?.position || "",
            region: user?.profile?.region || "Central",
            affiliation: user?.profile?.affiliation || "สถานศึกษาภาครัฐ",
            academicStanding: user?.profile?.academicStanding || "ไม่มี",
            teachingSubject: user?.profile?.teachingSubject || "",
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

    function onSubmit(data: UserFormValues) {
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
                const result = await updateUserByAdmin(user._id, formData);

                if (result?.error) {
                    toast.error(result.error);
                    return;
                }

                toast.success("อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว");
                onSuccess();
                router.refresh();
            } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col items-center justify-center mb-6">
                    <div
                        className="w-20 h-20 bg-blue-50 rounded-full flex flex-col items-center justify-center mb-2 border-2 border-dashed border-blue-200 cursor-pointer hover:bg-blue-100 transition relative overflow-hidden group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {imageUrl ? (
                            <>
                                <Image src={imageUrl} alt="Profile" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                            </>
                        ) : (
                            <>
                                {isUploading ? (
                                    <Loader2 className="w-6 h-6 text-[#1a237e] animate-spin" />
                                ) : (
                                    <>
                                        <Camera className="w-6 h-6 text-[#1a237e] mb-1 group-hover:scale-110 transition" />
                                        <span className="text-[9px] font-bold text-blue-600">อัปโหลดรูป</span>
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
                    <p className="text-[10px] text-slate-500 font-medium">คลิกเพื่อเปลี่ยนรูปโปรไฟล์</p>
                </div>

                <div className="grid gap-6">
                    {/* ข้อมูลภาษาและเลขบัตร */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <FormField
                            control={form.control}
                            name="prefixTH"
                            render={({ field }) => (
                                <FormItem className="md:col-span-1">
                                    <FormLabel className="text-xs font-black text-slate-500">คำนำหน้า</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
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
                                        <Input placeholder="ชื่อจริงภาษาไทย" className="h-10 rounded-xl border-slate-200 text-sm" {...field} />
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
                                        <Input placeholder="นามสกุลภาษาไทย" className="h-10 rounded-xl border-slate-200 text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <FormField
                            control={form.control}
                            name="prefixEN"
                            render={({ field }) => (
                                <FormItem className="md:col-span-1">
                                    <FormLabel className="text-xs font-black text-slate-500">Prefix</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
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
                                        <Input placeholder="Full Name (EN)" className="h-10 rounded-xl border-slate-200 text-sm" {...field} />
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
                                        <Input placeholder="Surname (EN)" className="h-10 rounded-xl border-slate-200 text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <FormLabel className="text-xs font-black text-slate-500">วัน/เดือน/ปีเกิด (พ.ศ.)</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                                <FormField
                                    control={form.control}
                                    name="birthDay"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
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
                                                <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
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
                                                <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
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
                                        <Input maxLength={13} className="h-10 rounded-xl border-slate-200 text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black text-slate-500">อีเมล</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="example@email.com" className="h-10 rounded-xl border-slate-200 text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black text-slate-500 flex items-center gap-2">
                                        เบอร์โทรศัพท์
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="0812345678" className="h-10 rounded-xl border-slate-200 text-sm" {...field} />
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
                                    <FormLabel className="text-xs font-black text-slate-500">
                                        สาขาวิชา
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="เช่น คอมพิวเตอร์ธุรกิจ" className="h-10 rounded-xl border-slate-200 text-sm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* ข้อมูลการทำงาน */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="college"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black text-slate-500">ชื่อสถานศึกษา/หน่วยงาน</FormLabel>
                                    <FormControl>
                                        <Input placeholder="สังกัดสถานศึกษา" className="h-10 rounded-xl border-slate-200 text-sm" {...field} />
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
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
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
                                            <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
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
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
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
                                                        "h-10 w-full justify-between rounded-xl border-slate-200 font-medium text-sm",
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
                                                    <CommandGroup className="max-h-60 overflow-y-auto">
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
                            name="affiliation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black text-slate-500">สังกัด</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                                                <SelectValue placeholder="เลือกสังกัด" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="สถานศึกษาภาครัฐ">สถานศึกษาภาครัฐ</SelectItem>
                                            <SelectItem value="สถานศึกษาภาคเอกชน">สถานศึกษาภาคเอกชน</SelectItem>
                                            <SelectItem value="สถานศึกษาที่ไม่ได้สังกัด สอศ.">สถานศึกษาที่ไม่ได้สังกัด สอศ.</SelectItem>
                                            <SelectItem value="หน่วยศึกษานิเทศก์">หน่วยศึกษานิเทศก์</SelectItem>
                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคใต้">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคใต้</SelectItem>
                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคเหนือ">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคเหนือ</SelectItem>
                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคกลาง">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคกลาง</SelectItem>
                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคใต้ (จชต.)">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคใต้ (จชต.)</SelectItem>
                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคตะวันออกเฉียงเหนือ">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคตะวันออกเฉียงเหนือ</SelectItem>
                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคตะวันออกและกรุงเทพมหานคร">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคตะวันออกและกรุงเทพมหานคร</SelectItem>
                                            <SelectItem value="อื่น ๆ">อื่น ๆ</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
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
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-slate-100">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="h-11 px-8 bg-[#1a237e] hover:bg-[#151b60] text-white rounded-xl font-black text-sm transition-all active:scale-95 flex items-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : "บันทึกการแก้ไข"}
                    </Button>
                </div>
            </form>
        </Form >
    );
}

