import type { Metadata } from 'next';
import FollowListView from '@/components/FollowListView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username} folgt` };
}

export default async function FollowingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <FollowListView username={username} mode="following" />;
}
