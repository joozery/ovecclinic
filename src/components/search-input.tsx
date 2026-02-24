
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCallback } from "react";

import { cn } from "@/lib/utils";

interface SearchProps {
    placeholder?: string;
    defaultValue?: string;
    className?: string;
}

export function SearchInput({ placeholder = "Search...", defaultValue, className }: SearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            params.set("page", "1");
            return params.toString();
        },
        [searchParams]
    );

    return (
        <div className={cn("relative group", className)}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-transform group-focus-within:scale-110">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-[#1a237e] transition-colors" />
            </div>
            <Input
                type="search"
                placeholder={placeholder}
                className="pl-11 pr-4 w-full h-full border-none bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-100 transition-all text-slate-900 font-bold"
                defaultValue={defaultValue || searchParams.get("q") || ""}
                onChange={(e) => {
                    startTransition(() => {
                        router.replace(pathname + "?" + createQueryString("q", e.target.value));
                    });
                }}
            />
        </div>
    );
}
