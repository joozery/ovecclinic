
"use server";

import dbConnect from "@/lib/db";
import SiteSetting from "@/models/SiteSetting";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getFooterSettings() {
    await dbConnect();
    const setting = await SiteSetting.findOne({ key: 'footer' });

    // Default values if not set
    const defaultFooter = {
        description: "ระบบจองคิวเพื่อเข้ารับการนิเทศออนไลน์ สำหรับบุคลากรสังกัด สอศ. เพื่อพัฒนาคุณภาพการศึกษาอย่างทั่วถึงและมีประสิทธิภาพ",
        contact: {
            email: "contact@vec.go.th",
            phone: "02-354-4524",
            address: "กรุงเทพมหานคร 10110"
        },
        relatedLinks: [
            { label: "สำนักงานคณะกรรมการการอาชีวศึกษา", url: "https://www.vec.go.th" },
            { label: "กระทรวงศึกษาธิการ", url: "https://www.moe.go.th" }
        ],
        copyright: "© 2567 สำนักงานคณะกรรมการการอาชีวศึกษา (สอศ.) สงวนลิขสิทธิ์"
    };

    if (!setting) return defaultFooter;
    return setting.value;
}

export async function updateFooterSettings(data: any) {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();
    await SiteSetting.findOneAndUpdate(
        { key: 'footer' },
        { value: data },
        { upsert: true, new: true }
    );

    revalidatePath("/");
    return { success: true };
}

export async function getBanners() {
    await dbConnect();
    const setting = await SiteSetting.findOne({ key: 'banners' });

    if (!setting) {
        return [{ image: "/baner.png", link: "https://oic.ovec.go.th" }];
    }
    return setting.value;
}

export async function updateBanners(banners: any[]) {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();
    await SiteSetting.findOneAndUpdate(
        { key: 'banners' },
        { value: banners },
        { upsert: true, new: true }
    );

    revalidatePath("/");
    return { success: true };
}

export async function getHeroSettings() {
    await dbConnect();
    const setting = await SiteSetting.findOne({ key: 'hero' });

    if (!setting) {
        return {
            backgroundImage: "/hero.jpg",
            title: "ยกระดับการนิเทศ \nสู่มาตรฐานสากล",
            subtitle: "ระบบบริหารจัดการกิจกรรมการนิเทศออนไลน์ที่ทันสมัย \nและครบวงจรที่สุดสำหรับบุคลากรทางการศึกษา"
        };
    }
    return setting.value;
}

export async function updateHeroSettings(data: any) {
    const session = await auth();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        throw new Error("Unauthorized");
    }

    await dbConnect();
    await SiteSetting.findOneAndUpdate(
        { key: 'hero' },
        { value: data },
        { upsert: true, new: true }
    );

    revalidatePath("/");
    return { success: true };
}
