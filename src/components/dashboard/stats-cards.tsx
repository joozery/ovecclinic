
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
        users: {
            total: number;
            teachers: number;
            supervisors: number;
        };
        activities: {
            total: number;
            open: number;
        };
        registrations: number;
        certificates: number;
    };
}

export function StatsCards({ data }: StatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium"> Total Users </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.users.total}</div>
                    <p className="text-xs text-muted-foreground">
                        {data.users.teachers} Teachers, {data.users.supervisors} Supervisors
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium"> Total Activities </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.activities.total}</div>
                    <p className="text-xs text-muted-foreground">
                        {data.activities.open} Currently Open
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium"> Registrations </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.registrations}</div>
                    <p className="text-xs text-muted-foreground">
                        +12% from last month (Simulated)
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium"> Certificates Issued </CardTitle>
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.certificates}</div>
                    <p className="text-xs text-muted-foreground">
                        Verified completions
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
