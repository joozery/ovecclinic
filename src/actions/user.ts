
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

    const prefixTH = formData.get("prefixTH") as string;
    const firstNameTH = formData.get("firstNameTH") as string;
    const lastNameTH = formData.get("lastNameTH") as string;
    const prefixEN = formData.get("prefixEN") as string;
    const firstNameEN = formData.get("firstNameEN") as string;
    const lastNameEN = formData.get("lastNameEN") as string;

    const birthDay = formData.get("birthDay") as string;
    const birthMonth = formData.get("birthMonth") as string;
    const birthYear = formData.get("birthYear") as string;

    const teachingSubject = formData.get("teachingSubject") as string;
    const phone = formData.get("phone") as string;
    const college = formData.get("college") as string;
    const position = formData.get("position") as string;
    const region = formData.get("region") as string;
    const affiliation = formData.get("affiliation") as string;
    const academicStanding = formData.get("academicStanding") as string;
    const idCard = formData.get("idCard") as string;
    const province = formData.get("province") as string;
    const image = formData.get("image") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await dbConnect();

    // Check if Email exists in another user
    if (email) {
        const existingUserWithEmail = await User.findOne({ email });
        if (existingUserWithEmail && existingUserWithEmail._id.toString() !== session.user.id) {
            return {
                error: `อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น`
            };
        }
    }

    // Check if ID Card exists in another user
    if (idCard) {
        const existingUserWithIdCard = await User.findOne({ idCard });
        if (existingUserWithIdCard && existingUserWithIdCard._id.toString() !== session.user.id) {
            // Found a duplicate! Provide a specific error message.
            const providerAccounts = existingUserWithIdCard.providerAccounts || [];
            const linkedProviders = providerAccounts.map((pa: any) => pa.provider).join(", ");
            const providerMsg = linkedProviders ? `ด้วยบัญชี ${linkedProviders}` : `ด้วยอีเมล ${existingUserWithIdCard.email}`;

            return {
                error: `เลขบัตรประชาชนนี้เคยลงทะเบียนไว้แล้ว ${providerMsg} กรุณาเข้าสู่ระบบด้วยช่องทางเดิม`
            };
        }
    }

    // Find the user first to check if profile was already complete
    const user = await User.findById(session.user.id);
    const wasAlreadyComplete = user?.isProfileComplete;

    // Combine Birth Date
    let birthDate: Date | null = null;
    if (birthDay && birthMonth && birthYear) {
        birthDate = new Date(`${Number(birthYear) - 543}-${birthMonth}-${birthDay}`);
    }

    const updateData: any = {
        name: `${firstNameTH} ${lastNameTH}`.trim(),
        profile: {
            prefixTH, firstNameTH, lastNameTH,
            prefixEN, firstNameEN, lastNameEN,
            birthDate,
            phone,
            college,
            position,
            region,
            province,
            affiliation,
            academicStanding,
            teachingSubject,
        },
        isProfileComplete: true,
    };

    if (idCard) updateData.idCard = idCard;
    if (image) updateData.image = image;
    if (email) updateData.email = email;

    if (password && password.trim().length >= 6) {
        const bcrypt = await import("bcryptjs");
        updateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(session.user.id, updateData);

    // If this is the first time they complete their profile (Welcome them!)
    if (!wasAlreadyComplete && user?.email) {
        try {
            const { sendWelcomeEmail } = await import("@/lib/mail");
            await sendWelcomeEmail({
                to: user.email,
                userName: `${firstNameTH} ${lastNameTH}`.trim() || user.name || "สมาชิกใหม่",
            });
        } catch (emailError) {
            console.error("Failed to send welcome email during onboarding:", emailError);
        }
    }

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

export async function getUserById(userId: string) {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();
    const user = await User.findById(userId).select("-password");
    if (!user) return null;

    return JSON.parse(JSON.stringify(user));
}

export async function updateUserByAdmin(userId: string, formData: FormData) {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        throw new Error("Unauthorized");
    }

    const prefixTH = formData.get("prefixTH") as string;
    const firstNameTH = formData.get("firstNameTH") as string;
    const lastNameTH = formData.get("lastNameTH") as string;
    const prefixEN = formData.get("prefixEN") as string;
    const firstNameEN = formData.get("firstNameEN") as string;
    const lastNameEN = formData.get("lastNameEN") as string;

    const birthDay = formData.get("birthDay") as string;
    const birthMonth = formData.get("birthMonth") as string;
    const birthYear = formData.get("birthYear") as string;

    const teachingSubject = formData.get("teachingSubject") as string;
    const phone = formData.get("phone") as string;
    const college = formData.get("college") as string;
    const position = formData.get("position") as string;
    const region = formData.get("region") as string;
    const affiliation = formData.get("affiliation") as string;
    const academicStanding = formData.get("academicStanding") as string;
    const idCard = formData.get("idCard") as string;
    const province = formData.get("province") as string;
    const image = formData.get("image") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await dbConnect();

    // Check if Email exists in another user
    if (email) {
        const existingUserWithEmail = await User.findOne({ email });
        if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userId) {
            return {
                error: `อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น`
            };
        }
    }

    // Check if ID Card exists in another user
    if (idCard) {
        const existingUserWithIdCard = await User.findOne({ idCard });
        if (existingUserWithIdCard && existingUserWithIdCard._id.toString() !== userId) {
            return {
                error: `เลขบัตรประชาชนนี้ถูกใช้งานแล้วโดยผู้ใช้อื่น`
            };
        }
    }

    // Combine Birth Date
    let birthDate: Date | null = null;
    if (birthDay && birthMonth && birthYear) {
        birthDate = new Date(`${Number(birthYear) - 543}-${birthMonth}-${birthDay}`);
    }

    const updateData: any = {
        name: `${firstNameTH} ${lastNameTH}`.trim(),
        profile: {
            prefixTH, firstNameTH, lastNameTH,
            prefixEN, firstNameEN, lastNameEN,
            birthDate,
            phone,
            college,
            position,
            region,
            province,
            affiliation,
            academicStanding,
            teachingSubject,
        },
    };

    if (idCard) updateData.idCard = idCard;
    if (image) updateData.image = image;
    if (email) updateData.email = email;

    if (password && password.trim().length >= 6) {
        const bcrypt = await import("bcryptjs");
        updateData.password = await bcrypt.hash(password, 10);
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) throw new Error("User not found");

    // Only super_admin can modify other super_admins/admins
    if ((targetUser.role === 'super_admin' || targetUser.role === 'admin') && session.user.role !== 'super_admin') {
        throw new Error("Only Super Admin can modify admin profiles");
    }

    await User.findByIdAndUpdate(userId, updateData);

    revalidatePath("/admin/users");
    return { success: true };
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

