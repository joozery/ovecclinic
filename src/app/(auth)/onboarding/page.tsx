import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";
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
        <div className="flex justify-center items-center min-h-screen bg-gray-50 py-10 px-4">
            <RegisterForm />
        </div>
    );
}
