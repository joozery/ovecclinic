"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { sendOTPEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

/**
 * ส่งรหัส OTP ไปยังอีเมลเพื่อเริ่มกระบวนการลืมรหัสผ่าน
 */
export async function sendForgotPasswordOTP(email: string) {
    if (!email) return { error: "กรุณาระบุอีเมล" };

    try {
        await dbConnect();

        // 1. ตรวจสอบว่ามีผู้ใช้งานนี้หรือไม่
        const user = await User.findOne({ email });
        if (!user) {
            // เพื่อความปลอดภัย ไม่บอกว่าไม่มีอีเมลนี้ในระบบ (ป้องกันการสุ่มอีเมล)
            // แต่ในระบบปิดแบบนี้ อาจจะบอกตามจริงได้ หรือส่ง success กลับไปหลอกๆ
            return { success: true };
        }

        // 2. สร้างรหัส OTP 6 หลัก
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // หมดอายุใน 5 นาที

        // 3. บันทึกลงฐานข้อมูล (ลบของเก่าที่มีอีเมลเดียวกันถ้ามี)
        await Otp.deleteMany({ email });
        await Otp.create({
            email,
            code: otpCode,
            expiresAt
        });

        // 4. ส่งอีเมล
        const mailResult = await sendOTPEmail({ to: email, otp: otpCode });

        if (!mailResult.success) {
            return { error: "ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่ภายหลัง" };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        return { error: "เกิดข้อผิดพลาดในการทำรายการ" };
    }
}

/**
 * ตรวจสอบรหัส OTP
 */
export async function verifyForgotPasswordOTP(email: string, code: string) {
    if (!email || !code) return { error: "ข้อมูลไม่ครบถ้วน" };

    try {
        await dbConnect();

        const otpRecord = await Otp.findOne({ email, code });

        if (!otpRecord) {
            return { error: "รหัส OTP ไม่ถูกต้อง" };
        }

        if (new Date() > otpRecord.expiresAt) {
            return { error: "รหัส OTP หมดอายุแล้ว" };
        }

        return { success: true };
    } catch (error) {
        return { error: "เกิดข้อผิดพลาดในการตรวจสอบ" };
    }
}

/**
 * รีเซ็ตรหัสผ่านใหม่
 */
export async function resetPasswordWithOTP(email: string, code: string, password: string) {
    if (!email || !code || !password) return { error: "ข้อมูลไม่ครบถ้วน" };
    if (password.length < 6) return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };

    try {
        await dbConnect();

        // 1. ตรวจสอบ OTP อีกครั้งเพื่อความปลอดภัย
        const otpRecord = await Otp.findOne({ email, code });
        if (!otpRecord || new Date() > otpRecord.expiresAt) {
            return { error: "เซสชันหมดอายุ กรุณาเริ่มทำรายการใหม่" };
        }

        // 2. แฮชรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. อัปเดตรหัสผ่านผู้ใช้
        const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) return { error: "ไม่พบผู้ใช้งาน" };

        // 4. ลบ OTP ทิ้งหลังใช้สำเร็จ
        await Otp.deleteOne({ _id: otpRecord._id });

        return { success: true };
    } catch (error) {
        return { error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" };
    }
}
