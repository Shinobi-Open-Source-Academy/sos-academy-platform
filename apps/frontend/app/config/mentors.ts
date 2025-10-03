import type { MentorProps } from '../types/mentor';

export const MENTORS: MentorProps[] = [
  {
    name: 'Pacifique Linjanja',
    role: 'Senior Backend Engineer',
    image: '/images/mentor3.jpeg',
    bio: `Over 7 years experience in backend development, with a focus on building scalable and maintainable systems. Passionate about mentoring the next generation of engineers. Author of 'Scalable Software Development with NestJS'`,
    expertise: ['JS', 'TS', 'Rust', 'Microservices', 'System Design', 'Software Architecture'],
    social: {
      github: 'https://github.com/pacyL2K19',
      linkedin: 'https://linkedin.com/in/pacifique-linjanja',
      twitter: 'https://x.com/PacifiqueLinja1',
      website: 'https://paclinjanja.com',
    },
  },
  {
    name: 'David Katho',
    role: 'Senior Protocol Engineer',
    image: '/images/mentor2.jpeg',
    bio: 'Specialist in building and scaling blockchain protocols. Previously led engineering teams at major tech companies.',
    expertise: ['Rust', 'Solidity', 'EVM', 'Blockchain', 'Smart Contracts'],
    social: {
      github: 'https://github.com/davidkathoh',
      linkedin: 'https://www.linkedin.com/in/davidkathoh/',
      twitter: 'https://x.com/davidkathoh',
      website: 'https://davidkathoh.com',
    },
  },
  {
    name: '<Missed Ninja />',
    role: 'A Peaceful Kage',
    image: '/images/missedKage.webp',
    bio: 'We are in the process of adding more mentors to the academy. If you are interested in becoming a mentor, please apply with the link below.',
    expertise: ['Teaching', 'Mentoring', 'Coding', 'Team Leading'],
    social: {
      // github: "https://github.com/",
      // twitter: "https://twitter.com/",
    },
  },
];
