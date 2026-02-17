
"use server";

import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await auth();
    if (!session) return [];

    await dbConnect();

    // Fetch unread or recent notifications (limit 20)
    const notifications = await Notification.find({ recipientId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(20);

    return JSON.parse(JSON.stringify(notifications));
}

export async function getUnreadCount() {
    const session = await auth();
    if (!session) return 0;

    await dbConnect();
    const count = await Notification.countDocuments({
        recipientId: session.user.id,
        isRead: false
    });

    return count;
}

export async function markAsRead(notificationId: string) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    await dbConnect();

    await Notification.updateOne(
        { _id: notificationId, recipientId: session.user.id },
        { $set: { isRead: true } }
    );

    revalidatePath("/"); // Update UI globally or specific path
}

export async function markAllAsRead() {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    await dbConnect();

    await Notification.updateMany(
        { recipientId: session.user.id, isRead: false },
        { $set: { isRead: true } }
    );

    revalidatePath("/");
}

// Internal function to create notifications (not exposed to client directly usually, but useful for testing/actions)
export async function createNotification(recipientId: string, title: string, message: string, type: string = 'info', link?: string) {
    // No auth check needed here as this is intended to be called by other server actions
    await dbConnect();

    await Notification.create({
        recipientId,
        title,
        message,
        type,
        link
    });
}
