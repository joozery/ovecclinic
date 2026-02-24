"use client";

import { Users, BarChart3, CheckCircle2, ShieldCheck, GraduationCap, School } from "lucide-react";

export function Features() {
    const features = [
        {
            title: "ระบบสมัครออนไลน์",
            desc: "ลงทะเบียนเข้าร่วมกิจกรรมสะดวก รวดเร็ว พร้อมระบบแจ้งเตือนผ่านช่องทางต่างๆ",
            icon: <Users className="w-6 h-6" />,
            color: "bg-blue-50 text-blue-600"
        },
        {
            title: "รายงานผลแบบ Real-time",
            desc: "ดูสถิติและผลการดำเนินงานได้ทันทีผ่าน Dashboard ที่อ่านง่ายและชัดเจน",
            icon: <BarChart3 className="w-6 h-6" />,
            color: "bg-indigo-50 text-indigo-600"
        },
        {
            title: "การนิเทศดิจิทัล",
            desc: "จัดการเอกสารและหลักฐานต่างๆ ในรูปแบบดิจิทัล ลดภาระงานเอกสารและประหยัดทรัพยากร",
            icon: <CheckCircle2 className="w-6 h-6" />,
            color: "bg-emerald-50 text-emerald-600"
        },
        {
            title: "ความปลอดภัยสูง",
            desc: "ข้อมูลส่วนบุคคลและข้อมูลการนิเทศถูกเก็บรักษาด้วยระบบความปลอดภัยมาตรฐานสูงสุด",
            icon: <ShieldCheck className="w-6 h-6" />,
            color: "bg-red-50 text-red-600"
        },
        {
            title: "ส่งเสริมวิทยฐานะ",
            desc: "สนับสนุนการเก็บรวบรวมข้อมูลผลงานเพื่อประกอบการเลื่อนวิทยฐานะตามมาตรฐาน",
            icon: <GraduationCap className="w-6 h-6" />,
            color: "bg-amber-50 text-amber-600"
        },
        {
            title: "รองรับทุกสถาบัน",
            desc: "ออกแบบมาให้ใช้งานได้ทั้งภาครัฐและเอกชนทั่วประเทศอย่างยืดหยุ่น",
            icon: <School className="w-6 h-6" />,
            color: "bg-slate-100 text-slate-600"
        }
    ];

    return (
        <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em]">Our Capabilities</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">คุณสมบัติที่ตอบโจทย์ <br /><span className="text-[#1a237e]">ทุกขั้นตอนการนิเทศ</span></h3>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                        ออกแบบมาเพื่อบุคลากรทางการศึกษาโดยเฉพาะ พร้อมเครื่องมือทำงานที่ครบวงจร
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="group p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                            <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#1a237e] transition-colors">{feature.title}</h4>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
