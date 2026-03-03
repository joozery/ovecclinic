"use server";

import dbConnect from "@/lib/db";
import SiteSetting from "@/models/SiteSetting";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/** Get value of a setting by key */
export async function getSiteSetting(key: string): Promise<string | null> {
    await dbConnect();
    const setting = await SiteSetting.findOne({ key }).lean() as any;
    return setting ? String(setting.value) : null;
}

/** Save/upsert a site setting */
export async function upsertSiteSetting(key: string, value: string) {
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
        throw new Error("Unauthorized");
    }

    await dbConnect();
    await SiteSetting.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
    );

    revalidatePath("/");
    revalidatePath("/dashboard/admin/manual");
}
