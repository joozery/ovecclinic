import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ลืมรหัสผ่าน | OVEC Subervision Online",
    description: "รีเซ็ตรหัสผ่านเพื่อเข้าใช้งานระบบ",
};

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-[radial-gradient(circle_at_top_right,rgba(26,35,126,0.05),transparent),radial-gradient(circle_at_bottom_left,rgba(26,35,126,0.02),transparent)]">
            <ForgotPasswordForm />
        </div>
    );
}
