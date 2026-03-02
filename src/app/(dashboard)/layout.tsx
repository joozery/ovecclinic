
"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers";
import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    useEffect(() => {
        // Prevent background scrolling when in dashboard
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-slate-50/30">
            <Sidebar />
            <div className={cn(
                "flex flex-col flex-1 h-full min-w-0 transition-all duration-300 ease-in-out overflow-hidden",
                isCollapsed ? "md:pl-20" : "md:pl-72"
            )}>
                <Header />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8 pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers>
            <DashboardLayoutContent>
                {children}
            </DashboardLayoutContent>
        </Providers>
    );
}
