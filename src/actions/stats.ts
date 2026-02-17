
"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import Activity from "@/models/Activity";
import Registration from "@/models/Registration";
import Certificate from "@/models/Certificate";
import { auth } from "@/auth";

export async function getSystemStats() {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin' && session.user.role !== 'supervisor')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    const totalUsers = await User.countDocuments({});
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalSupervisors = await User.countDocuments({ role: { $in: ['supervisor', 'super_admin'] } });

    const totalActivities = await Activity.countDocuments({});
    const openActivities = await Activity.countDocuments({ status: 'Open' });

    const totalRegistrations = await Registration.countDocuments({ status: { $ne: 'Cancelled' } });

    const totalCertificates = await Certificate.countDocuments({});

    return {
        users: {
            total: totalUsers,
            teachers: totalTeachers,
            supervisors: totalSupervisors
        },
        activities: {
            total: totalActivities,
            open: openActivities,
        },
        registrations: totalRegistrations,
        certificates: totalCertificates
    };
}

export async function getMonthlyStats() {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin' && session.user.role !== 'supervisor')) {
        return [];
    }

    await dbConnect();

    // Aggregate registrations by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of month

    const registrationStats = await Registration.aggregate([
        {
            $match: {
                registeredAt: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$registeredAt" },
                    month: { $month: "$registeredAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format for Recharts
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedStats = registrationStats.map(stat => ({
        name: `${months[stat._id.month - 1]} ${stat._id.year}`,
        registrations: stat.count
    }));

    return formattedStats;
}

export async function exportSystemData() {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin' && session.user.role !== 'supervisor')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    // Fetch all registrations for export
    const registrations = await Registration.find({})
        .populate('userId', 'name email')
        .populate('activityId', 'title startTime');

    // Create CSV content
    const header = "Registration ID,User Name,User Email,Activity Title,Activity Date,Status,Registered At\n";
    const rows = registrations.map((reg: any) => {
        const clean = (text: string) => `"${(text || "").replace(/"/g, '""')}"`;
        return [
            clean(reg._id.toString()),
            clean(reg.userId?.name),
            clean(reg.userId?.email),
            clean(reg.activityId?.title),
            clean(reg.activityId?.startTime ? new Date(reg.activityId.startTime).toISOString() : ""),
            clean(reg.status),
            clean(new Date(reg.registeredAt).toISOString())
        ].join(",");
    });

    return header + rows.join("\n");
}
