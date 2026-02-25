import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": response.headers.get("content-type") || "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable",
            }
        });
    } catch (error) {
        console.error("Proxy image error:", error);
        return new NextResponse("Error fetching image", { status: 500 });
    }
}
