
"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const college = formData.get("college") as string;
    const position = formData.get("position") as string;
    const region = formData.get("region") as string;
    const affiliation = formData.get("affiliation") as string;
    const academicStanding = formData.get("academicStanding") as string;

    await dbConnect();

    await User.findByIdAndUpdate(
        session.user.id,
        {
            name,
            profile: {
                phone,
                college,
                position,
                region,
                affiliation,
                academicStanding,
            },
            isProfileComplete: true,
        }
    );

    revalidatePath("/");
    return { success: true };
}

interface GetUsersParams {
    query?: string;
    page?: number;
    limit?: number;
    role?: string;
    type?: string;
    provider?: string;
}

export async function getUsers({ query, page = 1, limit = 10, role, type, provider }: GetUsersParams) {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query) {
        filter.$or = [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
        ];
    }

    if (type === "admins") {
        filter.role = { $in: ["admin", "super_admin"] };
    } else if (type === "members") {
        filter.role = { $in: ["teacher", "supervisor"] };
    } else if (role && role !== "all") {
        filter.role = role;
    }

    // Filter by provider
    if (provider === "line") {
        filter["providerAccounts.provider"] = "line";
    } else if (provider === "google") {
        filter["providerAccounts.provider"] = "google";
    } else if (provider === "thaid") {
        filter["providerAccounts.provider"] = "thaid";
    } else if (provider === "credentials") {
        // Users with a password set and no provider accounts (or minimal)
        filter.password = { $exists: true };
        filter.providerAccounts = { $size: 0 };
    }

    const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password");

    const total = await User.countDocuments(filter);

    // Provider counts for summary chips (from unfiltered base)
    const baseFilter: any = {};
    if (type === "admins") baseFilter.role = { $in: ["admin", "super_admin"] };
    else if (type === "members") baseFilter.role = { $in: ["teacher", "supervisor"] };

    const [lineCount, googleCount, thaidCount, credCount, allCount] = await Promise.all([
        User.countDocuments({ ...baseFilter, "providerAccounts.provider": "line" }),
        User.countDocuments({ ...baseFilter, "providerAccounts.provider": "google" }),
        User.countDocuments({ ...baseFilter, "providerAccounts.provider": "thaid" }),
        User.countDocuments({ ...baseFilter, password: { $exists: true }, providerAccounts: { $size: 0 } }),
        User.countDocuments(baseFilter),
    ]);

    return {
        users: JSON.parse(JSON.stringify(users)),
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalUsers: total,
        providerCounts: {
            all: allCount,
            line: lineCount,
            google: googleCount,
            thaid: thaidCount,
            credentials: credCount,
        },
    };
}

export async function updateUserRole(userId: string, newRole: string) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const currentUser = session.user;
    if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    const targetUser = await User.findById(userId);
    if (!targetUser) throw new Error("User not found");

    if (targetUser.role === 'super_admin' && currentUser.role !== 'super_admin') {
        throw new Error("Only Super Admin can modify other Super Admins");
    }

    targetUser.role = newRole;
    await targetUser.save();

    revalidatePath("/admin/users");
    return { success: true };
}

export async function deleteUser(userId: string) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const currentUser = session.user;
    if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        throw new Error("Unauthorized");
    }

    // Cannot delete yourself
    if (currentUser.id === userId) {
        throw new Error("Cannot delete your own account");
    }

    await dbConnect();

    const targetUser = await User.findById(userId);
    if (!targetUser) throw new Error("User not found");

    // Only super_admin can delete other admins/super_admins
    if ((targetUser.role === 'super_admin' || targetUser.role === 'admin') && currentUser.role !== 'super_admin') {
        throw new Error("Only Super Admin can delete admin accounts");
    }

    await User.findByIdAndDelete(userId);

    revalidatePath("/admin/users");
    return { success: true };
}
