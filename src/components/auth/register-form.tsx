"use client";

import { useTransition, useState, useRef, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
    User, Mail, Lock, UserPlus, Eye, EyeOff, ArrowLeft,
    Smartphone, School, MapPinned, GraduationCap, Building2,
    Check, ChevronsUpDown, ShieldCheck, UserCircle, Camera, Loader2,
    CalendarDays
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import { register } from "@/actions/register";
import { updateProfile } from "@/actions/user";
import { registerSchema } from "@/lib/zod";
import { cn } from "@/lib/utils";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { requestOTP, verifyOTP } from "@/actions/otp";

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

const prefixesTH = ["นาย", "นาง", "นางสาว"];
const prefixesEN = ["Mr.", "Mrs.", "Ms."];
const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const months = [
    { label: "มกราคม", value: "01" },
    { label: "กุมภาพันธ์", value: "02" },
    { label: "มีนาคม", value: "03" },
    { label: "เมษายน", value: "04" },
    { label: "พฤษภาคม", value: "05" },
    { label: "มิถุนายน", value: "06" },
    { label: "กรกฎาคม", value: "07" },
    { label: "สิงหาคม", value: "08" },
    { label: "กันยายน", value: "09" },
    { label: "ตุลาคม", value: "10" },
    { label: "พฤศจิกายน", value: "11" },
    { label: "ธันวาคม", value: "12" },
];
const currentYear = new Date().getFullYear() + 543;
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

export function RegisterForm() {
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const { data: session, update: updateSession } = useSession();
    const isSocialLogin = !!session?.user;

    // OTP States
    const [otpOpen, setOtpOpen] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [pendingValues, setPendingValues] = useState<z.infer<typeof registerSchema> | null>(null);

    // Consent State
    const [isConsent, setIsConsent] = useState(false);

    // Success State
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: session?.user?.email && !session.user.email.includes("@thaid.go.th") ? session.user.email : "",
            password: "",
            confirmPassword: "",
            idCard: (session?.user as any)?.idCard || (session?.user as any)?.pid || "",
            prefixTH: (session?.user as any)?.prefixTH || (session?.user as any)?.title || "",
            firstNameTH: (session?.user as any)?.firstNameTH || (session?.user as any)?.given_name || "",
            lastNameTH: (session?.user as any)?.lastNameTH || (session?.user as any)?.family_name || "",
            prefixEN: (session?.user as any)?.prefixEN || (session?.user as any)?.title_en || "",
            firstNameEN: (session?.user as any)?.firstNameEN || (session?.user as any)?.given_name_en || "",
            lastNameEN: (session?.user as any)?.lastNameEN || (session?.user as any)?.family_name_en || "",
            birthDay: "",
            birthMonth: "",
            birthYear: "",
            phone: "",
            college: "",
            province: "",
            position: "",
            region: "Central",
            affiliation: "สถานศึกษาภาครัฐ",
            academicStanding: "ไม่มี",
            teachingSubject: "",
        },
    });

    // Update form if session data arrives after initial render
    useEffect(() => {
        console.log("RegisterForm Session Object:", session);
        if (session?.user) {
            console.log("Setting form values from session user:", {
                idCard: (session.user as any).idCard,
                firstNameTH: (session.user as any).firstNameTH,
                lastNameTH: (session.user as any).lastNameTH,
                firstNameEN: (session.user as any).firstNameEN,
                lastNameEN: (session.user as any).lastNameEN,
                prefixTH: (session.user as any).prefixTH,
                prefixEN: (session.user as any).prefixEN,
                birthdate: (session.user as any).birthdate,
                gender: (session.user as any).gender,
            });

            form.setValue("idCard", (session.user as any).idCard || (session.user as any).pid || (session.user as any).pid_no || "");

            // Comprehensive Name Pre-fill
            const fNameTH = (session.user as any).firstNameTH || (session.user as any).given_name || (session.user as any).th_fname || "";
            const lNameTH = (session.user as any).lastNameTH || (session.user as any).family_name || (session.user as any).th_lname || "";
            const fNameEN = (session.user as any).firstNameEN || (session.user as any).given_name_en || (session.user as any).en_fname || "";
            const lNameEN = (session.user as any).lastNameEN || (session.user as any).family_name_en || (session.user as any).en_lname || "";

            form.setValue("firstNameTH", fNameTH);
            form.setValue("lastNameTH", lNameTH);
            form.setValue("firstNameEN", fNameEN);
            form.setValue("lastNameEN", lNameEN);

            // Prefix Logic (Often ThaiID returns full names or specific titles)
            const pfixTH = (session.user as any).prefixTH || (session.user as any).title || (session.user as any).th_title || "";
            const pfixEN = (session.user as any).prefixEN || (session.user as any).title_en || (session.user as any).en_title || "";

            if (pfixTH) {
                if (pfixTH.includes("นาย")) form.setValue("prefixTH", "นาย");
                else if (pfixTH.includes("นางสาว")) form.setValue("prefixTH", "นางสาว");
                else if (pfixTH.includes("นาง")) form.setValue("prefixTH", "นาง");
            }
            if (pfixEN) {
                if (pfixEN.toLowerCase().includes("mr")) form.setValue("prefixEN", "Mr.");
                else if (pfixEN.toLowerCase().includes("mrs")) form.setValue("prefixEN", "Mrs.");
                else if (pfixEN.toLowerCase().includes("ms")) form.setValue("prefixEN", "Ms.");
            }

            const bdate = (session.user as any).birthdate || (session.user as any).birth_date || (session.user as any).birthDate;
            if (bdate) {
                let y, m, d;
                if (String(bdate).includes("-")) {
                    [y, m, d] = String(bdate).split("-");
                } else if (String(bdate).length === 8) {
                    y = String(bdate).substring(0, 4);
                    m = String(bdate).substring(4, 6);
                    d = String(bdate).substring(6, 8);
                }

                if (y && m && d) {
                    form.setValue("birthDay", String(Number(d)).padStart(2, '0'));
                    form.setValue("birthMonth", m.padStart(2, '0'));
                    form.setValue("birthYear", String(Number(y) + 543));
                }
            }

            if (session.user.image) setImageUrl(session.user.image);
        }
    }, [session, form]);

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

    function onSubmit(values: z.infer<typeof registerSchema>) {
        if (isUploading) {
            toast.error("กรุณารอให้อัปโหลดรูปภาพเสร็จสิ้น");
            return;
        }

        if (!isConsent) {
            toast.error("กรุณายอมรับนโยบายข้อมูลส่วนบุคคล (PDPA) ก่อนลงทะเบียน");
            return;
        }

        startTransition(async () => {
            const res = await requestOTP(values.email);
            if (res.error) {
                toast.error(res.error);
                return;
            }

            setPendingValues(values);
            setOtpOpen(true);
            toast.success("ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว (โปรดตรวจสอบในโฟลเดอร์จดหมายขยะ)");
        });
    }

    async function handleVerifyOTP() {
        if (!pendingValues) return;
        if (otpCode.length !== 6) {
            toast.error("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
            return;
        }

        setIsVerifying(true);
        try {
            const verifyRes = await verifyOTP(pendingValues.email, otpCode);
            if (verifyRes.error) {
                toast.error(verifyRes.error);
                setIsVerifying(false);
                return;
            }

            // OTP verified, proceed with registration logic
            toast.success("ยืนยันตัวตนสำเร็จ กำลังบันทึกข้อมูล...");
            setOtpOpen(false);

            if (isSocialLogin) {
                const formData = new FormData();
                Object.entries(pendingValues).forEach(([key, value]) => {
                    formData.append(key, value as string);
                });
                if (imageUrl) formData.append("image", imageUrl);

                const result = await updateProfile(formData);
                if (result.success) {
                    setIsSuccess(true);
                    // Force session update with profile status
                    await updateSession({
                        user: {
                            ...session?.user,
                            isProfileComplete: true
                        }
                    });
                    setTimeout(() => {
                        window.location.href = "/dashboard";
                    }, 2000);
                } else {
                    toast.error(result.error);
                }
            } else {
                const result = await register({ ...pendingValues, image: imageUrl });
                if (result.success) {
                    const loginResult = await signIn("credentials", {
                        email: pendingValues.email,
                        password: pendingValues.password,
                        redirect: false,
                    });

                    if (loginResult?.error) {
                        toast.error("ลงทะเบียนสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยตนเอง");
                        router.push("/login");
                    } else {
                        setIsSuccess(true);
                        // Force session update with profile status
                        await updateSession({
                            user: {
                                isProfileComplete: true
                            }
                        });
                        setTimeout(() => {
                            window.location.href = "/dashboard";
                        }, 2000);
                    }
                } else if (result.error) {
                    toast.error(result.error);
                }
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการตรวจสอบ OTP");
        } finally {
            setIsVerifying(false);
        }
    }

    const handleThaiDClick = () => {
        setIsPulling(true);
        signIn("thaid", { callbackUrl: window.location.href });
    };

    return (
        <>
            {isSuccess ? (
                <Card className="border-none shadow-[0_20px_60px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white max-w-2xl mx-auto mt-20">
                    <CardContent className="p-16 text-center space-y-8">
                        <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce">
                            <Check className="w-12 h-12 text-emerald-600" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-slate-800">ลงทะเบียนสำเร็จสมบูรณ์!</h2>
                            <p className="text-xl text-slate-500 font-medium">
                                ยินดีต้อนรับเข้าสูระบบ OVEC Supervise Clinic<br />
                                ระบบกำลังนำท่านเข้าสู่หน้า Dashboard...
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-none bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden max-w-7xl mx-auto transition-all duration-300">
                    <div className="text-center py-10 border-b border-slate-50 bg-slate-50/30 relative">
                        <div
                            className="mx-auto w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center mb-6 border-2 border-dashed border-blue-200 cursor-pointer hover:bg-blue-50 transition relative overflow-hidden group shadow-sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imageUrl ? (
                                <>
                                    <Image src={imageUrl!} alt="Profile" fill className="object-cover" />
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
                                            <Camera className="w-10 h-10 text-[#1a237e] mb-1 group-hover:scale-110 transition" />
                                            <span className="text-[11px] font-black text-blue-600">รูปภาพโปรไฟล์</span>
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

                        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                            {isSocialLogin ? "ตั้งค่าระบบและสรุปข้อมูล" : "ลงทะเบียนสมัครสมาชิก"}
                        </h1>
                        <p className="text-slate-400 font-medium">
                            {isSocialLogin
                                ? "กรุณากรอกข้อมูลเพิ่มเติมให้ครบถ้วนเพื่อเริ่มต้นใช้งานระบบ"
                                : "กรุณากรอกข้อมูลให้ครบถ้วนเพื่อรับสิทธิประโยชน์และการรับรองผลนิเทศทางอิเล็กทรอนิกส์"}
                        </p>

                        {!isSocialLogin && (
                            <div className="mt-8 px-8">
                                <div className="flex flex-col items-start gap-3">
                                    <span className="text-sm font-black text-slate-800 ml-1">ดึงข้อมูลจาก</span>
                                    <Button
                                        type="button"
                                        onClick={handleThaiDClick}
                                        disabled={isPulling}
                                        className="bg-[#0b0c5f] hover:bg-[#07083f] h-12 px-10 rounded-xl transition-all shadow-md group active:scale-95 disabled:opacity-70"
                                    >
                                        {isPulling ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                                        ) : (
                                            <span className="font-bold flex items-center gap-2">
                                                <span className="text-white">Thai</span>
                                                <span className="text-orange-400">ID</span>
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <CardContent className="p-10">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">

                                {/* Section 1: Identity & Credentials */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-4 py-1">
                                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-xl font-black text-slate-800">ข้อมูลยืนยันตัวตนและบัญชี</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-slate-800 font-black text-sm">อีเมล <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                            </div>
                                                            <Input placeholder="name@example.com" {...field} className="h-12 pl-12 pr-4 rounded-xl border-slate-200 bg-white text-slate-900 font-black focus:border-blue-500 focus:ring-blue-500/10 transition-all" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="idCard"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-slate-800 font-black text-sm">หมายเลขบัตรประชาชน <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="_-____-_____-__-_"
                                                            {...field}
                                                            maxLength={13}
                                                            className="h-12 px-5 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-black placeholder:text-slate-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="text-slate-800 font-black text-sm">รหัสผ่าน <span className="text-red-500">*</span></FormLabel>
                                                        <FormControl>
                                                            <div className="relative group">
                                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                                </div>
                                                                <Input type={showPassword ? "text" : "password"} {...field} className="h-12 pl-12 pr-12 rounded-xl border-slate-200 bg-white text-slate-900 font-black focus:border-blue-500 focus:ring-blue-500/10 transition-all" />
                                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-500 transition-colors">
                                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                                </button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="confirmPassword"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="text-slate-800 font-black text-sm">ยืนยันรหัสผ่าน <span className="text-red-500">*</span></FormLabel>
                                                        <FormControl>
                                                            <div className="relative group">
                                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                    <ShieldCheck className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                                </div>
                                                                <Input type={showPassword ? "text" : "password"} {...field} className="h-12 pl-12 pr-4 rounded-xl border-slate-200 bg-white text-slate-900 font-black focus:border-blue-500 focus:ring-blue-500/10 transition-all" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="flex justify-end p-1">
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs font-black text-blue-600 hover:underline flex items-center gap-2">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                {showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่านสำหรับการสมัครนี้"}
                                            </button>
                                        </div>
                                    </>
                                </div>

                                {/* Section 2: Personal Names */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-4 py-1">
                                        <UserCircle className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-xl font-black text-slate-800">ข้อมูลชื่อ-นามสกุล</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="prefixTH"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 md:col-span-2">
                                                    <FormLabel className="text-slate-600 font-bold text-xs">คำนำหน้าชื่อ (TH) <span className="text-red-500">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-900 font-bold">
                                                                <SelectValue placeholder="- เลือก -" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl shadow-xl">
                                                            {prefixesTH.map(p => <SelectItem key={p} value={p} className="font-bold py-3">{p}</SelectItem>)}
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
                                                <FormItem className="space-y-2 md:col-span-5">
                                                    <FormLabel className="text-slate-600 font-bold text-xs">ชื่อ (TH) <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-900 font-bold" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastNameTH"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 md:col-span-5">
                                                    <FormLabel className="text-slate-600 font-bold text-xs">นามสกุล (TH) <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-900 font-bold" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="prefixEN"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 md:col-span-2">
                                                    <FormLabel className="text-slate-600 font-bold text-xs">คำนำหน้าชื่อ (EN) <span className="text-red-500">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-900 font-bold">
                                                                <SelectValue placeholder="- เลือก -" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl shadow-xl">
                                                            {prefixesEN.map(p => <SelectItem key={p} value={p} className="font-bold py-3">{p}</SelectItem>)}
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
                                                <FormItem className="space-y-2 md:col-span-5">
                                                    <FormLabel className="text-slate-600 font-bold text-xs">ชื่อ (EN) <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-900 font-bold" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastNameEN"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 md:col-span-5">
                                                    <FormLabel className="text-slate-600 font-bold text-xs">นามสกุล (EN) <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-900 font-bold" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-3">
                                            <FormLabel className="text-slate-800 font-black text-sm">วัน/เดือน/ปีเกิด <span className="text-red-500">*</span></FormLabel>
                                            <div className="grid grid-cols-3 gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name="birthDay"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 font-bold">
                                                                        <SelectValue placeholder="วัน" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="rounded-xl">{days.map(d => <SelectItem key={d} value={d} className="font-bold">{d}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="birthMonth"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 font-bold">
                                                                        <SelectValue placeholder="เดือน" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="rounded-xl">{months.map(m => <SelectItem key={m.value} value={m.value} className="font-bold">{m.label}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="birthYear"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 font-bold">
                                                                        <SelectValue placeholder="ปี พ.ศ." />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="rounded-xl scroll-auto max-h-[300px]">{years.map(y => <SelectItem key={y} value={y} className="font-bold">{y}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormMessage />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-slate-800 font-black text-sm">เบอร์โทรศัพท์มือถือ <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                                            <Input placeholder="08XXXXXXXX" {...field} className="h-12 pl-12 rounded-xl border-slate-200 bg-white text-slate-900 font-bold shadow-inner" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Section 3: Professional Details */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-4 py-1">
                                        <School className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-xl font-black text-slate-800">ข้อมูลหน่วยงานสายงาน</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="college"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-slate-800 font-black text-sm">ชื่อสถานศึกษา / หน่วยงานที่สังกัด <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                                            <Input placeholder="เช่น วิทยาลัยเทคนิค..." {...field} className="h-12 pl-12 rounded-xl border-slate-200 bg-white text-slate-900 font-bold" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="province"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2 flex flex-col pt-1">
                                                        <FormLabel className="text-slate-800 font-black text-sm">จังหวัด</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button variant="outline" role="combobox" className={cn("h-12 px-4 rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-all text-sm justify-between shadow-sm", !field.value && "text-slate-400 font-medium", field.value && "text-slate-900 font-bold")}>
                                                                        {field.value || "เลือกจังหวัด"}
                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[240px] p-0 rounded-2xl shadow-2xl border-slate-100 outline-none">
                                                                <Command>
                                                                    <CommandInput placeholder="ค้นหาจังหวัด..." className="text-sm font-bold" />
                                                                    <CommandList className="max-h-[300px] overflow-y-auto scrollbar-hide py-2">
                                                                        <CommandEmpty className="text-sm py-8 text-center text-slate-400 font-bold">ไม่พบรายชื่อจังหวัด</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {provinces.map((province) => (
                                                                                <CommandItem value={province} key={province} onSelect={() => form.setValue("province", province)} className="cursor-pointer text-sm font-bold py-3 px-6 hover:bg-blue-50">
                                                                                    <Check className={cn("mr-3 h-4 w-4 text-blue-600", province === field.value ? "opacity-100" : "opacity-0")} />
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

                                            <FormField
                                                control={form.control}
                                                name="region"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-slate-800 font-black text-sm">ภาค</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-900 font-bold">
                                                                    <SelectValue placeholder="เลือกภาค" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-xl shadow-xl border-none">
                                                                <SelectItem value="North" className="font-bold py-3 px-4">เหนือ</SelectItem>
                                                                <SelectItem value="South" className="font-bold py-3 px-4">ใต้</SelectItem>
                                                                <SelectItem value="Central" className="font-bold py-3 px-4">กลาง</SelectItem>
                                                                <SelectItem value="Northeast" className="font-bold py-3 px-4">ตะวันออกเฉียงเหนือ</SelectItem>
                                                                <SelectItem value="East_Bangkok" className="font-bold py-3 px-4">ตะวันออกและกทม.</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                        <div className="w-full md:w-64">
                                            <FormField
                                                control={form.control}
                                                name="position"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-slate-800 font-black text-sm">ตำแหน่ง <span className="text-red-500">*</span></FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-900 font-bold shadow-sm">
                                                                    <SelectValue placeholder="เลือกตำแหน่ง" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-xl shadow-xl border-none">
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
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="w-full md:w-64">
                                            <FormField
                                                control={form.control}
                                                name="academicStanding"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-slate-800 font-black text-sm">วิทยฐานะ</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-900 font-bold shadow-sm">
                                                                    <SelectValue placeholder="เลือกวิทยฐานะ" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-xl shadow-xl border-none">
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

                                        {!["รองผู้อำนวยการ", "ผู้อำนวยการ", "ศึกษานิเทศก์", "อื่นๆ"].includes(form.watch("position")) && (
                                            <div className="w-full md:w-80">
                                                <FormField
                                                    control={form.control}
                                                    name="teachingSubject"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-2">
                                                            <FormLabel className="text-slate-800 font-black text-sm">สาขาวิชาที่สอน <span className="text-red-500">*</span></FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="เช่น คอมพิวเตอร์ธุรกิจ, ภาษาอังกฤษ ฯลฯ"
                                                                    {...field}
                                                                    className="h-12 px-5 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-100 transition-all text-slate-900 font-bold placeholder:text-slate-300 shadow-sm"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="affiliation"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-slate-800 font-black text-sm">สังกัดหน่วยงาน</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-900 font-bold shadow-sm">
                                                                <SelectValue placeholder="เลือกสังกัด" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl shadow-xl border-none">
                                                            <SelectItem value="สถานศึกษาภาครัฐ" className="font-bold py-3 px-4">สถานศึกษาภาครัฐ</SelectItem>
                                                            <SelectItem value="สถานศึกษาภาคเอกชน" className="font-bold py-3 px-4">สถานศึกษาภาคเอกชน</SelectItem>
                                                            <SelectItem value="สถานศึกษาที่ไม่ได้สังกัด สอศ." className="font-bold py-3 px-4">สถานศึกษาที่ไม่ได้สังกัด สอศ.</SelectItem>
                                                            <SelectItem value="หน่วยศึกษานิเทศก์" className="font-bold py-3 px-4">หน่วยศึกษานิเทศก์</SelectItem>
                                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคใต้" className="font-bold py-3 px-4">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคใต้</SelectItem>
                                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคเหนือ" className="font-bold py-3 px-4">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคเหนือ</SelectItem>
                                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคกลาง" className="font-bold py-3 px-4">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคกลาง</SelectItem>
                                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคใต้ (จชต.)" className="font-bold py-3 px-4">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคใต้ (จชต.)</SelectItem>
                                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคตะวันออกเฉียงเหนือ" className="font-bold py-3 px-4">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคตะวันออกเฉียงเหนือ</SelectItem>
                                                            <SelectItem value="ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคตะวันออกและกรุงเทพมหานคร" className="font-bold py-3 px-4">ศูนย์ส่งเสริมและพัฒนาอาชีวศึกษาภาคตะวันออกและกรุงเทพมหานคร</SelectItem>
                                                            <SelectItem value="อื่น ๆ" className="font-bold py-3 px-4">อื่น ๆ</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-100 space-y-6">
                                    {/* Identity Verification Section */}
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-4 py-1">
                                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                                            <h3 className="text-xl font-black text-slate-800">ยืนยันตัวตน</h3>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                            <p className="text-sm font-bold text-slate-800 mb-4">ช่องทางการรับรหัส OTP <span className="text-red-500">*</span></p>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2 max-w-[200px] w-full border border-blue-500 bg-white rounded-lg p-3 cursor-pointer ring-1 ring-blue-100 shadow-sm">
                                                    <input type="radio" id="otp-email" name="otp-method" defaultChecked className="w-4 h-4 text-blue-600 cursor-pointer" />
                                                    <label htmlFor="otp-email" className="text-sm font-bold text-blue-600 cursor-pointer">อีเมล</label>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="pdpa-consent"
                                                    checked={isConsent}
                                                    onChange={(e) => setIsConsent(e.target.checked)}
                                                    className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                                <label htmlFor="pdpa-consent" className="text-sm text-slate-600 leading-relaxed cursor-pointer font-medium">
                                                    1) ข้าพเจ้ายินยอมให้สถาบันและองค์กรพันธมิตรของสถาบัน เก็บรวบรวม ใช้และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า เพื่อนำไปใช้ในการประมวลผล การพิสูจน์ยืนยันตัวตน ตรวจสอบความถูกต้องในการเข้าทำธุรกรรมและ/หรือใช้บริการของสถาบัน รวมทั้งส่งข้อมูล ข่าวสาร และสิทธิประโยชน์ต่างๆ ผ่านทางอีเมล เอสเอ็มเอส และแอปพลิเคชัน โดยข้าพเจ้าได้อ่านและศึกษารายละเอียด <Link href="/privacy" className="text-blue-600 font-bold hover:underline">นโยบายการคุ้มครองข้อมูลส่วนบุคคล</Link> ของสถาบันให้ไว้ที่ Privacy Center โดยตลอดอย่างดีแล้ว
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-16 bg-[#ff9e99] hover:bg-[#ff8a84] text-white rounded-2xl font-black text-2xl shadow-xl shadow-red-100 transition-all active:scale-[0.98] gap-4"
                                        disabled={isPending || isUploading || !isConsent}
                                    >
                                        {isPending ? "กำลังดำเนินการ..." : "ลงทะเบียน"}
                                    </Button>

                                    <div className="text-center">
                                        <Link href="/login" className="inline-flex items-center gap-3 text-slate-500 hover:text-blue-600 font-bold transition-all group">
                                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                                            <span>หากมีบัญชีอยู่แล้ว หรือต้องการเข้าใช้ผ่าน ThaiD/OVEC ID? คลิกที่นี่เพื่อเข้าสู่ระบบ</span>
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}

            {/* OTP Verification Dialog */}
            <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-8 border-none shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                    <DialogHeader className="text-center mb-6">
                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-8 h-8 text-blue-600" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-slate-800">ยืนยันรหัส OTP</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium pt-2">
                            เราได้ส่งรหัส OTP 6 หลักไปยังอีเมลของคุณแล้ว<br />
                            <span className="font-bold text-slate-800">{pendingValues?.email}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 flex flex-col items-center">
                        <Input
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            className="text-center text-4xl font-black tracking-[0.5em] h-16 w-full bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-blue-500"
                        />
                        <Button
                            onClick={handleVerifyOTP}
                            disabled={isVerifying || otpCode.length !== 6}
                            className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-100"
                        >
                            {isVerifying ? (
                                <><Loader2 className="w-5 h-5 mr-no animate-spin" /> กำลังตรวจสอบ...</>
                            ) : "ยืนยันรหัส OTP และลงทะเบียน"}
                        </Button>
                        <button
                            onClick={() => {
                                if (pendingValues) {
                                    toast.promise(requestOTP(pendingValues.email), {
                                        loading: 'กำลังขอรหัสใหม่...',
                                        success: 'ส่งรหัส OTP ใหม่เรียบร้อยแล้ว',
                                        error: 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง'
                                    });
                                }
                            }}
                            className="text-sm font-bold text-slate-500 hover:text-blue-600 hover:underline"
                        >
                            ส่งรหัสอีกครั้ง
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
