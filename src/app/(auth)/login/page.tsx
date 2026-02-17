import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="relative min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Logo Area */}
                <div className="flex flex-col items-center space-y-4">
                    <Link href="/" className="transition-transform hover:scale-105 active:scale-95 duration-300">
                        <div className="relative w-48 h-12">
                            <Image
                                src="/logo/logo.jpg"
                                alt="OVEC Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                <LoginForm />

                {/* Footer Links - Optional since they are inside the form now */}
                <div className="text-center text-sm text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} OVEC Supervise Clinic. All rights reserved.
                </div>
            </div>
        </div>
    );
}
