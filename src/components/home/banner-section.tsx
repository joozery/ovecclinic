"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBanners } from "@/actions/settings";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BannerSection() {
    const [banners, setBanners] = useState<{ image: string, link: string }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getBanners();
                setBanners(data);
            } catch (error) {
                console.error("Failed to load banners", error);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

    if (isLoading) {
        return (
            <section className="py-24 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="w-full aspect-[4/1] md:aspect-[5/1] bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                    </div>
                </div>
            </section>
        );
    }

    if (banners.length === 0) return null;

    return (
        <section className="py-24 bg-slate-50/50 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative w-full aspect-[3/1] md:aspect-[4/1] overflow-hidden rounded-2xl shadow-xl border border-white group">
                    <div
                        className="flex transition-transform duration-700 ease-in-out h-full"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {banners.map((banner, index) => (
                            <div key={index} className="relative min-w-full h-full">
                                <Link
                                    href={banner.link || "#"}
                                    target={banner.link?.startsWith('http') ? "_blank" : "_self"}
                                    className={cn("block w-full h-full", !banner.link && "pointer-events-none")}
                                >
                                    <Image
                                        src={banner.image || "/baner.png"}
                                        alt={`Banner ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    {banners.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90 shadow-lg"
                            >
                                <ChevronLeft className="w-6 h-6 border-2 border-white/50 rounded-full" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90 shadow-lg"
                            >
                                <ChevronRight className="w-6 h-6 border-2 border-white/50 rounded-full" />
                            </button>

                            {/* Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {banners.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={cn(
                                            "h-1.5 transition-all duration-300 rounded-full shadow-sm",
                                            currentIndex === index ? "w-8 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                                        )}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
