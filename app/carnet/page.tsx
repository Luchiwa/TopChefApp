import type { Metadata } from "next";
import { Suspense } from "react";
import { Carnet } from "@/components/Carnet";

export const metadata: Metadata = { title: "Mon carnet — TopChef" };

export default function CarnetPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-8 sm:pt-10">
      <Suspense fallback={<div className="tc-skeleton h-64" />}>
        <Carnet />
      </Suspense>
    </main>
  );
}
