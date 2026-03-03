
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
    const targetBranch = formData.get("targetBranch") as string | null;
    const meetingId = formData.get("meetingId");
    const meetingPassword = formData.get("meetingPassword");
    const bannerImage = formData.get("bannerImage");
    const externalSourceLink = formData.get("externalSourceLink");
    const requirementsRaw = formData.get("requirements");
    const requirements = requirementsRaw ? JSON.parse(requirementsRaw as string) : [];
    const documentsRaw = formData.get("documents");
    const documents = documentsRaw ? JSON.parse(documentsRaw as string) : [];

    if (!title || !description || !startTime || !endTime || !quota || !location) {
        throw new Error("All fields are required");
    }

    await dbConnect();

    try {
        await Activity.create({
            title,
            description,
            startTime: new Date(startTime as string),
            endTime: new Date(endTime as string),
            quota,
            location,
            targetBranch: targetBranch || undefined,
            meetingId,
            meetingPassword,
            bannerImage,
            externalSourceLink,
            documents,
            requirements,
            createdBy: session.user.id,
        });

        revalidatePath("/dashboard/activities");
        revalidatePath("/activities");
        revalidatePath("/");

        return { success: true };
    } catch (error: any) {
        console.error("Create activity error:", error);
        return { success: false, error: error.message || "Failed to create activity" };
    }
}

// ... imports

export async function getActivities(status?: string, search?: string) {
    await dbConnect();

    const query: any = {};
    if (status) query.status = status;
    if (search) {
        query.title = { $regex: search as string, $options: "i" };
    }

    // Use aggregation to count registrations
    const activities = await Activity.aggregate([
        { $match: query },
        {
            $lookup: {
                from: "registrations",
                localField: "_id",
                foreignField: "activityId",
                as: "registrations"
            }
        },
        {
            $addFields: {
                currentRegistrations: { $size: "$registrations" }
            }
        },
        {
            $project: {
                registrations: 0 // Remove the full registration array to save bandwidth
            }
        },
        { $sort: { startTime: 1 } }
    ]);

    // Populate createdBy manually if needed, or use a second query. 
    // Since aggregation returns plain objects, we can populate manually or just rely on IDs if that's enough.
    // For simplicity and to keep 'createdBy' populated as before, let's use Mongoose population after aggregation if needed,
    // OR we can just use the virtual if it was set up correctly.
    // However, the previous code populated 'createdBy'. Let's do a simple loop to populate or adjust the aggregation.

    // Better approach: Use Mongoose find with virtual population for count.
    // But since 'count' virtuals are not fully supported in all Mongoose versions for simple find().lean(), 
    // aggregation is safer for counts.

    // Let's stick to aggregation and lookup user for createdBy
    const populatedActivities = await Activity.populate(activities, { path: "createdBy", select: "name" });

    return JSON.parse(JSON.stringify(populatedActivities));
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
    const targetBranch = formData.get("targetBranch") as string | null;
    const meetingId = formData.get("meetingId");
    const meetingPassword = formData.get("meetingPassword");
    const bannerImage = formData.get("bannerImage");
    const externalSourceLink = formData.get("externalSourceLink");
    const requirementsRaw = formData.get("requirements");
    const requirements = requirementsRaw ? JSON.parse(requirementsRaw as string) : [];
    const documentsRaw = formData.get("documents");
    const documents = documentsRaw ? JSON.parse(documentsRaw as string) : [];

    console.log("DEBUG - Backend received requirements:", requirements);
    console.log("DEBUG - Raw requirements value:", requirementsRaw);

    if (!title || !description || !startTime || !endTime || !location) {
        return { success: false, error: "กรอกข้อมูลที่จำเป็นให้ครบถ้วน" };
    }

    const quotaNum = Number(formData.get("quota"));
    if (isNaN(quotaNum) || quotaNum < 1) {
        return { success: false, error: "จำนวนที่นั่งต้องเป็นตัวเลขที่มากกว่า 0" };
    }

    await dbConnect();

    try {
        const updateData = {
            title,
            description,
            startTime: new Date(startTime as string),
            endTime: new Date(endTime as string),
            quota: quotaNum,
            location,
            targetBranch: targetBranch || undefined,
            meetingId,
            meetingPassword,
            bannerImage,
            externalSourceLink,
            documents,
            requirements: Array.isArray(requirements) ? requirements : [],
        };

        console.log("DEBUG - Final Object to Update:", JSON.stringify(updateData, null, 2));

        const updatedActivity = await Activity.findByIdAndUpdate(id, updateData, { new: true });

        console.log("DEBUG - Activity after update:", JSON.stringify(updatedActivity?.requirements, null, 2));

        revalidatePath(`/activities/${id}`);
        revalidatePath("/activities");
        revalidatePath("/dashboard/activities");
        revalidatePath("/");

        return { success: true };
    } catch (error: any) {
        console.error("Update activity error:", error);
        return { success: false, error: error.message || "Failed to update activity" };
    }
}
