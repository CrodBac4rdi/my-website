import { getDiscoverMedia } from "@/lib/tmdb";
import { NextResponse } from "next/server";

const ALLOWED_SORTS = new Set(['popularity.desc', 'vote_average.desc', 'first_air_date.desc']);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const provider = searchParams.get('provider') || undefined;
  const genre = searchParams.get('genre') || undefined;
  const year = searchParams.get('year') || undefined;
  const sortRaw = searchParams.get('sort') || undefined;
  const sort = sortRaw && ALLOWED_SORTS.has(sortRaw) ? sortRaw : undefined;

  try {
    const data = await getDiscoverMedia(parseInt(page), provider, genre, { year, sort });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch discover data" }, { status: 500 });
  }
}
