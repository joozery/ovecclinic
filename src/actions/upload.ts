
"use server";

import r2Client from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadFile(formData: FormData) {
    const file = formData.get("file") as File;

    if (!file) {
        throw new Error("No file provided");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const contentType = file.type || "application/octet-stream";

    const bucketName = process.env.R2_BUCKET_NAME || "";
    const publicUrl = process.env.R2_PUBLIC_URL || "";

    try {
        await r2Client.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: fileName,
                Body: buffer,
                ContentType: contentType,
            })
        );

        // Return the public URL
        return {
            secure_url: `${publicUrl}/${fileName}`,
            public_id: fileName,
        };
    } catch (error) {
        console.error("R2 Upload Error:", error);
        throw new Error("Failed to upload file to R2");
    }
}
