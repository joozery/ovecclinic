
"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/zod";

export async function register(values: any) {
    try {
        await dbConnect();

        const { name, email, password } = values;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { error: "อีเมลนี้ถูกใช้งานแล้ว" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "teacher", // Default role
        });

        return { success: "ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ" };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง" };
    }
}
