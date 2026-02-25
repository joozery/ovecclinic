"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export function CertificateSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Controlled input state
    const [query, setQuery] = useState(searchParams.get("q") || "");

    // Add debounce effect
    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (query) {
                params.set("q", query);
            } else {
                params.delete("q");
            }

            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`);
            });
        }, 300); // 300ms delay

        return () => clearTimeout(timeout);
    }, [query, pathname, router, searchParams]);

    return (
        <div className="relative w-full max-w-md mt-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className={`w-5 h-5 ${isPending ? "text-blue-500 animate-pulse" : "text-slate-400"}`} />
            </div>
            <Input
                type="text"
                placeholder="ค้นหาด้วยเลขที่เกียรติบัตร (REF) หรือชื่อหลักสูตร..."
                className="pl-11 pr-4 h-12 w-full rounded-2xl border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-blue-100/60 focus-visible:ring-blue-400 focus-visible:bg-white/20 transition-all shadow-inner"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
}
