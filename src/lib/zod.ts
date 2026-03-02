
import * as z from "zod";

export const registerSchema = z.object({
    email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร").or(z.literal("")).optional(),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน").or(z.literal("")).optional(),
    idCard: z.string().length(13, "หมายเลขบัตรประชาชนต้องมี 13 หลัก"),
    prefixTH: z.string().min(1, "กรุณาเลือกคำนำหน้า (TH)"),
    firstNameTH: z.string().min(2, "กรุณากรอกชื่อ (TH)"),
    lastNameTH: z.string().min(2, "กรุณากรอกนามสกุล (TH)"),
    prefixEN: z.string().min(1, "กรุณาเลือกคำนำหน้า (EN)"),
    firstNameEN: z.string().min(2, "กรุณากรอกชื่อ (EN)"),
    lastNameEN: z.string().min(2, "กรุณากรอกนามสกุล (EN)"),
    birthDay: z.string().min(1, "กรุณาเลือกวันที่"),
    birthMonth: z.string().min(1, "กรุณาเลือกเดือน"),
    birthYear: z.string().min(1, "กรุณาเลือกปี พ.ศ."),
    phone: z.string().min(10, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง"),
    college: z.string().min(2, "กรุณากรอกชื่อสถานศึกษา"),
    province: z.string().min(2, "กรุณากรอกจังหวัด"),
    position: z.string().min(1, "กรุณาเลือกตำแหน่ง"),
    region: z.string().min(1, "กรุณาเลือกภาค"),
    affiliation: z.enum(['Government', 'Private', 'Supervisor_Unit']),
    academicStanding: z.string().min(1, "กรุณาเลือกวิทยฐานะ"),
    teachingSubject: z.string().min(2, "กรุณากรอกวิชาที่สอน"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
});

export const loginSchema = z.object({
    email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
});
