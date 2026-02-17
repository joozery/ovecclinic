
"use server";

import Certificate from "@/models/Certificate";
import Registration from "@/models/Registration";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Helper to generate unique code
async function generateUniqueCode() {
    const year = new Date().getFullYear();
    const count = await Certificate.countDocuments({
        certificateCode: { $regex: `^OVEC-${year}-` }
    });
    const sequence = String(count + 1).padStart(4, '0');
    return `OVEC-${year}-${sequence}`;
}

export async function issueCertificate(registrationId: string) {
    const session = await auth();
    if (!session || (session.user.role !== 'supervisor' && session.user.role !== 'super_admin')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    const registration = await Registration.findById(registrationId).populate('activityId');
    if (!registration) {
        throw new Error("Registration not found");
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ registrationId });
    if (existingCert) {
        return { success: true, certificateCode: existingCert.certificateCode }; // Idempotent
    }

    const certificateCode = await generateUniqueCode();

    await Certificate.create({
        registrationId,
        userId: registration.userId,
        activityId: registration.activityId,
        certificateCode,
        issuedAt: new Date(),
    });

    revalidatePath("/my-certificates");
    revalidatePath(`/supervision`); // If we show issued status there
    return { success: true, certificateCode };
}

export async function getMyCertificates() {
    const session = await auth();
    if (!session) return [];

    await dbConnect();

    const certificates = await Certificate.find({ userId: session.user.id })
        .populate('activityId', 'title startTime endTime location')
        .sort({ issuedAt: -1 });

    return JSON.parse(JSON.stringify(certificates));
}

export async function verifyCertificate(code: string) {
    await dbConnect();
    const certificate = await Certificate.findOne({ certificateCode: code })
        .populate('userId', 'name email')
        .populate('activityId', 'title startTime endTime');

    if (!certificate) return null;

    return JSON.parse(JSON.stringify(certificate));
}
