
"use server";

import dbConnect from "@/lib/db";
import CertificateTemplate from "@/models/CertificateTemplate";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const DEFAULT_FIELDS = [
    { id: "recipientName", label: "ชื่อ-นามสกุลผู้รับ", x: 50, y: 42, fontSize: 32, fontWeight: "bold", color: "#1a237e", align: "center" },
    { id: "courseTitle", label: "ชื่อกิจกรรม/หลักสูตร", x: 50, y: 56, fontSize: 20, fontWeight: "bold", color: "#333333", align: "center" },
    { id: "completionDate", label: "วันที่สำเร็จ", x: 50, y: 68, fontSize: 14, fontWeight: "normal", color: "#555555", align: "center" },
    { id: "certificateCode", label: "เลขที่เกียรติบัตร", x: 85, y: 90, fontSize: 10, fontWeight: "normal", color: "#b8860b", align: "right" },
];

export async function getCertificateTemplate() {
    await dbConnect();
    let template = await CertificateTemplate.findOne({ isActive: true }).lean();
    if (!template) {
        // Create default template
        template = await CertificateTemplate.create({
            name: "แม่แบบมาตรฐาน",
            fields: DEFAULT_FIELDS,
            isActive: true,
        });
    }
    return JSON.parse(JSON.stringify(template));
}

export async function saveCertificateTemplate(data: {
    name?: string;
    backgroundImageUrl?: string;
    fields?: any[];
    signerName?: string;
    signerPosition?: string;
    orgName?: string;
}) {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    const existing = await CertificateTemplate.findOne({ isActive: true });

    if (existing) {
        await CertificateTemplate.findByIdAndUpdate(existing._id, {
            ...data,
        });
    } else {
        await CertificateTemplate.create({ ...data, isActive: true });
    }

    revalidatePath("/admin/certificate");
    revalidatePath("/my-certificates");
    return { success: true };
}
