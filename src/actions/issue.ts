
"use server";

import IssueReport from "@/models/IssueReport";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function submitIssueReport(data: {
    category: string;
    subject: string;
    message: string;
}) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("กรุณาเข้าสู่ระบบก่อน");
    }

    if (!data.subject.trim() || !data.message.trim()) {
        throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    await dbConnect();

    await IssueReport.create({
        userId: session.user.id,
        category: data.category,
        subject: data.subject.trim(),
        message: data.message.trim(),
        status: 'open',
    });

    return { success: true };
}

export async function getIssueReports() {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        return [];
    }

    await dbConnect();
    const reports = await IssueReport.find({})
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(reports));
}

export async function updateIssueStatus(reportId: string, status: string, adminNote?: string) {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();
    await IssueReport.findByIdAndUpdate(reportId, {
        status,
        adminNote,
        ...(status === 'resolved' ? { resolvedAt: new Date() } : {}),
    });

    revalidatePath("/admin");
    return { success: true };
}
