import type { Metadata } from 'next';
import { getCommunityBySlug } from '../../../lib/api-client';
import CommunityClient from './community-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);

  if (!community) {
    return {
      title: 'Community Not Found',
    };
  }

  return {
    title: `${community.name} Community`,
    description: community.description,
    openGraph: {
      title: `${community.name} Community`,
      description: community.description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${community.name} Community`,
      description: community.description,
    },
  };
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <CommunityClient slug={slug} />;
}
