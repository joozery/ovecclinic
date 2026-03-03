import { Navbar } from "@/components/home/navbar";
import { Footer } from "@/components/home/footer";
import { auth } from "@/auth";
import { getSiteSetting } from "@/actions/site-settings";
import { Shield, Lock, Eye, FileText, UserCheck, Smartphone } from "lucide-react";

export default async function PrivacyPage() {
    const session = await auth();
    const isLoggedIn = !!session;
    const manualUrl = await getSiteSetting("manual_url");

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar isLoggedIn={isLoggedIn} manualUrl={manualUrl} />

            <main className="flex-1">
                {/* Header Section */}
                <div className="bg-[#1a237e] text-white py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-sm mb-4">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">นโยบายการคุ้มครองข้อมูลส่วนบุคคล</h1>
                        <p className="text-blue-100 text-lg font-medium">Privacy Policy (PDPA)</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-4xl mx-auto px-4 py-16 -mt-10">
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 space-y-12">

                        {/* Section 1 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 text-[#1a237e]">
                                <Eye className="w-6 h-6" />
                                <h2 className="text-2xl font-black">บทนำ</h2>
                            </div>
                            <div className="text-slate-600 leading-relaxed font-medium">
                                <p>
                                    สำนักงานคณะกรรมการการอาชีวศึกษา (ซึ่งต่อไปนี้จะเรียกว่า "สถาบัน") ตระหนักถึงความสำคัญของการคุ้มครองข้อมูลส่วนบุคคลของท่าน
                                    เพื่อให้ท่านมั่นใจได้ว่าสถาบันมีความโปร่งใสและความรับผิดชอบในการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลของท่านตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ("PDPA")
                                    นโยบายนี้จึงอธิบายถึงวิธีการที่สถาบันจัดการกับข้อมูลส่วนบุคคลของท่าน
                                </p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 text-[#1a237e]">
                                <FileText className="w-6 h-6" />
                                <h2 className="text-2xl font-black">ข้อมูลส่วนบุคคลที่เราจัดเก็บ</h2>
                            </div>
                            <div className="text-slate-600 leading-relaxed font-medium">
                                <p className="mb-4">เพื่อให้การบริการในระบบนิเทศและบริหารจัดการเกียรติบัตรเป็นไปอย่างมีประสิทธิภาพ สถาบันอาจมีการจัดเก็บข้อมูลส่วนบุคคลดังนี้:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>ข้อมูลแสดงตัวตน: ชื่อ-นามสกุล, เลขประจำตัวประชาชน, รูปถ่าย</li>
                                    <li>ข้อมูลการติดต่อ: อีเมล, เบอร์โทรศัพท์</li>
                                    <li>ข้อมูลการทำงาน: สังกัดหน่วยงาน, ตำแหน่งงาน, วิทยฐานะ, สาขาที่สอน</li>
                                    <li>ข้อมูลการทำรายการ: ประวัติการลงทะเบียนกิจกรรม, ประวัติการประเมินและการรับเกียรติบัตร</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 text-[#1a237e]">
                                <Lock className="w-6 h-6" />
                                <h2 className="text-2xl font-black">วัตถุประสงค์ในการประมวลผลข้อมูล</h2>
                            </div>
                            <div className="text-slate-600 leading-relaxed font-medium">
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>เพื่อใช้ในการพิสูจน์และยืนยันตัวตนของผู้ใช้งานระบบ</li>
                                    <li>เพื่อการดำเนินกิจกรรมการนิเทศออนไลน์และการบริหารจัดการจัดการเกียรติบัตรอิเล็กทรอนิกส์</li>
                                    <li>เพื่อการติดต่อสื่อสาร แจ้งเตือนสิทธิประโยชน์ และข้อมูลข่าวสารเกี่ยวกับการนิเทศ</li>
                                    <li>เพื่อใช้ในการวิเคราะห์ข้อมูลภาพรวมเพื่อพัฒนาคุณภาพการศึกษา</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 text-[#1a237e]">
                                <UserCheck className="w-6 h-6" />
                                <h2 className="text-2xl font-black">สิทธิของเจ้าของข้อมูล</h2>
                            </div>
                            <div className="text-slate-600 leading-relaxed font-medium">
                                <p className="mb-4">ภายใต้กฎหมาย PDPA ท่านมีสิทธิตามกฎหมายที่ควรทราบ ดังนี้:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>สิทธิในการเพิกถอนความยินยอม</li>
                                    <li>สิทธิในการขอเข้าถึงและรับสำเนาข้อมูลส่วนบุคคล</li>
                                    <li>สิทธิในการขอแก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง</li>
                                    <li>สิทธิในการขอให้ลบหรือทำลายข้อมูลส่วนบุคคล</li>
                                    <li>สิทธิในการคัดค้านการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูล</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 text-[#1a237e]">
                                <Smartphone className="w-6 h-6" />
                                <h2 className="text-2xl font-black">การติดต่อสอบถาม</h2>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-slate-700 font-bold mb-2">สำนักงานคณะกรรมการการอาชีวศึกษา</p>
                                <p className="text-slate-600 text-sm">
                                    หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อได้ที่ระบบสนับสนุนภายในเว็บไซค์ หรือช่องทางอีเมลสนับสนุนการศึกษา
                                </p>
                            </div>
                        </section>

                        <div className="pt-8 border-t border-slate-100 text-center">
                            <p className="text-slate-400 text-sm italic font-medium">ปรับปรุงล่าสุดเมื่อ: 2 มีนาคม 2569</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
