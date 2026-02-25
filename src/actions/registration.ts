
"use server";

import Registration from "@/models/Registration";
import Activity from "@/models/Activity";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

import { sendNotificationEmail } from "@/lib/mail";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export async function registerForActivity(activityId: string) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    const activity = await Activity.findById(activityId).populate('createdBy');
    if (!activity) {
        throw new Error("Activity not found");
    }

    if (activity.status !== 'Open') {
        throw new Error("Activity is not open for registration");
    }

    // Check quota
    const currentRegistrations = await Registration.countDocuments({ activityId, status: 'Registered' });
    if (currentRegistrations >= activity.quota) {
        throw new Error("Activity is fully booked");
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
        userId: session.user.id,
        activityId,
        status: 'Registered',
    });

    if (existingRegistration) {
        throw new Error("You are already registered for this activity");
    }

    await Registration.create({
        userId: session.user.id,
        activityId,
        status: 'Registered',
    });

    // Send Notification Email
    try {
        if (session.user.email) {
            await sendNotificationEmail({
                to: session.user.email,
                teacherName: session.user.name || "คุณครู",
                activityTitle: activity.title,
                date: format(new Date(activity.startTime), "d MMMM yyyy", { locale: th }),
                startTime: format(new Date(activity.startTime), "HH:mm"),
                endTime: format(new Date(activity.endTime), "HH:mm"),
                meetingLink: activity.location || "ไม่ได้ระบุลิงก์",
                supervisorName: activity.createdBy?.name || "ศึกษานิเทศก์",
                organizationName: "สำนักงานคณะกรรมการการอาชีวศึกษา (OVEC)"
            });
        }
    } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
        // We don't throw error here to avoid rolling back registration just because email failed
    }

    // Check if now full, update activity status if needed
    if (currentRegistrations + 1 >= activity.quota) {
        activity.status = 'Full';
        await activity.save();
    }

    revalidatePath("/activities");
    revalidatePath("/my-activities");
    return { success: true };
}

export async function getMyRegistrations() {
    const session = await auth();
    if (!session || !session.user) {
        return [];
    }

    await dbConnect();

    const registrations = await Registration.find({ userId: session.user.id, status: 'Registered' })
        .populate('activityId')
        .sort({ registeredAt: -1 });

    return JSON.parse(JSON.stringify(registrations));
}

export async function cancelRegistration(registrationId: string) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    // Verify ownership
    const registration = await Registration.findOne({ _id: registrationId, userId: session.user.id });
    if (!registration) {
        throw new Error("Registration not found");
    }

    if (registration.status === 'Cancelled') {
        throw new Error("Already cancelled");
    }

    // Instead of deleting, mark as Cancelled to keep history
    registration.status = 'Cancelled';
    await registration.save();

    // Check if activity was full, if so, re-open it
    // This is simple logic, might need more robust concurrency checks in high load
    const activity = await Activity.findById(registration.activityId);
    if (activity && activity.status === 'Full') {
        const currentCount = await Registration.countDocuments({ activityId: activity._id, status: 'Registered' });
        if (currentCount < activity.quota) {
            activity.status = 'Open';
            await activity.save();
        }
    }

    revalidatePath("/activities");
    revalidatePath("/my-activities");
    return { success: true };
}

export async function cancelRegistrationByActivityId(activityId: string) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    const registration = await Registration.findOne({
        userId: session.user.id,
        activityId,
        status: 'Registered',
    });

    if (!registration) {
        throw new Error("Registration not found");
    }

    return cancelRegistration(registration._id.toString());
}
