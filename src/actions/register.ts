
"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/zod";

export async function register(values: any) {
    try {
        await dbConnect();

        const {
            email, password, registrantType, idCard,
            prefixTH, firstNameTH, lastNameTH,
            prefixEN, firstNameEN, lastNameEN,
            birthDay, birthMonth, birthYear,
            phone, college, province, position, region,
            affiliation, academicStanding, teachingSubject, image
        } = values;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { idCard }]
        });

        if (existingUser) {
            if (existingUser.email === email) return { error: "อีเมลนี้ถูกใช้งานแล้ว" };
            if (existingUser.idCard === idCard) return { error: "เลขประจำตัวประชาชนนี้ถูกใช้งานแล้ว" };
        }

        // Combine Birth Date
        const birthDate = new Date(`${Number(birthYear) - 543}-${birthMonth}-${birthDay}`);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name: `${firstNameTH} ${lastNameTH}`,
            email,
            password: hashedPassword,
            idCard,
            image,
            role: "teacher", // Default role
            profile: {
                registrantType: registrantType || "Thai",
                prefixTH, firstNameTH, lastNameTH,
                prefixEN, firstNameEN, lastNameEN,
                birthDate,
                phone,
                college,
                position,
                province,
                region,
                affiliation,
                academicStanding,
                teachingSubject,
            },
            isProfileComplete: true,
        });

        // Send Welcome Email
        try {
            const { sendWelcomeEmail } = await import("@/lib/mail");
            await sendWelcomeEmail({
                to: email,
                userName: `${firstNameTH} ${lastNameTH}`,
            });
        } catch (emailError) {
            console.error("Failed to send welcome email during registration:", emailError);
        }

        return { success: "ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ" };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง" };
    }
}
