import Footer from '@/app/components/Footer';
import Navbar from '@/app/components/Navbar';
import CommunityAbout from '@/app/components/community/CommunityAbout';
import CommunityHeader from '@/app/components/community/CommunityHeader';
import CommunityLeadership from '@/app/components/community/CommunityLeadership';
import CommunityMembers from '@/app/components/community/CommunityMembers';
import CommunityProjects from '@/app/components/community/CommunityProjects';
import { getAllCommunitySlugs, getCommunityBySlug } from '@/app/config/communityData';
import { COMMUNITIES_DATA } from '@/app/data/siteData';
import { notFound } from 'next/navigation';

// Generate static paths for all community pages
export async function generateStaticParams() {
  const slugs = getAllCommunitySlugs();

  return slugs.map((slug) => ({
    slug,
  }));
}

// Setup metadata for each community page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);

  if (!community) {
    return {
      title: 'Community Not Found',
      description: "The community you're looking for doesn't exist",
    };
  }

  return {
    title: `${community.name} | Shinobi Open-Source Academy`,
    description: community.description,
  };
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);

  if (!community) {
    notFound();
  }

  return (
    <main className={COMMUNITIES_DATA.style.sectionBg}>
      <Navbar />

      <CommunityHeader community={community} />

      <div className="container mx-auto px-6">
        <div className="h-px w-full bg-gray-800/70" />
      </div>

      <CommunityAbout community={community} />

      <div className="container mx-auto px-6">
        <div className="h-px w-full bg-gray-800/70" />
      </div>

      <CommunityLeadership community={community} />

      <div className="container mx-auto px-6">
        <div className="h-px w-full bg-gray-800/70" />
      </div>

      <CommunityProjects community={community} />

      <div className="container mx-auto px-6">
        <div className="h-px w-full bg-gray-800/70" />
      </div>

      <CommunityMembers community={community} />

      <Footer />
    </main>
  );
}
