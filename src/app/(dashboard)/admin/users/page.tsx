
import { getUsers } from "@/actions/user";
import { UserActions } from "@/components/admin/user-actions";
import { SearchInput } from "@/components/search-input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShieldCheck, UserCircle } from "lucide-react";
import Link from "next/link";

// Provider badge config
const PROVIDERS: Record<string, {
    label: string;
    bg: string;
    text: string;
    dot: string;
    icon: React.ReactNode;
}> = {
    line: {
        label: "LINE",
        bg: "bg-[#06C755]/10",
        text: "text-[#06C755]",
        dot: "bg-[#06C755]",
        icon: (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.03 2 11c0 3.49 2.01 6.54 5.03 8.27l-.63 2.37 2.65-1.35C10.24 20.73 11.11 21 12 21c5.52 0 10-4.03 10-9S17.52 2 12 2zm5.16 11.61c-.22.63-1.3 1.19-1.81 1.27-.46.07-1.04.1-1.68-.1-.38-.12-.87-.28-1.5-.56-2.63-1.16-4.35-3.85-4.48-4.03-.13-.18-1.08-1.44-1.08-2.74 0-1.3.68-1.94 .92-2.2.24-.27.52-.33.7-.33.18 0 .35 0 .5.01.16.01.38-.06.59.45.22.53.74 1.82.81 1.95.07.13.11.28.02.45-.09.17-.13.27-.26.42-.13.15-.27.34-.39.46-.13.13-.26.27-.11.52.15.25.66 1.09 1.43 1.77.98.87 1.81 1.14 2.06 1.27.25.13.39.11.53-.07.14-.18.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.57-.16 1.2z" />
            </svg>
        ),
    },
    google: {
        label: "Google",
        bg: "bg-red-50",
        text: "text-red-600",
        dot: "bg-red-500",
        icon: (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
        ),
    },
    thaid: {
        label: "ThaiD",
        bg: "bg-blue-50",
        text: "text-blue-700",
        dot: "bg-blue-600",
        icon: (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2zm0 2.18L19 8v.1L12 12 5 8.1V8l7-3.82zM5 9.9l7 3.82 7-3.82v6.2L12 19.82 5 16.1V9.9z" />
            </svg>
        ),
    },
    credentials: {
        label: "อีเมล / รหัสผ่าน",
        bg: "bg-slate-50",
        text: "text-slate-600",
        dot: "bg-slate-400",
        icon: (
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
        ),
    },
};

