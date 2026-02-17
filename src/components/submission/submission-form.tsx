
"use client";

import { useTransition, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { submitWork } from "@/actions/submission";
import { uploadFile } from "@/actions/upload";
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
import { Plus, Trash2, ExternalLink, FileText, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Schema for link validation
const formSchema = z.object({
    links: z.array(z.string().url("Must be a valid URL")),
    // We handle files separately as File objects are not easily validated with Zod in server actions context without FormData
});

interface SubmissionFormProps {
    registrationId: string;
    initialData?: any; // Existing submission data
}

export function SubmissionForm({ registrationId, initialData }: SubmissionFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // File state (simulated upload)
    const [files, setFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<any[]>(initialData?.files || []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            links: initialData?.links || [""], // Default one empty link field
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "links" as never, // Typings for useFieldArray can be tricky with simple arrays
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
        }
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const formData = new FormData();

            // Append links
            values.links.forEach((link) => {
                if (link.trim()) formData.append("links", link);
            });

            // Process files
            let uploadedFiles: any[] = [];
            try {
                if (files.length > 0) {
                    uploadedFiles = await Promise.all(files.map(async (file) => {
                        const uploadFormData = new FormData();
                        uploadFormData.append("file", file);
                        const { secure_url } = await uploadFile(uploadFormData);
                        return {
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            url: secure_url
                        };
                    }));
                }
            } catch (error) {
                console.error("Upload failed", error);
                toast.error("File upload failed. Please try again.");
                return; // Stop submission if upload fails
            }

            // Combine existing files (already have metadata) with new files
            const allFiles = [...existingFiles, ...uploadedFiles];

            formData.append("fileMetadata", JSON.stringify(allFiles));

            try {
                await submitWork(registrationId, formData);
                toast.success("Work submitted successfully!");
                router.refresh();
            } catch (error) {
                toast.error("Failed to submit work: " + (error as Error).message);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* File Upload Section */}
                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <UploadCloud className="w-5 h-5" /> File Upload
                    </h3>

                    <Input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">Supported formats: PDF, DOCX, JPG, PNG</p>

                    {/* Existing Files Display */}
                    {existingFiles.length > 0 && (
                        <div className="space-y-2 mt-4">
                            <p className="text-sm font-medium">Uploaded Files:</p>
                            {existingFiles.map((file: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-background border rounded text-sm">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        <span>{file.name}</span>
                                        <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                    {/* In real app, allow removing individual files */}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New Files Preview */}
                    {files.length > 0 && (
                        <div className="space-y-2 mt-4">
                            <p className="text-sm font-medium">Ready to upload:</p>
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span>{file.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Links Section */}
                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <ExternalLink className="w-5 h-5" /> External Links
                    </h3>
                    <p className="text-sm text-muted-foreground">Add links to Google Drive, YouTube, or other evidence.</p>

                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                            <FormField
                                control={form.control}
                                name={`links.${index}`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1 && form.getValues().links[0] === ""}
                            >
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => append("")}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Link
                    </Button>
                </div>

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Submitting..." : "Submit Work"}
                </Button>
            </form>
        </Form>
    );
}
