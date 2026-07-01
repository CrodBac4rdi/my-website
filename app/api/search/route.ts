import { searchMedia } from "@/lib/tmdb";
import { NextResponse } from "next/server";
import { checkMemoryRateLimit, ipFromRequest } from "@/lib/rate-limit-memory";

export async function GET(request: Request) {
  const rl = checkMemoryRateLimit(`search:${ipFromRequest(request)}`, 40, 10_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Zu viele Anfragen." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json({ results: [] });

  try {
    const data = await searchMedia(query);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
