import { Suspense } from "react";
import { EmptyHero } from "@/components/EmptyHero";
import { Fleuron } from "@/components/Fleuron";
import { Masthead } from "@/components/Masthead";
import { ResultsList } from "@/components/ResultsList";
import { SearchBar } from "@/components/SearchBar";
import { runSearch } from "@/lib/search";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

async function Results({ query }: { query: string }) {
  const { hits, backend } = await runSearch(query);
  return <ResultsList query={query} hits={hits} backend={backend} />;
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6 pt-8">
      <div className="skeleton h-10 w-2/3 max-w-md rounded-full" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton h-32 w-full rounded-3xl" />
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();

  return (
    <main className="vignette relative z-10">
      <div className="stagger stagger-1">
        <Masthead />
      </div>
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-10 sm:py-10">
        <div className="stagger stagger-2">
          <SearchBar initialQuery={query} />
        </div>

        {query ? (
          <div key={query} className="stagger stagger-3 pt-12">
            <Suspense fallback={<ResultsSkeleton />}>
              <Results query={query} />
            </Suspense>
          </div>
        ) : (
          <div className="stagger stagger-3">
            <EmptyHero />
          </div>
        )}
      </section>
      <footer className="relative z-10 mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-10">
        <div className="flex items-center justify-center gap-4 text-saffron">
          <span className="hand-rule h-px flex-1" />
          <Fleuron variant="heart" size={16} className="text-brique" />
          <span className="hand-rule h-px flex-1" />
        </div>
        <div className="smallcaps mt-6 flex flex-wrap items-center justify-between gap-4 text-ink-mute">
          <span className="flex items-center gap-2">
            <span className="cooking-dot" aria-hidden />
            TopChef · Gazette culinaire personnelle
          </span>
          <span className="tnum">
            N°001 · © {new Date().getFullYear()}
          </span>
        </div>
        <p className="mt-4 text-center text-xs italic leading-relaxed text-ink-mute/80">
          Composé à Paris · Encre paprika sur papier brioche · Tirage unique
          pour Luc
        </p>
      </footer>
    </main>
  );
}
