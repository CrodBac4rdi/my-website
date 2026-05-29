import { getDiscoverMedia } from "@/lib/tmdb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const provider = searchParams.get('provider') || undefined;
  const genre = searchParams.get('genre') || undefined;

  try {
    const data = await getDiscoverMedia(parseInt(page), provider, genre);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch discover data" }, { status: 500 });
  }
}