function getProviders(user: any): string[] {
    const providers: string[] = [];
    if (user.providerAccounts?.length > 0) {
        user.providerAccounts.forEach((acc: any) => {
            if (!providers.includes(acc.provider)) providers.push(acc.provider);
        });
    }
    if (user.password !== undefined || (user.providerAccounts?.length === 0 && !user.providerAccounts?.length)) {
        // Check createdAt without providers
    }
    if (providers.length === 0) {
        providers.push("credentials");
    }
    return providers;
}

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await auth();
    const params = await searchParams;

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        redirect("/dashboard");
    }

    const query = typeof params.q === "string" ? params.q : "";
    const type = typeof params.type === "string" ? params.type : "members";
    const provider = typeof params.provider === "string" ? params.provider : "";
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;
    const limit = typeof params.limit === "string" ? parseInt(params.limit) : 10;

    const { users, totalPages, currentPage, totalUsers, providerCounts } = await getUsers({ query, page, limit, type, provider });

    const typeTabs = [
        { id: "members", label: "สมาชิก", icon: UserCircle },
        { id: "admins", label: "ผู้ดูแลระบบ", icon: ShieldCheck },
    ];

    const providerFilters = [
        { id: "", label: "ทั้งหมด", count: providerCounts.all },
        { id: "line", label: "LINE", count: providerCounts.line, config: PROVIDERS.line },
        { id: "google", label: "Google", count: providerCounts.google, config: PROVIDERS.google },
        { id: "thaid", label: "ThaiD", count: providerCounts.thaid, config: PROVIDERS.thaid },
        { id: "credentials", label: "อีเมล / รหัสผ่าน", count: providerCounts.credentials, config: PROVIDERS.credentials },
    ];

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden bg-[#1a237e] p-8 md:p-10 rounded-2xl shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-100 text-[9px] font-bold uppercase tracking-widest">
                            <Users className="w-3 h-3" /> User Management
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                            จัดการผู้ใช้งาน<span className="text-blue-400">.</span>
                        </h1>
                        <p className="text-blue-100/70 font-medium text-sm">
                            ทั้งหมด {totalUsers.toLocaleString()} บัญชี · {session.user.role === 'super_admin' ? 'สิทธิ์ผู้ดูแลระบบสูงสุด' : 'สิทธิ์ผู้ดูแลระบบ'}
                        </p>
                    </div>
                    <SearchInput placeholder="ค้นหาชื่อหรืออีเมล..." defaultValue={query} className="w-full md:w-80 rounded-xl" />
                </div>

                {/* Provider Count Pills in header */}
                <div className="relative mt-6 flex flex-wrap gap-2">
                    {providerFilters.slice(1).map((pf) => (
                        <div key={pf.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/80 text-xs font-bold backdrop-blur-sm border border-white/10">
                            {pf.config && <span className={`${pf.config.text} opacity-90`}>{pf.config.icon}</span>}
                            <span>{pf.label}</span>
                            <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{pf.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Type tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/50 rounded-xl w-fit border border-slate-200/50">
                {typeTabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={`/admin/users?type=${tab.id}${query ? `&q=${query}` : ""}`}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-black transition-all",
                            type === tab.id
                                ? "bg-white text-[#1a237e] shadow-sm border border-slate-200/50"
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4", type === tab.id ? "text-blue-600" : "text-slate-400")} />
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Provider filter chips */}
            <div className="flex flex-wrap gap-2">
                <p className="self-center text-xs font-black text-slate-400 uppercase tracking-widest mr-1">ช่องทางสมัคร:</p>
                {providerFilters.map((pf) => {
                    const isActive = provider === pf.id;
                    const href = `/admin/users?type=${type}${query ? `&q=${query}` : ""}${pf.id ? `&provider=${pf.id}` : ""}`;
                    return (
                        <Link key={pf.id} href={href}>
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer",
                                isActive
                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                            )}>
                                {pf.config && <span className={isActive ? "text-white" : pf.config.text}>{pf.config.icon}</span>}
                                {pf.label}
                                <span className={cn(
                                    "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                )}>{pf.count}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Table */}
            <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-black text-slate-700 h-14 pl-8 text-xs uppercase tracking-wider">ผู้ใช้งาน</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider">อีเมล</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider">บทบาท</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider">ช่องทางสมัคร</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider text-center">วันที่เข้าร่วม</TableHead>
                                <TableHead className="font-black text-slate-700 h-14 text-xs uppercase tracking-wider text-right pr-8">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-medium">
                                        ไม่พบข้อมูลผู้ใช้งานในหมวดหมู่นี้
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user: any) => {
                                    const providers = getProviders(user);

                                    return (
                                        <TableRow key={user._id} className="hover:bg-slate-50/60 transition-colors border-slate-50">

                                            {/* Name */}
                                            <TableCell className="py-4 pl-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-black text-sm shrink-0">
                                                        {user.name?.[0]?.toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm leading-tight">{user.name}</p>
                                                        {user.profile?.position && (
                                                            <p className="text-[10px] text-slate-400 font-medium">{user.profile.position}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Email */}
                                            <TableCell className="py-4 text-sm text-slate-500 font-medium">{user.email}</TableCell>

                                            {/* Role */}
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    user.role === 'super_admin' ? 'bg-indigo-600 text-white' :
                                                        user.role === 'admin' ? 'bg-blue-600 text-white' :
                                                            user.role === 'supervisor' ? 'bg-orange-500 text-white' :
                                                                'bg-slate-100 text-slate-600'
                                                )}>
                                                    {user.role === 'super_admin' ? 'ผู้ดูแลสูงสุด' :
                                                        user.role === 'admin' ? 'ผู้ดูแลระบบ' :
                                                            user.role === 'supervisor' ? 'ศึกษานิเทศก์' :
                                                                'ครู / บุคลากร'}
                                                </Badge>
                                            </TableCell>

                                            {/* Provider Badges */}
                                            <TableCell className="py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {providers.map((p) => {
                                                        const cfg = PROVIDERS[p] || PROVIDERS.credentials;
                                                        return (
                                                            <div
                                                                key={p}
                                                                className={cn(
                                                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold",
                                                                    cfg.bg, cfg.text
                                                                )}
                                                            >
                                                                <span className="flex-shrink-0">{cfg.icon}</span>
                                                                {cfg.label}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </TableCell>

                                            {/* Date */}
                                            <TableCell className="py-4 text-xs text-slate-400 font-bold text-center">
                                                {new Date(user.createdAt).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="py-4 text-right pr-8">
                                                <UserActions user={user} currentUserRole={session.user.role} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                {/* Result info */}
                <p className="text-xs font-bold text-slate-400">
                    แสดง{" "}
                    <span className="text-slate-700">
                        {totalUsers === 0 ? 0 : (currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, totalUsers)}
                    </span>
                    {" "}จากทั้งหมด{" "}
                    <span className="text-blue-600">{totalUsers.toLocaleString()}</span> รายการ
                </p>

                <div className="flex items-center gap-3">
                    {/* Page size selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">แสดง</span>
                        <div className="flex items-center gap-1">
                            {[10, 25, 50].map(size => (
                                <Link
                                    key={size}
                                    href={`/admin/users?page=1&type=${type}&limit=${size}${query ? `&q=${query}` : ""}${provider ? `&provider=${provider}` : ""}`}
                                >
                                    <div className={cn(
                                        "w-10 h-8 flex items-center justify-center rounded-lg text-xs font-black border transition-all",
                                        limit === size
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                                    )}>
                                        {size}
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-slate-400">ต่อหน้า</span>
                    </div>

                    {/* Numbered pages */}
                    {totalPages >= 1 && (
                        <Pagination>
                            <PaginationContent className="bg-white/60 backdrop-blur-sm p-1.5 rounded-xl border border-slate-100 shadow-sm gap-1">
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={`/admin/users?page=${Math.max(1, currentPage - 1)}&type=${type}&limit=${limit}${query ? `&q=${query}` : ""}${provider ? `&provider=${provider}` : ""}`}
                                        aria-disabled={currentPage <= 1}
                                        className={cn("rounded-lg h-9 text-xs font-bold", currentPage <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-100")}
                                    />
                                </PaginationItem>

                                {(() => {
                                    const pages: (number | "...")[] = [];
                                    if (totalPages <= 7) {
                                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                                    } else {
                                        pages.push(1);
                                        if (currentPage > 3) pages.push("...");
                                        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                                        if (currentPage < totalPages - 2) pages.push("...");
                                        pages.push(totalPages);
                                    }
                                    return pages.map((p, idx) => (
                                        <PaginationItem key={idx}>
                                            {p === "..." ? (
                                                <span className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm font-bold">…</span>
                                            ) : (
                                                <PaginationLink
                                                    href={`/admin/users?page=${p}&type=${type}&limit=${limit}${query ? `&q=${query}` : ""}${provider ? `&provider=${provider}` : ""}`}
                                                    isActive={currentPage === p}
                                                    className={cn(
                                                        "rounded-lg w-9 h-9 font-bold text-xs",
                                                        currentPage === p
                                                            ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
                                                            : "hover:bg-slate-100"
                                                    )}
                                                >
                                                    {p}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ));
                                })()}

                                <PaginationItem>
                                    <PaginationNext
                                        href={`/admin/users?page=${Math.min(totalPages, currentPage + 1)}&type=${type}&limit=${limit}${query ? `&q=${query}` : ""}${provider ? `&provider=${provider}` : ""}`}
                                        aria-disabled={currentPage >= totalPages}
                                        className={cn("rounded-lg h-9 text-xs font-bold", currentPage >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-100")}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </div>
        </div>
    );
}
