
"use server";

import Submission from "@/models/Submission";
import Registration from "@/models/Registration";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notification";

export async function submitWork(registrationId: string, formData: FormData) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const links = formData.getAll("links") as string[];
    const fileMetadata = formData.get("fileMetadata") as string;
    const files = fileMetadata ? JSON.parse(fileMetadata) : [];

    if (links.length === 0 && files.length === 0) {
        throw new Error("Please submit at least one file or link.");
    }

    await dbConnect();

    const registration = await Registration.findOne({ _id: registrationId, userId: session.user.id });
    if (!registration) {
        throw new Error("Registration not found");
    }

    let submission = await Submission.findOne({ registrationId });

    if (submission) {
        submission.files = files;
        submission.links = links;
        submission.status = 'Pending';
        submission.submittedAt = new Date();
        await submission.save();
    } else {
        await Submission.create({
            registrationId,
            userId: session.user.id,
            activityId: registration.activityId,
            files,
            links,
            status: 'Pending',
        });
    }

    revalidatePath(`/my-activities/${registrationId}`);
    return { success: true };
}

export async function getSubmission(registrationId: string) {
    const session = await auth();
    if (!session) return null;

    await dbConnect();
    const submission = await Submission.findOne({ registrationId });
    return JSON.parse(JSON.stringify(submission));
}

export async function getMySubmissions(registrationIds: string[]) {
    const session = await auth();
    if (!session) return {};

    await dbConnect();
    const submissions = await Submission.find({ registrationId: { $in: registrationIds } })
        .select('registrationId status feedback submittedAt reviewedAt');

    const map: Record<string, any> = {};
    for (const s of submissions) {
        map[s.registrationId.toString()] = JSON.parse(JSON.stringify(s));
    }
    return map;
}

// Supervisor Actions

export async function getAssignedSubmissions() {
    const session = await auth();
    // In a real app, supervisors might be assigned specific activities.
    // For now, supervisors see ALL "Pending" or "In Review" submissions.
    if (!session || (session.user.role !== 'supervisor' && session.user.role !== 'super_admin' && session.user.role !== 'admin')) {
        return [];
    }

    await dbConnect();

    // Fetch submissions populated with User and Activity details
    const submissions = await Submission.find({})
        .populate('userId', 'name email')
        .populate('activityId', 'title')
        .sort({ submittedAt: -1 });

    return JSON.parse(JSON.stringify(submissions));
}

export async function reviewSubmission(submissionId: string, status: string, feedback: string) {
    const session = await auth();
    if (!session || (session.user.role !== 'supervisor' && session.user.role !== 'super_admin' && session.user.role !== 'admin')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    // Populate activityId เพื่อดึงชื่อกิจกรรมสำหรับการแจ้งเตือน
    const submission = await Submission.findById(submissionId).populate('activityId', 'title');
    if (!submission) {
        throw new Error("Submission not found");
    }

    submission.status = status;
    submission.feedback = feedback;
    submission.reviewedBy = session.user.id;
    submission.reviewedAt = new Date();
    await submission.save();

    // แจ้งเตือนภาษาไทย พร้อมชื่อกิจกรรมและข้อเสนอแนะ
    if (status !== 'Pending') {
        const activityTitle = (submission.activityId as any)?.title || 'กิจกรรม';

        const titleMap: Record<string, string> = {
            Approved: '✅ ผลงานได้รับการอนุมัติ',
            Rejected: '❌ ผลงานไม่ผ่านการประเมิน',
            'Request Changes': '🔄 ขอแก้ไขเพิ่มเติม',
        };
        const thaiTitle = titleMap[status] || `ผลการตรวจประเมิน`;

        const lines = [
            `ผลงานที่คุณส่งในกิจกรรม "${activityTitle}" ได้รับการตรวจประเมินแล้ว`,
            status === 'Approved' ? 'ผลงานผ่านการประเมิน สามารถดาวน์โหลดวุฒิบัตรได้ในหน้า "วุฒิบัตรของฉัน"' : '',
            status === 'Rejected' ? 'ผลงานไม่ผ่านการประเมินในครั้งนี้' : '',
            status === 'Request Changes' ? 'กรุณาแก้ไขและส่งผลงานใหม่อีกครั้ง' : '',
            feedback ? `\nหมายเหตุจากผู้นิเทศ: ${feedback}` : '',
        ].filter(Boolean).join(' ');

        const notifType = status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'warning';
        const link = `/my-activities/${submission.registrationId}/submit`;

        await createNotification(submission.userId, thaiTitle, lines, notifType, link);
    }

    revalidatePath("/supervision");
    revalidatePath(`/my-activities/${submission.registrationId}`);
    return { success: true };
}

export async function getSubmissionById(submissionId: string) {
    const session = await auth();
    if (!session || (session.user.role !== 'supervisor' && session.user.role !== 'super_admin' && session.user.role !== 'admin')) {
        return null;
    }

    await dbConnect();
    const submission = await Submission.findById(submissionId)
        .populate('userId', 'name email')
        .populate('activityId', 'title description');

    return JSON.parse(JSON.stringify(submission));
}
