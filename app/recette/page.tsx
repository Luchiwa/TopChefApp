import { Suspense } from "react";
import { RecipeScreen } from "@/components/RecipeScreen";

export default function RecettePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-10 pt-3 sm:px-8">
      <Suspense fallback={<div className="tc-skeleton mt-12 h-64" />}>
        <RecipeScreen />
      </Suspense>
    </main>
  );
}
