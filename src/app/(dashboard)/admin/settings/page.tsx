
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
    getFooterSettings, updateFooterSettings,
    getBanners, updateBanners,
    getHeroSettings, updateHeroSettings
} from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Loader2, Save, Mail, Phone, MapPin, AlignLeft,
    Globe, Plus, Trash2, Image as ImageIcon, Link as LinkIcon,
    Camera, LayoutGrid, Type, Quote, Copyright
} from "lucide-react";
import Image from "next/image";

export default function AdminSettingsPage() {
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState({
        description: "",
        contact: {
            email: "",
            phone: "",
            address: ""
        },
        copyright: "",
        relatedLinks: []
    });
    const [heroForm, setHeroForm] = useState({
        backgroundImage: "",
        title: "",
        subtitle: ""
    });
    const [banners, setBanners] = useState<{ image: string, link: string }[]>([]);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const [footerData, bannerData, heroData] = await Promise.all([
                    getFooterSettings(),
                    getBanners(),
                    getHeroSettings()
                ]);
                setForm(footerData);
                setBanners(bannerData);
                setHeroForm(heroData);
            } catch (error) {
                toast.error("ไม่สามารถโหลดข้อมูลได้");
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    const handleSaveFooter = () => {
        startTransition(async () => {
            try {
                const res = await updateFooterSettings(form);
                if (res.success) {
                    toast.success("บันทึกการตั้งค่า Footer เรียบร้อยแล้ว");
                }
            } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการบันทึก Footer");
            }
        });
    };

    const handleSaveBanners = () => {
        startTransition(async () => {
            try {
                const res = await updateBanners(banners);
                if (res.success) {
                    toast.success("บันทึกแบนเนอร์เรียบร้อยแล้ว");
                }
            } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการบันทึกแบนเนอร์");
            }
        });
    };

    const handleSaveHero = () => {
        startTransition(async () => {
            try {
                const res = await updateHeroSettings(heroForm);
                if (res.success) {
                    toast.success("บันทึกการตั้งค่า Hero เรียบร้อยแล้ว");
                }
            } catch (error) {
                toast.error("เกิดข้อผิดพลาดในการบันทึก Hero");
            }
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
            return;
        }

        const uploadKey = index !== undefined ? `${type}-${index}` : type;
        setIsUploading(uploadKey);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.url) {
                if (type === "banner" && index !== undefined) {
                    const newBanners = [...banners];
                    newBanners[index].image = data.url;
                    setBanners(newBanners);
                } else if (type === "hero") {
                    setHeroForm({ ...heroForm, backgroundImage: data.url });
                }
                toast.success("อัปโหลดรูปภาพสำเร็จ");
            } else {
                toast.error(data.error || "อัปโหลดรูปภาพไม่สำเร็จ");
            }
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        } finally {
            setIsUploading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h1 className="text-2xl font-black text-slate-900">ตั้งค่าระบบ</h1>
                <p className="text-slate-500 font-medium">จัดการข้อมูลพื้นฐานและเนื้อหาของเว็บไซต์</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Hero Section Management */}
                <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50">
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-pink-600" />
                            จัดการส่วนหัว (Hero Section)
                        </CardTitle>
                        <CardDescription>
                            แก้ไขข้อความพาดหัวและพื้นหลังส่วนบนสุดของเว็บไซต์
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Type className="w-4 h-4 text-pink-500" /> หัวข้อหลัก (Title)
                                    </label>
                                    <Textarea
                                        value={heroForm.title}
                                        onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                                        className="rounded-xl border-slate-200 font-medium h-24"
                                        placeholder="ใส่ \n เพื่อขึ้นบรรทัดใหม่"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Quote className="w-4 h-4 text-pink-500" /> หัวข้อย่อย (Subtitle)
                                    </label>
                                    <Textarea
                                        value={heroForm.subtitle}
                                        onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                                        className="rounded-xl border-slate-200 font-medium h-24"
                                        placeholder="ใส่ \n เพื่อขึ้นบรรทัดใหม่"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-pink-500" /> รูปภาพพื้นหลัง (Background)
                                </label>
                                <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group">
                                    {heroForm.backgroundImage ? (
                                        <Image src={heroForm.backgroundImage} alt="Hero Preview" fill className="object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}
                                    {isUploading === "hero" && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-lg font-bold"
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = (e) => handleImageUpload(e as any, "hero");
                                                input.click();
                                            }}
                                        >
                                            <Camera className="w-4 h-4 mr-1.5" />
                                            เปลี่ยนรูปพื้นหลัง
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium">แนะนำรูปภาพขนาด 1920x1080px หรือใกล้เคียง</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <Button
                                onClick={handleSaveHero}
                                disabled={isPending}
                                className="h-11 px-8 rounded-xl bg-pink-600 hover:bg-pink-700 font-bold shadow-lg shadow-pink-100 flex items-center gap-2"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                บันทึกการตั้งค่า Hero
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Banner Management */}
                <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50">
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-indigo-600" />
                            จัดการแบนเนอร์หน้าแรก (Slider)
                        </CardTitle>
                        <CardDescription>
                            เพิ่ม ลบ หรือแก้ไขแบนเนอร์ที่จะแสดงเป็นสไลด์ในหน้าหลัก
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {banners.map((banner, index) => (
                                <div key={index} className="relative group border border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-4 animate-in fade-in zoom-in duration-300">
                                    <div className="relative aspect-[3.5/1] bg-slate-200 rounded-xl overflow-hidden group-hover:ring-2 ring-indigo-500/20 transition-all">
                                        {banner.image ? (
                                            <Image src={banner.image} alt={`Banner ${index + 1}`} fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ImageIcon className="w-8 h-8 text-slate-400" />
                                            </div>
                                        )}
                                        {isUploading === `banner-${index}` && (
                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="rounded-lg font-bold"
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e) => handleImageUpload(e as any, "banner", index);
                                                    input.click();
                                                }}
                                            >
                                                <Camera className="w-4 h-4 mr-1.5" />
                                                เปลี่ยนรูป
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <LinkIcon className="w-3 h-3" /> ลิงก์เมื่อคลิก (Link)
                                        </label>
                                        <Input
                                            value={banner.link}
                                            onChange={(e) => {
                                                const newBanners = [...banners];
                                                newBanners[index].link = e.target.value;
                                                setBanners(newBanners);
                                            }}
                                            placeholder="https://..."
                                            className="h-10 rounded-xl border-slate-200 font-medium"
                                        />
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-8 w-8 bg-white border border-slate-100 shadow-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                            const newBanners = banners.filter((_, i) => i !== index);
                                            setBanners(newBanners);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            <button
                                onClick={() => setBanners([...banners, { image: "", link: "" }])}
                                className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                            >
                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                    <Plus className="w-6 h-6 text-indigo-600" />
                                </div>
                                <span className="text-sm font-black text-slate-500">เพิ่มแบนเนอร์ใหม่</span>
                            </button>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <Button
                                onClick={handleSaveBanners}
                                disabled={isPending}
                                className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100 flex items-center gap-2"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                บันทึกแบนเนอร์
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Management */}
                <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50">
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            <AlignLeft className="w-5 h-5 text-blue-600" />
                            ข้อมูลท้ายเว็บไซต์ (Footer)
                        </CardTitle>
                        <CardDescription>
                            จัดการคำอธิบายและข้อมูลติดต่อที่จะแสดงในทุกๆ หน้า
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 font-sans">คำอธิบายระบบ</label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={4}
                                className="rounded-xl border-slate-200 resize-none font-medium"
                                placeholder="บรรยายเกี่ยวกับระบบ..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 font-sans">
                                    <Mail className="w-4 h-4 text-slate-400" /> อีเมลติดต่อ
                                </label>
                                <Input
                                    value={form.contact.email}
                                    onChange={(e) => setForm({
                                        ...form,
                                        contact: { ...form.contact, email: e.target.value }
                                    })}
                                    className="rounded-xl border-slate-200 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 font-sans">
                                    <Phone className="w-4 h-4 text-slate-400" /> เบอร์โทรศัพท์
                                </label>
                                <Input
                                    value={form.contact.phone}
                                    onChange={(e) => setForm({
                                        ...form,
                                        contact: { ...form.contact, phone: e.target.value }
                                    })}
                                    className="rounded-xl border-slate-200 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 font-sans">
                                <MapPin className="w-4 h-4 text-slate-400" /> ที่อยู่/จังหวัด
                            </label>
                            <Input
                                value={form.contact.address}
                                onChange={(e) => setForm({
                                    ...form,
                                    contact: { ...form.contact, address: e.target.value }
                                })}
                                className="rounded-xl border-slate-200 font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 font-sans">
                                <Copyright className="w-4 h-4 text-slate-400" /> ข้อความลิขสิทธิ์ (Copyright)
                            </label>
                            <Input
                                value={form.copyright}
                                onChange={(e) => setForm({ ...form, copyright: e.target.value })}
                                className="rounded-xl border-slate-200 font-medium"
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100 font-sans">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-600" /> หน่วยงานที่เกี่ยวข้อง (ลิงก์ภายนอก)
                                </label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg h-8 gap-1.5 font-bold"
                                    onClick={() => {
                                        const newLinks = [...(form as any).relatedLinks || [], { label: "", url: "" }];
                                        setForm({ ...form, relatedLinks: newLinks } as any);
                                    }}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    เพิ่มหน่วยงาน
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {((form as any).relatedLinks || []).map((link: any, index: number) => (
                                    <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                                            <Input
                                                placeholder="ชื่อหน่วยงาน"
                                                value={link.label}
                                                onChange={(e) => {
                                                    const newLinks = [...(form as any).relatedLinks];
                                                    newLinks[index].label = e.target.value;
                                                    setForm({ ...form, relatedLinks: newLinks } as any);
                                                }}
                                                className="rounded-xl border-slate-200 font-medium h-10"
                                            />
                                            <Input
                                                placeholder="URL (เช่น https://...)"
                                                value={link.url}
                                                onChange={(e) => {
                                                    const newLinks = [...(form as any).relatedLinks];
                                                    newLinks[index].url = e.target.value;
                                                    setForm({ ...form, relatedLinks: newLinks } as any);
                                                }}
                                                className="rounded-xl border-slate-200 font-medium h-10"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl shrink-0"
                                            onClick={() => {
                                                const newLinks = (form as any).relatedLinks.filter((_: any, i: number) => i !== index);
                                                setForm({ ...form, relatedLinks: newLinks } as any);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {((form as any).relatedLinks || []).length === 0 && (
                                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                        <p className="text-xs font-bold text-slate-400 italic">ยังไม่มีข้อมูลหน่วยงาน</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                onClick={handleSaveFooter}
                                disabled={isPending}
                                className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center gap-2"
                            >
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                บันทึกการเปลี่ยนแปลง Footer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
