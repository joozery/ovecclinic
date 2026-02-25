
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { reviewSubmission } from "@/actions/submission";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    status: z.enum(['Pending', 'In Review', 'Approved', 'Rejected', 'Request Changes']),
    feedback: z.string().min(5, "กรุณาระบุข้อเสนอแนะอย่างน้อย 5 ตัวอักษร"),
});

interface ReviewFormProps {
    submissionId: string;
    initialData?: any;
}

export function ReviewForm({ submissionId, initialData }: ReviewFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: initialData?.status || 'Pending',
            feedback: initialData?.feedback || '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                await reviewSubmission(submissionId, values.status, values.feedback);
                toast.success("บันทึกผลการตรวจประเมินเรียบร้อยแล้ว!");
                router.refresh();
            } catch (error) {
                toast.error("บันทึกผลการตรวจประเมินไม่สำเร็จ: " + (error as Error).message);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-slate-700">สถานะผลงาน</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue placeholder="เลือกสถานะผลงาน" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Pending">รอการตรวจ</SelectItem>
                                    <SelectItem value="In Review">กำลังตรวจ</SelectItem>
                                    <SelectItem value="Approved" className="text-emerald-600 font-bold focus:text-emerald-700">อนุมัติ (ผ่านเกณฑ์)</SelectItem>
                                    <SelectItem value="Request Changes" className="text-orange-600 font-bold focus:text-orange-700">ขอข้อมูลเพิ่มเติม</SelectItem>
                                    <SelectItem value="Rejected" className="text-red-600 font-bold focus:text-red-700">ปฏิเสธ (ไม่อนุมัติ)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="feedback"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-slate-700">ข้อเสนอแนะ / ความคิดเห็น</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="ระบุข้อเสนอแนะเพื่อเป็นประโยชน์แก่ผู้ส่งงาน..."
                                    className="min-h-[140px] resize-none rounded-xl"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                    {isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังบันทึกข้อมูล...</>
                    ) : (
                        "บันทึกผลประเมิน"
                    )}
                </Button>
            </form>
        </Form>
    );
}
