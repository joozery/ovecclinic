
import { getActivities } from "@/actions/activity";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, ArrowRight, Clock, Video, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { SearchInput } from "@/components/search-input";
import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";
import { auth } from "@/auth";
import { getSiteSetting } from "@/actions/site-settings";

export default async function PublicActivitiesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const search = typeof params.q === 'string' ? params.q : undefined;
    const activities = await getActivities(undefined, search);

    const session = await auth();
    const isLoggedIn = !!session;
    const manualUrl = await getSiteSetting("manual_url");

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar isLoggedIn={isLoggedIn} manualUrl={manualUrl} />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-4xl mx-auto mb-16 text-center">
                    <h1 className="text-4xl font-bold mb-4">กิจกรรมการนิเทศและอบรมที่เปิดรับสมัคร</h1>
                    <p className="text-slate-600 text-lg mb-8">
                        ร่วมยกระดับการจัดการเรียนการสอนและการทำงานผ่านกิจกรรมที่หลากหลาย
                    </p>
                    <div className="flex justify-center">
                        <SearchInput placeholder="ค้นหากิจกรรมที่น่าสนใจ..." className="w-full max-w-md shadow-lg" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activities.map((activity: any) => {
                        const current = activity.currentRegistrations ?? 0;
                        const quota = activity.quota ?? 0;
                        const isFull = current >= quota;
                        const remaining = quota - current;

                        return (
                            <Link key={activity._id} href={`/activities/${activity._id}`} className="group h-full">
                                <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer">
                                    {/* Visual Header */}
                                    <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-900 overflow-hidden shrink-0">
                                        {activity.bannerImage ? (
                                            <Image
                                                src={activity.bannerImage}
                                                alt={activity.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                            </>
                                        )}

                                        <div className="absolute top-4 right-4">
                                            {isFull ? (
                                                <div className="bg-amber-500 text-white text-[9px] font-bold px-3 py-1 rounded-md shadow-lg">
                                                    เต็มแล้ว
                                                </div>
                                            ) : (
                                                <div className="bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-md shadow-lg">
                                                    เปิดรับสมัคร
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Body */}
                                    <div className="p-5 flex-grow space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-[#1a237e] transition-colors line-clamp-1">
                                                {activity.title}
                                            </h4>
                                            <p className="text-slate-500 text-xs font-medium line-clamp-1 leading-relaxed">
                                                {activity.description}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2.5 text-slate-600">
                                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                    <Calendar className="w-3.5 h-3.5 text-[#1a237e]" />
                                                </div>
                                                <span className="text-xs font-bold">
                                                    {format(new Date(activity.startTime), "d MMM ", { locale: th })}
                                                    {new Date(activity.startTime).getFullYear() + 543}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-slate-600">
                                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                    <Clock className="w-3.5 h-3.5 text-[#1a237e]" />
                                                </div>
                                                <span className="text-xs font-bold">{format(new Date(activity.startTime), "HH:mm")} - {format(new Date(activity.endTime), "HH:mm")} น.</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-slate-600">
                                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                    <Users className="w-3.5 h-3.5 text-[#1a237e]" />
                                                </div>
                                                <div className="text-xs font-bold">
                                                    {current}/{quota} คน
                                                    {!isFull && <span className="text-emerald-500 ml-1.5">(เหลือ {remaining})</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2 py-1 rounded-lg text-[9px] font-bold">
                                                <Video className="w-2.5 h-2.5" /> ออนไลน์
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2 py-1 rounded-lg text-[9px] font-bold">
                                                <FileText className="w-2.5 h-2.5" /> มีเอกสาร
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-5 pb-5 pt-3 mt-auto border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-100 shrink-0">
                                                <Image
                                                    src={activity.createdBy?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.createdBy?.name || 'speaker'}`}
                                                    alt={activity.createdBy?.name || "Speaker"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-slate-900 truncate">
                                                    {activity.createdBy?.name || "ไม่ระบุ"}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 truncate">
                                                    {activity.createdBy?.profile?.position || "วิทยากรผู้เชี่ยวชาญ"}
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0"
                                        >
                                            ลงทะเบียน
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                    {activities.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl">
                            <p className="text-slate-500 font-medium">ไม่พบกิจกรรมที่เปิดรับสมัครในขณะนี้</p>
                        </div>
                    )}
                </div>

                <div className="mt-20 text-center bg-slate-50 rounded-3xl p-12 border border-slate-200">
                    <h3 className="text-2xl font-bold mb-4">คุณเป็นผู้นิเทศใช่หรือไม่?</h3>
                    <p className="text-slate-600 mb-8 max-w-xl mx-auto">
                        เข้าสู่ระบบในฐานะผู้นิเทศเพื่อจัดการกิจกรรมและออกเกียรติบัตร
                    </p>
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/login">เข้าสู่ระบบผู้นิเทศ</Link>
                    </Button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
