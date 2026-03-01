
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

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
    user: {
        name: string;
        image?: string | null;
        idCard?: string;
        phone?: string;
        college?: string;
        province?: string;
        position?: string;
        region?: string;
        affiliation?: 'Government' | 'Private';
        academicStanding?: string;
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
            name: user?.name || "",
            idCard: user?.idCard || "",
            phone: user?.phone || "",
            college: user?.college || "",
            province: user?.province || "",
            position: user?.position || "",
            region: user?.region || "Central",
            affiliation: user?.affiliation || "Government",
            academicStanding: user?.academicStanding || "ไม่มี",
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
                    name: data.name,
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
                            name="idCard"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-black text-slate-700 flex items-center gap-2">
                                        <IdCard className="w-4 h-4 text-blue-600" /> เลขประจำตัวประชาชน
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="เลข 13 หลัก"
                                            maxLength={13}
                                            className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

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
                            name="province"
                            render={({ field }) => (
                                <FormItem className="flex flex-col pt-2.5">
                                    <FormLabel className="text-sm font-black text-slate-700 flex items-center gap-2 mb-0.5">
                                        <MapPinned className="w-4 h-4 text-blue-600" /> จังหวัด
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "h-12 w-full justify-between rounded-xl border-slate-200 hover:bg-slate-50 focus:border-blue-500 focus:ring-blue-500/20 transition-all text-sm font-medium",
                                                        !field.value && "text-slate-500 font-normal",
                                                        field.value && "text-slate-900"
                                                    )}
                                                >
                                                    {field.value
                                                        ? provinces.find(
                                                            (province) => province === field.value
                                                        )
                                                        : "เลือกจังหวัด"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0 rounded-xl shadow-xl border-slate-100">
                                            <Command>
                                                <CommandInput placeholder="ค้นหาจังหวัด..." className="text-sm" />
                                                <CommandList className="max-h-[220px]">
                                                    <CommandEmpty className="text-sm py-6 text-center text-slate-500">ไม่พบจังหวัดที่ค้นหา</CommandEmpty>
                                                    <CommandGroup>
                                                        {provinces.map((province) => (
                                                            <CommandItem
                                                                value={province}
                                                                key={province}
                                                                onSelect={() => {
                                                                    form.setValue("province", province);
                                                                }}
                                                                className="cursor-pointer text-sm font-medium"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        province === field.value
                                                                            ? "opacity-100 text-blue-600"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {province}
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
