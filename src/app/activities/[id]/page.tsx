import { auth } from "@/auth";
import { getPublicActivityDetail } from "@/actions/public";
import { getMyRegistrations } from "@/actions/registration";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    ChevronLeft,
    Bell,
    Share2,
    CheckCircle2,
    Download,
    FileText,
    Video,
    Mail,
    Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RegisterButton } from "@/components/activity/register-button";
import { ActivityActionButtons } from "@/components/activity/activity-action-buttons";
import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";

export const dynamic = "force-dynamic";

export default async function ActivityDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const activity = await getPublicActivityDetail(id);

    if (!activity) {
        notFound();
    }

    const session = await auth();
    const isLoggedIn = !!session;

    let isRegistered = false;
    if (isLoggedIn) {
        const myRegistrations = await getMyRegistrations();
        isRegistered = myRegistrations.some((r: any) => r.activityId._id === id || r.activityId === id);
    }

    const current = activity.currentRegistrations ?? 0;
    const quota = activity.quota ?? 0;
    const progress = Math.min((current / quota) * 100, 100);
    const isFull = current >= quota;

    return (
        <div className="min-h-screen bg-white">
            <Navbar isLoggedIn={isLoggedIn} />

            <main className="bg-slate-50/50 pb-20 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 text-sm font-bold"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        ย้อนกลับหน้าแรก
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Content */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Header Card */}
                            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                <div className="relative aspect-video w-full bg-slate-100">
                                    <Image
                                        src={activity.bannerImage || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"}
                                        alt={activity.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-6 right-6">
                                        <div className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">
                                            {activity.status === 'Open' ? 'เปิดรับสมัคร' :
                                                activity.status === 'Full' ? 'เต็มแล้ว' : 'ปิดรับสมัคร'}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 md:p-10 space-y-6">
                                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                                        {activity.title}
                                    </h1>

                                    <div className="flex flex-wrap gap-6 text-slate-500">
                                        <div className="flex items-center gap-2.5">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-bold">{format(new Date(activity.startTime), "d MMMM yyyy", { locale: th })}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-bold">
                                                {format(new Date(activity.startTime), "HH:mm")} - {format(new Date(activity.endTime), "HH:mm")} น.
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-bold">{activity.location.startsWith('http') ? "ออนไลน์ผ่าน Zoom" : activity.location}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-50">
                                        <h2 className="text-xl font-black text-slate-900">รายละเอียด</h2>
                                        <div className="text-slate-600 text-sm leading-relaxed space-y-4 whitespace-pre-line text-justify">
                                            {activity.description}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Requirements Card */}
                            <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-100 shadow-sm space-y-6">
                                <h2 className="text-xl font-black text-slate-900">สิ่งที่ต้องเตรียม</h2>
                                <div className="grid gap-4">
                                    {(activity.requirements && activity.requirements.length > 0) ? (
                                        activity.requirements.map((item: string, i: number) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <div className="mt-1">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <p className="text-slate-600 text-sm font-bold">{item}</p>
                                            </div>
                                        ))
                                    ) : (
                                        [
                                            "เตรียมคอมพิวเตอร์หรือโทรศัพท์ที่เชื่อมต่ออินเทอร์เน็ตได้",
                                            "ติดตั้งโปรแกรม Zoom",
                                            "เตรียมกระดาษและปากกาสำหรับจดบันทึก"
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <div className="mt-1">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <p className="text-slate-600 text-sm font-bold">{item}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Documents Card */}
                            {((activity.documents && activity.documents.length > 0) || activity.externalSourceLink) && (
                                <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                        <h2 className="text-xl font-black text-slate-900">เอกสารประกอบและสื่อการสอน</h2>
                                    </div>

                                    {new Date() < new Date(activity.startTime) ? (
                                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-300">
                                                <Clock className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-slate-900">ยังไม่ถึงเวลาเผยแพร่เอกสาร</p>
                                                <p className="text-[11px] font-bold text-slate-400 max-w-[280px]">เอกสารจะปรากฏให้ดาวน์โหลดเมื่อถึงวันและเวลาที่เริ่มการนิเทศ เพื่อให้การนิเทศเป็นไปอย่างมีประสิทธิภาพ</p>
                                            </div>
                                            <div className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 italic">
                                                ปลดล็อกเมื่อ: {format(new Date(activity.startTime), "d MMM yyyy HH:mm", { locale: th })} น.
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {activity.externalSourceLink && (
                                                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-3">
                                                    <div className="flex items-center gap-3 text-blue-700">
                                                        <Share2 className="w-5 h-5" />
                                                        <span className="font-black text-sm">ลิงก์เอกสารประกอบเพิ่มเติม (Google Drive / OneDrive)</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium">แอดมินหรือศึกษานิเทศก์ได้แนบลิงก์ภายนอกสำหรับรวบรวมเอกสารชุดใหญ่ไว้ให้ดาวน์โหลดเพิ่มเติม</p>
                                                    <Button className="w-full bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-2xl font-black gap-2 h-12 shadow-sm" asChild>
                                                        <a href={activity.externalSourceLink} target="_blank" rel="noopener noreferrer">
                                                            <Download className="w-4 h-4" />
                                                            ไปยังลิงก์เอกสาร
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                {activity.documents.map((doc: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 group hover:bg-slate-100 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-[10px] text-slate-400 shadow-sm uppercase">
                                                                {doc.type?.split('/')[1] || doc.name.split('.').pop() || 'FILE'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400">
                                                                    {doc.size ? `${(doc.size / (1024 * 1024)).toFixed(2)} MB` : 'ไม่ทราบขนาด'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="gap-2 text-slate-500 font-bold hover:text-blue-600" asChild>
                                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                                <Download className="w-4 h-4" />
                                                                ดาวน์โหลด
                                                            </a>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Meeting Info (Only if registered) */}
                            {isRegistered && activity.location.startsWith('http') && (
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 md:p-10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Video className="w-6 h-6 text-blue-600" />
                                        <h2 className="text-xl font-black text-[#1a237e]">ข้อมูลการเข้าประชุม</h2>
                                    </div>

                                    {new Date() < new Date(activity.startTime) ? (
                                        <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 border border-blue-100">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-300">
                                                <Video className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs font-black text-[#1a237e]">ระบบจะเปิดให้เข้าประชุมเมื่อถึงเวลาเริ่มต้น</p>
                                            <p className="text-[10px] font-bold text-slate-400">กรุณากลับเข้ามาอีกครั้งในเวลา {format(new Date(activity.startTime), "HH:mm", { locale: th })} น.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl p-6 space-y-4">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-slate-500">Meeting ID:</span>
                                                <span className="font-black text-slate-900 tabular-nums">
                                                    {activity.meetingId || "ไม่ระบุ"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-slate-500">Password:</span>
                                                <span className="font-black text-slate-900">
                                                    {activity.meetingPassword || "ไม่ระบุ"}
                                                </span>
                                            </div>
                                            <Button className="w-full bg-[#26b8c4] hover:bg-[#1fa1ab] h-12 rounded-xl font-black gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-100" asChild>
                                                <a href={activity.location.startsWith('http') ? activity.location : '#'} target="_blank" rel="noopener noreferrer">
                                                    <Video className="w-5 h-5" />
                                                    เข้าร่วมประชุม (กดลิงก์)
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Registration Card */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-8">
                                <div className="text-center space-y-4 mb-8">
                                    <div className="text-3xl font-black text-slate-900 tabular-nums">
                                        {current}/{quota}
                                    </div>
                                    <div className="text-xs font-bold text-slate-400">ผู้ลงทะเบียน</div>
                                    {!isFull && (
                                        <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full">
                                            เหลือ {quota - current} ที่นั่ง
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Progress value={progress} className="h-2 bg-slate-100" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {isLoggedIn ? (
                                        <RegisterButton
                                            activityId={activity._id}
                                            isRegistered={isRegistered}
                                            isFull={isFull}
                                        />
                                    ) : (
                                        <Link href={`/login?callbackUrl=/activities/${activity._id}`} className="block">
                                            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95">
                                                เข้าสู่ระบบเพื่อลงทะเบียน
                                            </Button>
                                        </Link>
                                    )}

                                    <ActivityActionButtons
                                        activityId={activity._id}
                                        activityTitle={activity.title}
                                    />
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">ศึกษานิเทศก์</h3>
                                    <div className="flex gap-4">
                                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0">
                                            <Image
                                                src={activity.createdBy?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.createdBy?.name || 'User'}`}
                                                alt={activity.createdBy?.name || "Supervisor"}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 truncate">
                                                {activity.createdBy?.name || "ไม่ระบุ"}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400">
                                                {activity.createdBy?.profile?.position || "ศึกษานิเทศก์"}
                                                {activity.createdBy?.profile?.academicStanding ? `${activity.createdBy.profile.academicStanding}` : ""}
                                            </p>
                                            {activity.createdBy?.profile?.college && (
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                    {activity.createdBy.profile.college}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Mail className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">{activity.createdBy?.email || "contact@vec.go.th"}</span>
                                        </div>
                                        {activity.createdBy?.profile?.phone && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Phone className="w-3 h-3" />
                                                <span className="text-[10px] font-bold">{activity.createdBy.profile.phone}</span>
                                            </div>
                                        )}
                                        {!activity.createdBy?.profile?.phone && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Phone className="w-3 h-3" />
                                                <span className="text-[10px] font-bold italic opacity-60">ไม่ได้ระบุเบอร์โทรศัพท์</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
