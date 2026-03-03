
"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import Activity from "@/models/Activity";
import Registration from "@/models/Registration";
import Certificate from "@/models/Certificate";
import { auth } from "@/auth";


export async function getSystemStats(filters?: { month?: string, fy?: string }) {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin' && session.user.role !== 'supervisor')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    const query: any = {};
    const activityQuery: any = {};

    // 1. Handle Fiscal Year Filter
    if (filters?.fy) {
        const fy = parseInt(filters.fy);
        const startYear = fy - 544; // FY 2569 starts Oct 2025 (2569-544 = 2025)
        const fyStartDate = new Date(startYear, 9, 1);
        const fyEndDate = new Date(startYear + 1, 8, 30);

        query.registeredAt = { $gte: fyStartDate, $lte: fyEndDate };
        activityQuery.startTime = { $gte: fyStartDate, $lte: fyEndDate };
    }

    // 2. Handle Month Filter
    if (filters?.month) {
        const month = parseInt(filters.month);
        const currentYear = new Date().getFullYear();
        const monthStart = new Date(currentYear, month - 1, 1);
        const monthEnd = new Date(currentYear, month, 0);

        // If FY is also set, we need to intersect. For simplicity, month filter takes precedence or overrides if conflicting.
        query.registeredAt = { $gte: monthStart, $lte: monthEnd };
        activityQuery.startTime = { $gte: monthStart, $lte: monthEnd };
    }

    // 1. Basic Counts
    const totalActivities = await Activity.countDocuments(activityQuery);
    const totalRegistrations = await Registration.countDocuments({ ...query, status: { $ne: 'Cancelled' } });
    const totalCertificates = await Certificate.countDocuments(query); // Certificates don't have registeredAt, they have createdAt

    // 2. Participation Rate
    const participationRate = totalRegistrations > 0
        ? Math.round((totalCertificates / totalRegistrations) * 100)
        : 0;

    const activeSupervisorsCount = await User.countDocuments({ role: 'supervisor' });

    // 3. Supervisions by Supervisor
    const supervisorBreaks = await Activity.aggregate([
        { $match: activityQuery },
        {
            $group: {
                _id: "$createdBy",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
    const supervisors = await User.populate(supervisorBreaks, { path: "_id", select: "name profile.college profile.affiliation" });

    // 4. Counts by Organizing Unit (Supervisor's Affiliation/College)
    const unitBreaks = await Activity.aggregate([
        { $match: activityQuery },
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "creator"
            }
        },
        { $unwind: "$creator" },
        {
            $group: {
                _id: "$creator.profile.affiliation",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // 5. Top Participating Teachers
    const teacherBreaks = await Registration.aggregate([
        { $match: { ...query, status: { $ne: 'Cancelled' } } },
        {
            $group: {
                _id: "$userId",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
    const teachers = await User.populate(teacherBreaks, { path: "_id", select: "name profile.college profile.affiliation" });


    // Trends (Current vs Last Month - Always calculated based on real time)
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonthCount = await Registration.countDocuments({ registeredAt: { $gte: startOfCurrentMonth }, status: { $ne: 'Cancelled' } });
    const lastMonthCount = await Registration.countDocuments({ registeredAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth }, status: { $ne: 'Cancelled' } });
    const regTrend = lastMonthCount > 0 ? Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 100) : currentMonthCount > 0 ? 100 : 0;

    // Fiscal context
    const currentFY = filters?.fy || "2569";
    const fyInt = parseInt(currentFY);
    const fyStart = new Date(fyInt - 544, 9, 1);
    const fyEnd = new Date(fyInt - 543, 8, 30);
    const fyCount = await Registration.countDocuments({ registeredAt: { $gte: fyStart, $lte: fyEnd }, status: { $ne: 'Cancelled' } });

    return {
        activities: totalActivities,
        registrations: totalRegistrations,
        certificates: totalCertificates,
        participationRate,
        supervisorsCount: activeSupervisorsCount,
        trends: {
            registrations: regTrend
        },
        fiscal: {
            year: currentFY,
            registrations: fyCount
        },
        breakdowns: {
            supervisors: supervisors.map(s => ({
                name: s._id?.name || "ไม่ทราบชื่อ",
                count: s.count,
                unit: s._id?.profile?.college || s._id?.profile?.affiliation || "ไม่ระบุหน่วยงาน"
            })),
            units: unitBreaks.map(u => {
                const nameMap: Record<string, string> = {
                    "Government": "หน่วยงานราชการ",
                    "Supervisor_Unit": "หน่วยศึกษานิเทศก์",
                    "Central": "ส่วนกลาง",
                    "Regional": "ส่วนภูมิภาค"
                };
                return {
                    name: (u._id && nameMap[u._id]) ? nameMap[u._id] : (u._id || "ไม่ระบุหน่วยงาน"),
                    count: u.count
                };
            }),
            teachers: teachers.map(t => ({
                name: t._id?.name || "ไม่ทราบชื่อ",
                count: t.count,
                unit: t._id?.profile?.college || t._id?.profile?.affiliation || "ไม่ระบุหน่วยงาน"
            }))
        }
    };
}


export async function getMonthlyStats(filters?: { fy?: string }) {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin' && session.user.role !== 'supervisor')) {
        return [];
    }

    await dbConnect();

    let startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);

    if (filters?.fy) {
        const fy = parseInt(filters.fy);
        startDate = new Date(fy - 544, 9, 1);
    }

    const registrationStats = await Registration.aggregate([
        {
            $match: {
                registeredAt: { $gte: startDate },
                status: { $ne: 'Cancelled' }
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

    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const result = [];

    // Show up to 12 months if FY is selected, otherwise 6
    const iterations = filters?.fy ? 12 : 6;
    const now = new Date();

    for (let i = iterations - 1; i >= 0; i--) {
        const d = filters?.fy
            ? new Date(startDate.getFullYear(), startDate.getMonth() + (iterations - 1 - i), 1)
            : new Date(now.getFullYear(), now.getMonth() - i, 1);

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

    const registrations = await Registration.find({})
        .populate('userId', 'name email')
        .populate('activityId', 'title startTime');

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

