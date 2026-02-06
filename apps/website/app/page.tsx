import { getActiveMentors, getRandomMentors } from '../lib/api-client';
import HomePageClient from '../components/HomePageClient';

export default async function Index() {
  const allMentors = await getActiveMentors();
  const mentors = getRandomMentors(allMentors, 4);

  return <HomePageClient mentors={mentors} />;
}
