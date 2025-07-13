'use client';

import Menu from "@/components/common/Menu";
import Navbar from "@/components/common/Navbar";
import MobileSidebar from "@/components/common/MobileSidebar";
import { useMobileSidebar } from "@/hooks/useMobileSidebar";
import Image from "next/image";
import Link from "next/link";

export default function PegawaiLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { isOpen, toggle, close } = useMobileSidebar();

    return (
        <div className="h-screen flex">
            {/* Mobile Sidebar */}
            <MobileSidebar 
                isOpen={isOpen}
                onToggle={toggle}
                onClose={close}
            />

            {/* Desktop Sidebar - LEFT */}
            <div className="hidden lg:block w-[16%] xl:w-[14%] p-4 bg-white border-r border-gray-200">
                <Link href="/" className="flex items-center justify-start gap-2">
                    <Image src="/logo.png" alt="logo" width={32} height={32} />
                    <span className="font-bold">RSUD Anugerah</span>
                </Link>
                <Menu />
            </div>
            
            {/* Main Content - RIGHT */}
            <div className="w-full lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-hidden flex flex-col">
                {/* Navbar with mobile menu toggle */}
                <Navbar onMenuToggle={toggle} />
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
