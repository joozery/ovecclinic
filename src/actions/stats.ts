
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

    // 1. Basic Counts
    const totalActivities = await Activity.countDocuments({});
    const totalRegistrations = await Registration.countDocuments({ status: { $ne: 'Cancelled' } });
    const totalCertificates = await Certificate.countDocuments({});

    // 2. Participation Rate
    const participationRate = totalRegistrations > 0
        ? Math.round((totalCertificates / totalRegistrations) * 100)
        : 0;

    // 3. Active Supervisors (Who have performed at least one supervision/submission check)
    // For now, let's count supervisors present in the system, or optionally those who have evaluated.
    const activeSupervisors = await User.countDocuments({ role: 'supervisor' });

    // 4. Monthly Comparison (Registrations)
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonthRegistrations = await Registration.countDocuments({
        registeredAt: { $gte: startOfCurrentMonth },
        status: { $ne: 'Cancelled' }
    });

    const lastMonthRegistrations = await Registration.countDocuments({
        registeredAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
        status: { $ne: 'Cancelled' }
    });

    const regTrend = lastMonthRegistrations > 0
        ? Math.round(((currentMonthRegistrations - lastMonthRegistrations) / lastMonthRegistrations) * 100)
        : currentMonthRegistrations > 0 ? 100 : 0;

    // 5. Fiscal Year Stats (FY 2569: Oct 2025 - Sep 2026 based on user context)
    // Standard Thai Fiscal Year 2569 starts Oct 1, 2025
    const fyStartDate = new Date(2025, 9, 1); // Oct 1, 2025
    const fyEndDate = new Date(2026, 8, 30); // Sep 30, 2026

    const fyRegistrations = await Registration.countDocuments({
        registeredAt: { $gte: fyStartDate, $lte: fyEndDate },
        status: { $ne: 'Cancelled' }
    });

    return {
        activities: totalActivities,
        registrations: totalRegistrations,
        certificates: totalCertificates,
        participationRate,
        supervisors: activeSupervisors,
        trends: {
            registrations: regTrend
        },
        fiscal: {
            year: "2569",
            registrations: fyRegistrations
        }
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

    // Format for Recharts - always return last 6 months even if no data
    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const thaiYear = year + 543;

        const found = registrationStats.find(
            (s: any) => s._id.year === year && s._id.month === month
        );

        result.push({
            name: `${thaiMonths[month - 1]} ${thaiYear.toString().slice(-2)}`,
            registrations: found ? found.count : 0,
        });
    }

    return result;
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
