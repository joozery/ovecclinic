
"use client";

import { useState, useTransition } from "react";
import { issueCertificate } from "@/actions/certificate";
import { Button } from "@/components/ui/button";
import { Loader2, Award, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CertificateActionsProps {
    registrationId: string;
    isApproved: boolean;
    existingCertificateCode?: string;
}

export function CertificateActions({ registrationId, isApproved, existingCertificateCode }: CertificateActionsProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleIssue = () => {
        startTransition(async () => {
            try {
                await issueCertificate(registrationId);
                toast.success("Certificate issued successfully!");
                router.refresh();
            } catch (error) {
                toast.error("Failed to issue certificate: " + (error as Error).message);
            }
        });
    };

    if (!isApproved) {
        return (
            <div className="p-4 bg-gray-50 border rounded-lg text-sm text-gray-500">
                Certificate can only be issued for approved submissions.
            </div>
        );
    }

    if (existingCertificateCode) {
        return (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                    <p className="font-medium text-green-800">Certificate Issued</p>
                    <p className="text-xs text-green-600 font-mono">Code: {existingCertificateCode}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg bg-blue-50/50">
            <h3 className="font-medium mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" /> Issue Certificate
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
                Generate a certificate for this user. This will be available in their dashboard.
            </p>
            <Button
                onClick={handleIssue}
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Issuing...
                    </>
                ) : (
                    "Issue Certificate Now"
                )}
            </Button>
        </div>
    );
}
