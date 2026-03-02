"use server";

import dbConnect from "@/lib/db";
import Otp from "@/models/Otp";
import { sendOTPEmail } from "@/lib/mail";

// Generate a random 6-digit number
function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestOTP(email: string) {
    if (!email || !email.includes("@")) {
        return { error: "รูปแบบอีเมลไม่ถูกต้อง" };
    }

    try {
        await dbConnect();

        // 1. Generate new 6-digit code
        const code = generateRandomCode();

        // 2. Set expiration (5 minutes from now)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        // 3. Upsert existing OTP for this email
        await Otp.findOneAndUpdate(
            { email },
            {
                email,
                code,
                expiresAt
            },
            { upsert: true, new: true }
        );

        // 4. Send email
        await sendOTPEmail({
            to: email,
            otp: code
        });

        return { success: true };
    } catch (error) {
        console.error("Error generating/sending OTP:", error);
        return { error: "เกิดข้อผิดพลาดในการส่งรหัส OTP โปรดลองอีกครั้ง" };
    }
}

export async function verifyOTP(email: string, code: string) {
    if (!email || !code) {
        return { error: "ข้อมูลไม่ครบถ้วน" };
    }

    try {
        await dbConnect();

        // Find OTP record
        const record = await Otp.findOne({ email });

        if (!record) {
            return { error: "ไม่พบข้อมูล OTP สำหรับอีเมลนี้ โปรดขอรหัสใหม่อีกครั้ง" };
        }

        if (record.code !== code) {
            return { error: "รหัส OTP ไม่ถูกต้อง" };
        }

        if (new Date() > record.expiresAt) {
            return { error: "รหัส OTP หมดอายุแล้ว โปรดขอรหัสใหม่อีกครั้ง" };
        }

        // OTP is valid. Delete it so it can't be reused.
        await Otp.deleteOne({ _id: record._id });

        return { success: true };
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { error: "เกิดข้อผิดพลาดในการตรวจสอบรหัส OTP" };
    }
}
