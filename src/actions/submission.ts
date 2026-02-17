
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

// Supervisor Actions

export async function getAssignedSubmissions() {
    const session = await auth();
    // In a real app, supervisors might be assigned specific activities.
    // For now, supervisors see ALL "Pending" or "In Review" submissions.
    if (!session || (session.user.role !== 'supervisor' && session.user.role !== 'super_admin')) {
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
    if (!session || (session.user.role !== 'supervisor' && session.user.role !== 'super_admin')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    const submission = await Submission.findById(submissionId);
    if (!submission) {
        throw new Error("Submission not found");
    }

    submission.status = status;
    submission.feedback = feedback;
    submission.reviewedBy = session.user.id;
    submission.reviewedAt = new Date();
    await submission.save();

    // Trigger Notification
    if (status !== 'Pending') {
        const title = `Submission ${status}`;
        const message = `Your submission for "${submission.activityId?.title}" has been marked as ${status}. ${feedback ? `Feedback: ${feedback}` : ''}`;
        const link = `/my-activities/${submission.registrationId}/submit`; // Direct to submission page to see feedback

        await createNotification(submission.userId, title, message, status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'warning', link);
    }

    revalidatePath("/supervision");
    revalidatePath(`/my-activities/${submission.registrationId}`); // Refresh teacher view
    return { success: true };
}

export async function getSubmissionById(submissionId: string) {
    const session = await auth();
    if (!session || (session.user.role !== 'supervisor' && session.user.role !== 'super_admin')) {
        return null;
    }

    await dbConnect();
    const submission = await Submission.findById(submissionId)
        .populate('userId', 'name email')
        .populate('activityId', 'title description');

    return JSON.parse(JSON.stringify(submission));
}
