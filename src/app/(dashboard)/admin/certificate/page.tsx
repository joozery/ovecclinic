
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Award } from "lucide-react";
import { getCertificateTemplate } from "@/actions/certificate-template";
import { CertificateTemplateEditor } from "@/components/certificate/certificate-template-editor";

export default async function CertificateSetupPage() {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        redirect("/dashboard");
    }

    const template = await getCertificateTemplate();

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] p-8 md:p-10 rounded-2xl shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/5 rounded-full -ml-32 -mb-32 blur-3xl" />
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-100 text-[9px] font-bold uppercase tracking-widest">
                            <Award className="w-3 h-3" /> Certificate Template Designer
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                            ออกแบบแม่แบบเกียรติบัตร<span className="text-yellow-400">.</span>
                        </h1>
                        <p className="text-blue-100/70 font-medium text-sm max-w-lg leading-relaxed">
                            อัปโหลดภาพพื้นหลัง แล้วลากข้อความ (ชื่อ, หลักสูตร, วันที่) ไปวางในตำแหน่งที่ต้องการ
                            เมื่อผู้เข้าร่วมกิจกรรมนิเทศครบเกณฑ์จะสามารถ Download เกียรติบัตรได้ทันที
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 text-right text-xs font-bold text-blue-300">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                            <span>ตัวอย่างแสดงแบบ Real-time</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span>บันทึกแล้วมีผลทันที</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* How-to Steps */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { step: "1", label: "อัปโหลดภาพพื้นหลัง", desc: "เลือกไฟล์ PNG/JPG สำหรับเกียรติบัตร", color: "bg-blue-50 text-blue-700 border-blue-100" },
                    { step: "2", label: "ลากวางข้อความ", desc: "ลากชื่อ, หลักสูตร, วันที่ ไปวางบนภาพ", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                    { step: "3", label: "ปรับรูปแบบตัวอักษร", desc: "แต่งสี ขนาด น้ำหนัก ให้สวยงาม", color: "bg-purple-50 text-purple-700 border-purple-100" },
                    { step: "4", label: "บันทึกและใช้งาน", desc: "ผู้เข้าร่วมดาวน์โหลดได้ทันทีหลังผ่าน", color: "bg-orange-50 text-orange-700 border-orange-100" },
                ].map(({ step, label, desc, color }) => (
                    <div key={step} className={`flex items-start gap-3 p-4 rounded-2xl border ${color}`}>
                        <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-sm font-black shrink-0">
                            {step}
                        </div>
                        <div>
                            <p className="text-xs font-black leading-tight">{label}</p>
                            <p className="text-[10px] font-medium opacity-70 mt-1 leading-snug">{desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor */}
            <CertificateTemplateEditor initialTemplate={template} />
        </div>
    );
}
