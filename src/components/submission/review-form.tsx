
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

const formSchema = z.object({
    status: z.enum(['Pending', 'In Review', 'Approved', 'Rejected', 'Request Changes']),
    feedback: z.string().min(5, "Feedback is required (at least 5 characters)"),
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
                toast.success("Review submitted successfully!");
                router.refresh();
            } catch (error) {
                toast.error("Failed to submit review: " + (error as Error).message);
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
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Review">In Review</SelectItem>
                                    <SelectItem value="Approved" className="text-green-600 font-medium">Approved</SelectItem>
                                    <SelectItem value="Request Changes" className="text-orange-600 font-medium">Request Changes</SelectItem>
                                    <SelectItem value="Rejected" className="text-red-600 font-medium">Rejected</SelectItem>
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
                            <FormLabel>Feedback / Comments</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Provide constructive feedback for the teacher..." className="min-h-[120px]" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Submitting Review..." : "Submit Review"}
                </Button>
            </form>
        </Form>
    );
}
