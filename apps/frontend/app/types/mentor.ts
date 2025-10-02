export interface MentorProps {
  name: string;
  role: string;
  image: string;
  bio: string;
  expertise: string[];
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}
