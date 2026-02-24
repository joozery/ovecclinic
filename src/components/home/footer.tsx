import { Mail, Phone, MapPin, BookOpen } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-black text-slate-400 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Logo and Description */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white leading-tight">คลินิกนิเทศออนไลน์</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">สำนักงานคณะกรรมการการอาชีวศึกษา</p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs">
                            ระบบจองคิวเพื่อเข้ารับการนิเทศออนไลน์ สำหรับบุคลากรสังกัด สอศ. เพื่อพัฒนาคุณภาพการศึกษาอย่างทั่วถึงและมีประสิทธิภาพ
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="md:pl-12">
                        <h3 className="text-white font-black mb-6 tracking-wide">ลิงก์ด่วน</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/activities" className="hover:text-blue-400 transition-colors">หัวข้อนิเทศ</Link>
                            </li>
                            <li>
                                <Link href="/" className="hover:text-blue-400 transition-colors">ปฏิทินนิเทศ</Link>
                            </li>
                            <li>
                                <Link href="/auth/login" className="hover:text-blue-400 transition-colors">เข้าสู่ระบบ</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div className="space-y-6">
                        <h3 className="text-white font-black mb-6 tracking-wide">ติดต่อเรา</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-sm">contact@vec.go.th</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center shrink-0">
                                    <Phone className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-sm">02-354-4524</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-sm">กรุงเทพมหานคร 10110</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800/50 text-center">
                    <p className="text-xs font-medium text-slate-500">
                        © 2567 สำนักงานคณะกรรมการการอาชีวศึกษา (สอศ.) สงวนลิขสิทธิ์
                    </p>
                </div>
            </div>
        </footer>
    );
}
