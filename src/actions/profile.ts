
"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const idCard = formData.get("idCard") as string;
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
    const province = formData.get("province") as string;
    const image = formData.get("image") as string;
    const email = formData.get("email") as string;

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

    // Combine Birth Date
    let birthDate: Date | null = null;
    if (birthDay && birthMonth && birthYear) {
        birthDate = new Date(`${Number(birthYear) - 543}-${birthMonth}-${birthDay}`);
    }

    const updateData: any = {
        name: `${prefixTH}${firstNameTH} ${lastNameTH}`.trim(),
        idCard,
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

    if (image) {
        updateData.image = image;
    }
    if (email) {
        updateData.email = email;
    }

    await User.findByIdAndUpdate(session.user.id, updateData);

    revalidatePath("/settings");
    revalidatePath("/");
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
