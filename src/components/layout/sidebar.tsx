
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Calendar,
    ClipboardCheck,
    GraduationCap,
    Users,
    Settings,
    ChevronRight,
    LogOut,
    BookOpen,
    ShieldCheck,
    Activity,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    Award
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useSidebar } from "./sidebar-context";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { isCollapsed, toggle } = useSidebar();
    const role = session?.user?.role;

    const mainRoutes = [
        {
            label: "แผงควบคุม",
            icon: LayoutDashboard,
            href: "/dashboard",
            active: pathname === "/dashboard",
        },
        {
            label: "กิจกรรมการนิเทศ",
            icon: Activity,
            href: "/activities",
            active: pathname === "/activities",
        },
    ];

    const teacherRoutes = [
        {
            label: "งานของฉัน",
            icon: ClipboardCheck,
            href: "/my-activities",
            active: pathname === "/my-activities",
        },
        {
            label: "คลังเกียรติบัตร",
            icon: GraduationCap,
            href: "/my-certificates",
            active: pathname === "/my-certificates",
        }
    ];

    const managementRoutes = [
        {
            label: "จัดการกิจกรรม",
            icon: BookOpen,
            href: "/activities/manage",
            active: pathname === "/activities/manage",
        },
        {
            label: "ตรวจและประเมิน",
            icon: ShieldCheck,
            href: "/supervision",
            active: pathname === "/supervision",
        }
    ];

    const adminRoutes = [
        {
            label: "จัดการสมาชิก",
            icon: Users,
            href: "/admin/users",
            active: pathname === "/admin/users",
        },
        {
            label: "จัดการเกียรติบัตร",
            icon: Award,
            href: "/admin/certificate",
            active: pathname === "/admin/certificate",
        }
    ];

    return (
        <aside
            className={cn(
                "hidden md:flex h-full flex-col fixed inset-y-0 z-50 bg-white border-r shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-72"
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={toggle}
                className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors z-50"
            >
                {isCollapsed ? <ChevronRightIcon className="w-3 h-3 text-slate-600" /> : <ChevronLeft className="w-3 h-3 text-slate-600" />}
            </button>

            {/* Logo Section */}
            <div className={cn(
                "h-24 flex items-center mb-2 overflow-hidden transition-all duration-300",
                isCollapsed ? "px-4 justify-center" : "px-6"
            )}>
                <Link href="/" className="w-full flex items-center justify-center group">
                    <div className={cn(
                        "relative transition-all duration-300",
                        isCollapsed ? "w-10 h-10" : "w-full h-12"
                    )}>
                        <Image
                            src="/logo/logo.jpg"
                            alt="OVEC Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 overflow-y-auto space-y-8 scrollbar-hide py-2">
                {/* Main Menu */}
                <div className="space-y-1.5">
                    {!isCollapsed && <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">ทั่วไป</p>}
                    {mainRoutes.map((route) => (
                        <SidebarItem key={route.href} {...route} isCollapsed={isCollapsed} />
                    ))}
                </div>

                {/* Teacher Links */}
                {role === 'teacher' && (
                    <div className="space-y-1.5 font-sans">
                        {!isCollapsed && <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">ครู / บุคลากร</p>}
                        {teacherRoutes.map((route) => (
                            <SidebarItem key={route.href} {...route} isCollapsed={isCollapsed} />
                        ))}
                    </div>
                )}

                {/* Management Links */}
                {(role === 'supervisor' || role === 'admin' || role === 'super_admin') && (
                    <div className="space-y-1.5 font-sans">
                        {!isCollapsed && <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">การจัดการ</p>}
                        {managementRoutes.map((route) => (
                            <SidebarItem key={route.href} {...route} isCollapsed={isCollapsed} />
                        ))}
                    </div>
                )}

                {/* Admin Links */}
                {(role === 'admin' || role === 'super_admin') && (
                    <div className="space-y-1.5 font-sans">
                        {!isCollapsed && <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">ระบบหลังบ้าน</p>}
                        {adminRoutes.map((route) => (
                            <SidebarItem key={route.href} {...route} isCollapsed={isCollapsed} />
                        ))}
                    </div>
                )}
            </div>

            {/* User Profile & Footer */}
            <div className={cn(
                "mt-auto border-t bg-slate-50/50 transition-all duration-300",
                isCollapsed ? "p-3" : "p-4"
            )}>
                {!isCollapsed && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                {session?.user?.name?.[0] || 'U'}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold truncate text-slate-900 leading-tight">{session?.user?.name}</span>
                                <span className="text-[10px] font-semibold text-blue-600 translate-y-0.5">
                                    {role === 'super_admin' ? 'ผู้ดูแลระบบสูงสุด' :
                                        role === 'admin' ? 'ผู้ดูแลระบบ' :
                                            role === 'supervisor' ? 'ศึกษานิเทศก์' :
                                                role === 'teacher' ? 'ครู / บุคลากร' : role}
                                </span>
                            </div>
                        </div>
                        <Link href="/settings">
                            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100/80 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/50">
                                <Settings className="w-3.5 h-3.5" />
                                ตั้งค่าข้อมูลส่วนตัว
                            </button>
                        </Link>
                    </div>
                )}

                {isCollapsed ? (
                    <Link href="/settings" className="flex justify-center mb-3">
                        <button
                            title="ตั้งค่าข้อมูลส่วนตัว"
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 shadow-sm transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </Link>
                ) : null}

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    title={isCollapsed ? "ออกจากระบบ" : undefined}
                    className={cn(
                        "w-full flex items-center text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group",
                        isCollapsed ? "justify-center p-2" : "gap-3 px-4 py-3"
                    )}
                >
                    <div className={cn(
                        "rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors",
                        isCollapsed ? "w-10 h-10" : "w-8 h-8"
                    )}>
                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    {!isCollapsed && <span>ออกจากระบบ</span>}
                </button>
            </div>
        </aside>
    );
}

function SidebarItem({ label, icon: Icon, href, active, isCollapsed }: any) {
    return (
        <Link
            href={href}
            title={isCollapsed ? label : undefined}
            className={cn(
                "flex items-center rounded-xl transition-all duration-200 group font-sans font-medium mb-1",
                active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"
                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900",
                isCollapsed ? "justify-center h-12 w-12 mx-auto px-0" : "justify-between px-4 py-3"
            )}
        >
            <div className="flex items-center gap-3.5">
                <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    active ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                )} />
                {!isCollapsed && <span className="text-[14px]">{label}</span>}
            </div>
            {!isCollapsed && active && <ChevronRightIcon className="w-4 h-4 text-white/50" />}
        </Link>
    );
}
