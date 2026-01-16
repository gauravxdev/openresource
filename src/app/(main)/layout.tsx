import Navbar from "@/components/Navbar";
import { TRPCReactProvider } from "@/trpc/react";

export default function MainLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <Navbar />
            <TRPCReactProvider>{children}</TRPCReactProvider>
        </>
    );
}
