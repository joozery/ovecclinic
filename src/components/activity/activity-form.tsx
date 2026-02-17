
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createActivity, updateActivity } from "@/actions/activity";
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
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().min(10, "Description is required"),
    startTime: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }),
    endTime: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }),
    quota: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, { message: "Quota must be a positive number" }),
    location: z.string().min(2, "Location is required"),
});

interface ActivityFormProps {
    onSuccess?: () => void;
    initialData?: any; // Consider typing this properly with Activity interface
    activityId?: string;
}

export function ActivityForm({ onSuccess, initialData, activityId }: ActivityFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            // Format dates for datetime-local input: YYYY-MM-DDTHH:mm
            startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : "",
            endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : "",
            quota: initialData?.quota ? String(initialData.quota) : "",
            location: initialData?.location || "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value);
            });

            try {
                if (activityId) {
                    await updateActivity(activityId, formData);
                } else {
                    await createActivity(formData);
                }

                if (!activityId) {
                    form.reset();
                }

                if (onSuccess) onSuccess();
            } catch (error) {
                console.error("Failed to save activity", error);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Workshop Title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Detailed description..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quota"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quota (Seats)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="50" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location / Link</FormLabel>
                                <FormControl>
                                    <Input placeholder="Meeting Room 1 or Zoom Link" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Saving..." : (activityId ? "Update Activity" : "Create Activity")}
                </Button>
            </form>
        </Form>
    );
}
