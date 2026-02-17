
import { auth } from "@/auth";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    if (session.user.isProfileComplete) {
        redirect("/dashboard");
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <OnboardingForm />
        </div>
    );
}
