import { NextRequest, NextResponse } from "next/server";
import { runSearch } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }
  try {
    const result = await runSearch(query);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/search]", err);
    return NextResponse.json(
      { error: "La recherche a échoué." },
      { status: 500 },
    );
  }
}
