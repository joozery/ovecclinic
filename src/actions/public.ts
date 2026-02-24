"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import Activity from "@/models/Activity";
import Registration from "@/models/Registration";
import Certificate from "@/models/Certificate";

export async function getPublicStats() {
    await dbConnect();

    const totalUsers = await User.countDocuments({});
    const totalActivities = await Activity.countDocuments({});
    const totalSupervisors = await User.countDocuments({ role: { $in: ['supervisor', 'super_admin'] } });
    const totalCertificates = await Certificate.countDocuments({});

    return {
        users: totalUsers,
        activities: totalActivities,
        supervisors: totalSupervisors,
        certificates: totalCertificates
    };
}

export async function getPublicActivities() {
    await dbConnect();

    // Use aggregation to count registrations for each activity
    const activities = await Activity.aggregate([
        { $match: { status: 'Open' } },
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
                currentRegistrations: {
                    $size: {
                        $filter: {
                            input: "$registrations",
                            as: "reg",
                            cond: { $ne: ["$$reg.status", "Cancelled"] }
                        }
                    }
                }
            }
        },
        { $project: { registrations: 0 } },
        { $sort: { startTime: 1 } },
        { $limit: 10 }
    ]);

    const populatedActivities = await Activity.populate(activities, {
        path: "createdBy",
        select: "name image profile"
    });

    return JSON.parse(JSON.stringify(populatedActivities));
}

export async function getPublicSupervisors() {
    await dbConnect();
    const supervisors = await User.find({ role: 'supervisor' })
        .select('name image profile')
        .limit(8)
        .lean();
    return JSON.parse(JSON.stringify(supervisors));
}

export async function getPublicActivityDetail(id: string) {
    await dbConnect();

    const activity = await Activity.findById(id)
        .populate({
            path: "createdBy",
            select: "name image email profile"
        })
        .lean();

    if (!activity) return null;

    // Get registration count
    const registrationCount = await Registration.countDocuments({
        activityId: id,
        status: { $ne: "Cancelled" }
    });

    return JSON.parse(JSON.stringify({
        ...activity,
        currentRegistrations: registrationCount
    }));
}
