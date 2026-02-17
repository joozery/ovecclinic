
"use client";

import { useState, useTransition } from "react";
import { registerForActivity } from "@/actions/registration";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface RegisterButtonProps {
    activityId: string;
    isRegistered: boolean;
    isFull: boolean;
    disabled?: boolean;
}

export function RegisterButton({ activityId, isRegistered, isFull, disabled }: RegisterButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleRegister = () => {
        startTransition(async () => {
            try {
                await registerForActivity(activityId);
                router.refresh(); // Refresh page to update status
            } catch (error) {
                console.error("Failed to register:", error);
                alert("Registration failed: " + (error as Error).message);
            }
        });
    };

    if (isRegistered) {
        return (
            <Button variant="outline" disabled className="w-full bg-green-50 text-green-700 border-green-200">
                Registered
            </Button>
        );
    }

    if (isFull) {
        return (
            <Button variant="secondary" disabled className="w-full">
                Activity Full
            </Button>
        );
    }

    return (
        <Button
            className="w-full"
            onClick={handleRegister}
            disabled={isPending || disabled}
        >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                </>
            ) : (
                "Register Now"
            )}
        </Button>
    );
}
