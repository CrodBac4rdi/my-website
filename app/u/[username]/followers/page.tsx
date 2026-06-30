import type { Metadata } from 'next';
import FollowListView from '@/components/FollowListView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `Follower von ${username}` };
}

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <FollowListView username={username} mode="followers" />;
}
