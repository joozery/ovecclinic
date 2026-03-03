
"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Users, Activity, FileCheck, Calendar } from "lucide-react";

interface StatsCardsProps {
    data: {
        activities: number;
        registrations: number;
        certificates: number;
        participationRate: number;
        supervisors: number;
        trends: {
            registrations: number;
        };
        fiscal: {
            year: string;
            registrations: number;
        }
    };
}

export function StatsCards({ data }: StatsCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[11px] font-black uppercase tracking-wider text-slate-400">จำนวนกิจกรรม</CardTitle>
                    <Activity className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-slate-900">{(data?.activities || 0).toLocaleString()}</div>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                        หลักสูตรทั้งหมดในระบบ
                    </p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[11px] font-black uppercase tracking-wider text-slate-400">ผู้ลงทะเบียน</CardTitle>
                    <Users className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-slate-900">{(data?.registrations || 0).toLocaleString()}</div>
                    <p className={cn(
                        "text-[10px] font-bold mt-1 flex items-center gap-1",
                        (data?.trends?.registrations || 0) >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                        {(data?.trends?.registrations || 0) >= 0 ? "+" : ""}{data?.trends?.registrations || 0}% เทียบกับเดือนก่อน
                    </p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[11px] font-black uppercase tracking-wider text-slate-400">ผู้ได้รับประกาศนียบัตร</CardTitle>
                    <FileCheck className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-slate-900">{(data?.certificates || 0).toLocaleString()}</div>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                        ปีงบประมาณ {data?.fiscal?.year || "-"}: {data?.fiscal?.registrations || 0} ราย
                    </p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[11px] font-black uppercase tracking-wider text-slate-400">อัตราการเข้าร่วม</CardTitle>
                    <div className="h-4 w-4 rounded-full border-2 border-purple-200 border-t-purple-600 animate-[spin_3s_linear_infinite]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-slate-900">{data?.participationRate || 0}%</div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                            style={{ width: `${data?.participationRate || 0}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[11px] font-black uppercase tracking-wider text-slate-400">ศึกษานิเทศก์</CardTitle>
                    <GraduationCap className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-slate-900">{(data?.supervisors || 0).toLocaleString()}</div>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                        ที่ทำการนิเทศในระบบ
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";
