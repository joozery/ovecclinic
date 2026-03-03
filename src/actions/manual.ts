"use server";

import dbConnect from "@/lib/db";
import Manual from "@/models/Manual";
import { revalidatePath } from "next/cache";

export async function getManuals() {
    await dbConnect();
    const manuals = await Manual.find({}).sort({ order: 1 }).lean();
    return JSON.parse(JSON.stringify(manuals));
}

export async function getActiveManuals() {
    await dbConnect();
    const manuals = await Manual.find({ isActive: true }).sort({ order: 1 }).lean();
    return JSON.parse(JSON.stringify(manuals));
}

export async function createManual(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const order = Number(formData.get("order")) || 0;
    const isActive = formData.get("isActive") === "true";

    if (!title || !description) {
        throw new Error("Title and description are required");
    }

    await dbConnect();
    await Manual.create({ title, description, imageUrl, order, isActive });

    revalidatePath("/");
    revalidatePath("/manual");
    revalidatePath("/dashboard/admin/manual");
}

export async function updateManual(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const order = Number(formData.get("order")) || 0;
    const isActive = formData.get("isActive") === "true";

    if (!title || !description) {
        throw new Error("Title and description are required");
    }

    await dbConnect();
    await Manual.findByIdAndUpdate(id, { title, description, imageUrl, order, isActive });

    revalidatePath("/");
    revalidatePath("/manual");
    revalidatePath("/dashboard/admin/manual");
}

export async function deleteManual(id: string) {
    await dbConnect();
    await Manual.findByIdAndDelete(id);

    revalidatePath("/");
    revalidatePath("/manual");
    revalidatePath("/dashboard/admin/manual");
}
