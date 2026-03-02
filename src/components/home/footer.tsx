import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getFooterSettings } from "@/actions/settings";

export async function Footer() {
    const footer = await getFooterSettings();

    return (
        <footer className="bg-black text-slate-400 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
                    {/* Logo and Description */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="relative w-40 h-16 shrink-0">
                                <Image
                                    src="/ovece.png"
                                    alt="OVEC Logo"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs">
                            {footer.description}
                        </p>
                    </div>

                    {/* Related Organizations */}
                    <div className="lg:pl-8">
                        <h3 className="text-white font-black mb-6 tracking-wide underline decoration-blue-500 underline-offset-8 decoration-2">หน่วยงานที่เกี่ยวข้อง</h3>
                        <ul className="space-y-4 text-sm font-bold text-slate-400">
                            {footer.relatedLinks?.map((link: any, i: number) => (
                                <li key={i}>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-400 transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            )) || (
                                    <li>- ยังไม่มีข้อมูล -</li>
                                )}
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div className="space-y-6">
                        <h3 className="text-white font-black mb-6 tracking-wide underline decoration-blue-500 underline-offset-8 decoration-2">ติดต่อเรา</h3>
                        <div className="space-y-4 font-bold">
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600/20 transition-colors">
                                    <Mail className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-sm">{footer.contact.email}</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600/20 transition-colors">
                                    <Phone className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-sm">{footer.contact.phone}</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600/20 transition-colors">
                                    <MapPin className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-sm">{footer.contact.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800/50 text-center">
                    <p className="text-xs font-medium text-slate-500">
                        {footer.copyright}
                    </p>
                </div>
            </div>
        </footer>
    );
}
