"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isAiChat = pathname.startsWith("/ai/chat");
  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (isDashboard) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isDashboard]);

  return (
    <>
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && !isAiChat && !isDashboard && pathname !== "/profile" && (
        <Footer />
      )}
    </>
  );
}
