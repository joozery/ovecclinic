
import * as z from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุลจริง"),
    email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string().min(6, "กรุณายืนยันรหัสผ่าน"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
});

export const loginSchema = z.object({
    email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
});
