
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { changePassword } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ChangePasswordForm() {
    const [state, formAction] = useFormState(changePassword, null);
    const formRef = useRef<HTMLFormElement>(null);

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
        if (state?.success) {
            toast.success("เปลี่ยนรหัสผ่านสำเร็จแล้ว");
            form.reset();
        }
    }, [state, form]);

    return (
        <form action={formAction} ref={formRef} className="space-y-8 max-w-xl">
            <div className="grid gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700" htmlFor="currentPassword">
                        รหัสผ่านปัจจุบัน
                    </label>
                    <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700" htmlFor="newPassword">
                        รหัสผ่านใหม่
                    </label>
                    <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium"
                    />
                    <p className="text-[11px] font-medium text-slate-400">รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700" htmlFor="confirmPassword">
                        ยืนยันรหัสผ่านใหม่
                    </label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all font-medium"
                    />
                </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
                <SubmitButton />
            </div>
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="h-12 px-10 bg-[#1a237e] hover:bg-[#151b60] text-white rounded-xl font-black text-sm shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
        >
            {pending ? (
                <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังอัปเดต...
                </>
            ) : "บันทึกรหัสผ่านใหม่"}
        </Button>
    );
}