export async function bulkUpdateUserRole(userIds: string[], newRole: string) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const currentUser = session.user;
    if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    const targetUsers = await User.find({ _id: { $in: userIds } });

    // Only super_admin can modify other super_admins
    for (const targetUser of targetUsers) {
        if (targetUser.role === 'super_admin' && currentUser.role !== 'super_admin') {
            throw new Error("Only Super Admin can modify other Super Admins");
        }
    }

    await User.updateMany({ _id: { $in: userIds } }, { role: newRole });

    revalidatePath("/admin/users");
    return { success: true };
}

export async function bulkDeleteUsers(userIds: string[]) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const currentUser = session.user;
    if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        throw new Error("Unauthorized");
    }

    // Cannot delete yourself
    if (userIds.includes(currentUser.id!)) {
        throw new Error("Cannot delete your own account");
    }

    await dbConnect();

    const targetUsers = await User.find({ _id: { $in: userIds } });

    // Only super_admin can delete other admins/super_admins
    for (const targetUser of targetUsers) {
        if ((targetUser.role === 'super_admin' || targetUser.role === 'admin') && currentUser.role !== 'super_admin') {
            throw new Error("Only Super Admin can delete admin accounts");
        }
    }

    await User.deleteMany({ _id: { $in: userIds } });

    revalidatePath("/admin/users");
    return { success: true };
}

export async function resetUserPasswordByAdmin(userId: string, formData: FormData) {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        throw new Error("Unauthorized");
    }

    const password = formData.get("password") as string;
    if (!password || password.length < 6) {
        return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
    }

    await dbConnect();
    const targetUser = await User.findById(userId);
    if (!targetUser) return { error: "ไม่พบผู้ใช้งาน" };

    if ((targetUser.role === 'super_admin' || targetUser.role === 'admin') && session.user.role !== 'super_admin') {
        return { error: "เฉพาะ Super Admin เท่านั้นที่สามารถเปลี่ยนรหัสผ่านของผู้ดูแลระบบด้วยกันได้" };
    }

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    revalidatePath("/admin/users");
    return { success: true };
}
