
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
        <div className={cn("relative", className)}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                className="pl-8 w-full"
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
