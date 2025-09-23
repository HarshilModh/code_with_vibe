import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Auth",
    description: "Auth",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return  <main className="flex justify-center items-center h-screen flex-col bg-zinc-900">
        {children}
        </main>
}