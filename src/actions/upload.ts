
"use server";

import cloudinary from "@/lib/cloudinary";

export async function uploadFile(formData: FormData) {
    const file = formData.get("file") as File;

    if (!file) {
        throw new Error("No file provided");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: "ovec-platform",
                resource_type: "auto", // Automatically detect image/pdf/video
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    reject(error);
                    return;
                }
                if (!result) {
                    reject(new Error("Upload failed"));
                    return;
                }
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        ).end(buffer);
    });
}
