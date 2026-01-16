"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/actions/waitlist";
import { Rocket, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function WaitlistPage() {
    const [email, setEmail] = useState("");
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        startTransition(async () => {
            const response = await joinWaitlist(email);
            setResult(response);
            if (response.success) {
                setEmail("");
            }
        });
    };

    return (
        <div
            ref={containerRef}
            className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden bg-black"
        >
            {/* Spotlight Effect */}
            <div
                className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(249, 115, 22, 0.15), transparent 40%)`,
                }}
            />

            {/* Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-600/30 via-amber-600/20 to-yellow-600/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-full blur-[100px]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-r from-yellow-600/15 to-amber-600/15 rounded-full blur-[100px]" />
            </div>

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: "50px 50px",
                }}
            />

            <div className="relative z-10 max-w-2xl w-full text-center space-y-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                    <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span className="text-sm font-medium bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
                        Coming Soon
                    </span>
                </div>

                {/* Title */}
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                        <span className="block bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
                            Discover the Best
                        </span>
                        <span className="block bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 bg-clip-text text-transparent pb-1">
                            Open Source Resources
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-400 max-w-lg mx-auto leading-relaxed">
                        A curated collection of the finest open-source projects, tools, and resources.
                        Be the first to explore when we launch.
                    </p>
                </div>

                {/* Waitlist Form */}
                <div className="p-1 rounded-2xl bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/20 backdrop-blur-xl">
                    <div className="bg-zinc-900/80 backdrop-blur-xl rounded-xl p-6 md:p-8 space-y-5">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative group">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isPending}
                                        className="h-14 px-5 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 rounded-xl focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isPending || !email.trim()}
                                    className="h-14 px-8 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:via-amber-500 hover:to-yellow-500 text-white font-semibold shadow-2xl shadow-orange-500/30 transition-all duration-300 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Joining...
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="w-5 h-5 mr-2" />
                                            Join Waitlist
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Result Message */}
                            {result && (
                                <div
                                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border backdrop-blur-sm ${result.success
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                        : "bg-red-500/10 text-red-400 border-red-500/30"
                                        }`}
                                >
                                    {result.success ? (
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    )}
                                    <span className="text-sm font-medium">{result.message}</span>
                                </div>
                            )}
                        </form>

                        <p className="text-xs text-zinc-500">
                            No spam, ever. We&apos;ll only notify you when we launch.
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    {[
                        { title: "Curated Collection", desc: "Hand-picked open source gems" },
                        { title: "Easy Discovery", desc: "Find the perfect tool fast" },
                        { title: "Community Driven", desc: "Powered by developers" },
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="group p-5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
                        >
                            <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-zinc-500 mt-1">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
