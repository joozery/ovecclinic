
"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const bio = formData.get("bio") as string;
    // Avatar handling would typically involve file upload to S3/Cloudinary.
    // For now, we might accept a URL or just skip it if not implemented.
    // const avatar = formData.get("avatar"); 

    await dbConnect();

    await User.findByIdAndUpdate(session.user.id, {
        name,
        phone,
        bio,
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function changePassword(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) {
        return { error: "Unauthorized" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "All fields are required" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match" };
    }

    if (newPassword.length < 6) {
        return { error: "Password must be at least 6 characters" };
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
        return { error: "User not found" };
    }

    // Check if user has a password (they might be OAuth only)
    if (!user.password) {
        return { error: "You are logged in via a social provider. You cannot set a password." };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordsMatch) {
        return { error: "Incorrect current password" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(session.user.id, {
        password: hashedPassword,
    });

    return { success: "Password updated successfully" };
}
