import { getActiveMentors, getRandomMentors } from '../../lib/api-client';
import MentorsClient from './mentors-client';

export default async function MentorsPage() {
  const allMentors = await getActiveMentors();
  const mentors = getRandomMentors(allMentors, 4);

  return <MentorsClient mentors={mentors} />;
}
