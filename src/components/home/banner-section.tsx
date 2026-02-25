"use client";

import Image from "next/image";
import Link from "next/link";

export function BannerSection() {
    return (
        <section className="py-24 bg-slate-50/50 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="https://oic.ovec.go.th" target="_blank" rel="noopener noreferrer">
                    <div className="relative w-full aspect-[4/1] md:aspect-[5/1] overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                        <Image
                            src="/baner.png"
                            alt="คลังปัญญาอาชีวศึกษา OVEC Intelligent Center"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </Link>
            </div>
        </section>
    );
}
