"use client";

import { useState, useTransition } from "react";
import { upsertSiteSetting } from "@/actions/site-settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle, ExternalLink } from "lucide-react";

interface ManualUrlFormProps {
    currentUrl: string;
}

export function ManualUrlForm({ currentUrl }: ManualUrlFormProps) {
    const [url, setUrl] = useState(currentUrl);
    const [saved, setSaved] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            await upsertSiteSetting("manual_url", url);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://docs.google.com/... หรือ https://example.com/manual"
                    className="h-10 rounded-xl border-slate-200 text-sm font-medium flex-1"
                />
                <Button
                    onClick={handleSave}
                    disabled={isPending}
                    className={`h-10 px-4 rounded-xl font-bold text-sm gap-2 transition-all ${saved
                            ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    {saved ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            บันทึกแล้ว
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            {isPending ? "กำลังบันทึก..." : "บันทึก"}
                        </>
                    )}
                </Button>
            </div>

            {url && (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:underline"
                >
                    <ExternalLink className="w-3 h-3" />
                    ทดสอบเปิดลิงก์
                </a>
            )}

            {!url && (
                <p className="text-[11px] text-slate-400 font-medium">
                    ⚠️ หากไม่ได้ตั้งค่า ปุ่ม &quot;คู่มือการใช้งาน&quot; จะลิงก์ไปหน้าภายในระบบแทน
                </p>
            )}
        </div>
    );
}
