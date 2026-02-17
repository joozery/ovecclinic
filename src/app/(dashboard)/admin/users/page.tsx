
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
import { MessageCircle, Mail, Users, ShieldCheck, UserCircle } from "lucide-react";
import Link from "next/link";

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
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;
    const limit = 10;

    const { users, totalPages, currentPage } = await getUsers({ query, page, limit, type });

    const tabs = [
        { id: "members", label: "สมาชิก (ทั่วไป)", icon: UserCircle, count: type === "members" ? users.length : null },
        { id: "admins", label: "ผู้ดูแลระบบ", icon: ShieldCheck, count: type === "admins" ? users.length : null },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-[#1a237e] p-8 md:p-10 rounded-xl shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-24 -mb-24 blur-3xl" />

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-100 text-[9px] font-bold uppercase tracking-widest">
                            <Users className="w-3 h-3" /> User Management
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                            จัดการผู้ใช้งาน<span className="text-blue-400">.</span>
                        </h1>
                        <p className="text-blue-100/70 max-w-sm font-medium text-sm leading-relaxed">
                            บริหารจัดการสิทธิ์และหน้าที่ของผู้ใช้งานในระบบ ({session.user.role === 'super_admin' ? 'สิทธิ์ผู้ดูแลระบบสูงสุด' : 'สิทธิ์ผู้ดูแลระบบ'})
                        </p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <SearchInput placeholder="ค้นหาชื่อหรืออีเมล..." defaultValue={query} className="w-full md:w-80 rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/50 rounded-xl w-fit border border-slate-200/50">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={`/admin/users?type=${tab.id}${query ? `&q=${query}` : ""}`}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all",
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

            <Card className="border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-bold text-slate-900 h-14 pl-8">รายชื่อผู้ใช้งาน</TableHead>
                                <TableHead className="font-bold text-slate-900 h-14">อีเมล</TableHead>
                                <TableHead className="font-bold text-slate-900 h-14">บทบาท</TableHead>
                                <TableHead className="font-bold text-slate-900 h-14">ช่องทางสมัคร</TableHead>
                                <TableHead className="font-bold text-slate-900 h-14 text-center">วันที่เข้าร่วม</TableHead>
                                <TableHead className="text-right font-bold text-slate-900 h-14 pr-8">การดำเนินการ</TableHead>
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
                                    const isLineUser = user.providerAccounts?.some((acc: any) => acc.provider === 'line');

                                    return (
                                        <TableRow key={user._id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                            <TableCell className="py-4 pl-8 font-bold text-slate-900">{user.name}</TableCell>
                                            <TableCell className="py-4 text-sm text-slate-600">{user.email}</TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    user.role === 'super_admin' ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
                                                        user.role === 'admin' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                                            user.role === 'supervisor' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                                                                'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                )}>
                                                    {user.role === 'super_admin' ? 'ผู้ดูแลสูงสุด' :
                                                        user.role === 'admin' ? 'ผู้ดูแลระบบ' :
                                                            user.role === 'supervisor' ? 'ศึกษานิเทศก์' :
                                                                user.role === 'teacher' ? 'ครู / บุคลากร' : user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {isLineUser ? (
                                                    <div className="flex items-center gap-2 text-[#06C755] font-bold text-[11px]">
                                                        <div className="w-6 h-6 rounded-full bg-[#06C755]/10 flex items-center justify-center">
                                                            <MessageCircle className="w-3.5 h-3.5" />
                                                        </div>
                                                        LINE Login
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px]">
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <Mail className="w-3.5 h-3.5" />
                                                        </div>
                                                        Email Account
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4 text-sm text-slate-500 font-medium text-center">
                                                {new Date(user.createdAt).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </TableCell>
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

            {totalPages > 1 && (
                <div className="flex justify-center pt-4">
                    <Pagination>
                        <PaginationContent className="bg-white/50 backdrop-blur-sm p-2 rounded-xl border border-slate-100 shadow-sm">
                            <PaginationItem>
                                <PaginationPrevious
                                    href={`/admin/users?page=${Math.max(1, currentPage - 1)}${query ? `&q=${query}` : ""}${type ? `&type=${type}` : ""}`}
                                    aria-disabled={currentPage <= 1}
                                    className={cn(
                                        "rounded-lg",
                                        currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-slate-100"
                                    )}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        href={`/admin/users?page=${i + 1}${query ? `&q=${query}` : ""}${type ? `&type=${type}` : ""}`}
                                        isActive={currentPage === i + 1}
                                        className={cn(
                                            "rounded-lg w-10 h-10 font-bold",
                                            currentPage === i + 1 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : "hover:bg-slate-100"
                                        )}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href={`/admin/users?page=${Math.min(totalPages, currentPage + 1)}${query ? `&q=${query}` : ""}${type ? `&type=${type}` : ""}`}
                                    aria-disabled={currentPage >= totalPages}
                                    className={cn(
                                        "rounded-lg",
                                        currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-slate-100"
                                    )}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
