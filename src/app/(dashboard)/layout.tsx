
"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers";
import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50/30">
            <Sidebar />
            <div className={cn(
                "flex flex-col flex-1 w-full transition-all duration-300 ease-in-out",
                isCollapsed ? "md:pl-20" : "md:pl-72"
            )}>
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-10">
                    <div className="max-w-7xl mx-auto space-y-8">
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
