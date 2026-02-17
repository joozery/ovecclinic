
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

    const phone = formData.get("phone") as string;
    const college = formData.get("college") as string;
    const position = formData.get("position") as string;
    const region = formData.get("region") as string;
    const affiliation = formData.get("affiliation") as string;

    await dbConnect();

    await User.findByIdAndUpdate(
        session.user.id,
        {
            profile: {
                phone,
                college,
                position,
                region,
                affiliation,
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
}

export async function getUsers({ query, page = 1, limit = 10, role, type }: GetUsersParams) {
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

    const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password"); // Exclude password

    const total = await User.countDocuments(filter);

    return {
        users: JSON.parse(JSON.stringify(users)),
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalUsers: total,
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
