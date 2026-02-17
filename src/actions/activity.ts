
"use server";

import Activity from "@/models/Activity";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createActivity(formData: FormData) {
    const session = await auth();
    if (!session || session.user.role === "teacher") {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title");
    const description = formData.get("description");
    const startTime = formData.get("startTime");
    const endTime = formData.get("endTime");
    const quota = Number(formData.get("quota"));
    const location = formData.get("location");

    if (!title || !description || !startTime || !endTime || !quota || !location) {
        throw new Error("All fields are required");
    }

    await dbConnect();

    await Activity.create({
        title,
        description,
        startTime: new Date(startTime as string),
        endTime: new Date(endTime as string),
        quota,
        location,
        createdBy: session.user.id,
    });

    revalidatePath("/dashboard/activities");
    return { success: true };
}

export async function getActivities(status?: string, search?: string) {
    await dbConnect();

    const query: any = {};
    if (status) query.status = status;
    if (search) {
        query.title = { $regex: search, $options: "i" };
    }

    // Sort by start time ascending (soonest first)
    const activities = await Activity.find(query).sort({ startTime: 1 }).populate('createdBy', 'name');

    // Serialize for client component
    return JSON.parse(JSON.stringify(activities));
}

export async function deleteActivity(id: string) {
    const session = await auth();
    if (!session || session.user.role === "teacher") {
        throw new Error("Unauthorized");
    }

    await dbConnect();
    await Activity.findByIdAndDelete(id);
    revalidatePath("/dashboard/activities");
}

export async function updateActivity(id: string, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role === "teacher") {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title");
    const description = formData.get("description");
    const startTime = formData.get("startTime");
    const endTime = formData.get("endTime");
    const quota = Number(formData.get("quota"));
    const location = formData.get("location");

    if (!title || !description || !startTime || !endTime || !quota || !location) {
        throw new Error("All fields are required");
    }

    await dbConnect();

    await Activity.findByIdAndUpdate(id, {
        title,
        description,
        startTime: new Date(startTime as string),
        endTime: new Date(endTime as string),
        quota,
        location,
    });

    revalidatePath("/dashboard/activities");
    return { success: true };
}
