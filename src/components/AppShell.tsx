"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isAiChat = pathname.startsWith("/ai/chat");

  return (
    <>
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && !isAiChat && <Footer />}
    </>
  );
}
