// Shared data constants for the frontend

export const SITE_CONFIG = {
  name: 'SOS Academy',
  fullName: 'Shinobi Open-Source Academy',
  tagline: 'Empowering the Next Generation of Open-Source Warriors',
  description:
    'Learn through practical, collaborative open-source experience. Gain real-world skills and build your portfolio while working on meaningful projects with experienced mentors.',
  email: 'contact@shinobi-open-source.academy',
  urls: {
    github: 'https://github.com/Shinobi-Open-Source-Academy',
    twitter: 'https://x.com/SOSAcademy_',
    linkedin: 'https://www.linkedin.com/company/shinobi-open-source-academy-sos-a/about/',
    discord: 'https://discord.gg/X9PWySkvKM',
  },
};

export const COMMUNITIES = [
  {
    id: 'konoha',
    name: 'Konoha Community',
    language: 'JavaScript',
    icon: 'JS',
    color: '#F7DF1E',
    description:
      'Master modern JavaScript and its frameworks while contributing to web-focused open-source projects.',
    longDescription:
      'The Konoha Community is focused on JavaScript and its ecosystem, including modern frameworks like React, Vue, Angular, and Node.js. We work on a variety of web-focused open-source projects, from frontend applications to backend services.',
    meetingDay: 'Tuesday',
    meetingTime: '19:00 UTC',
    kage: {
      name: 'Pacifique Linjanja',
      role: 'Community Kage',
      image: '/images/mentor1.jpeg',
      bio: 'Leading the Konoha community with expertise in modern JavaScript frameworks and backend development.',
    },
    mentors: ['Pacifique Linjanja'],
    members: 15,
    projects: [
      {
        name: 'Twenty CRM',
        description: 'Contributing to the open-source CRM platform',
        url: 'https://github.com/twentyhq/twenty',
      },
      {
        name: 'Cal.com',
        description: 'Improving scheduling features',
        url: 'https://github.com/calcom/cal.com',
      },
    ],
    nextMeeting: {
      date: '2024-11-19',
      time: '19:00 UTC',
      topic: 'Building scalable React applications with TypeScript',
      agenda: [
        'State management best practices',
        'TypeScript patterns',
        'Performance optimization',
      ],
    },
    isActive: true,
  },
  {
    id: 'suna',
    name: 'Suna Community',
    language: 'Python',
    icon: 'PY',
    color: '#3776AB',
    description:
      'Dive into Python development and contribute to data science, automation, and web backend projects.',
    longDescription:
      'The Suna Community is centered around Python and its extensive ecosystem, covering everything from data science and machine learning to web development with frameworks like Django and FastAPI.',
    meetingDay: 'Thursday',
    meetingTime: '18:00 UTC',
    kage: {
      name: 'David Katho',
      role: 'Community Kage',
      image: '/images/mentor2.jpeg',
      bio: 'Guiding the Suna community in Python development and data science excellence.',
    },
    mentors: ['David Katho'],
    members: 12,
    projects: [
      {
        name: 'Data Pipeline Tools',
        description: 'Building ETL pipelines for data processing',
        url: '#',
      },
      {
        name: 'ML Training Platform',
        description: 'Open-source machine learning training infrastructure',
        url: '#',
      },
    ],
    nextMeeting: {
      date: '2024-11-21',
      time: '18:00 UTC',
      topic: 'Introduction to FastAPI and async Python',
      agenda: [
        'Async/await patterns',
        'Building REST APIs',
        'Database integration with SQLAlchemy',
      ],
    },
    isActive: true,
  },
  {
    id: 'kiri',
    name: 'Kiri Community',
    language: 'Go',
    icon: 'GO',
    color: '#00ADD8',
    description:
      'Build high-performance, concurrent systems and microservices with Go language expertise.',
    meetingDay: 'Wednesday',
    meetingTime: '19:00 UTC',
    isActive: false,
  },
  {
    id: 'iwa',
    name: 'Iwa Community',
    language: 'Java',
    icon: 'JV',
    color: '#E76F00',
    description:
      'Focus on enterprise-grade applications, Android development, and Java-based open-source projects.',
    meetingDay: 'Friday',
    meetingTime: '18:00 UTC',
    isActive: false,
  },
  {
    id: 'taki',
    name: 'Taki Community',
    language: 'Ruby',
    icon: 'RB',
    color: '#CC342D',
    description:
      'Contribute to elegant, readable codebases and web applications using Ruby and Rails.',
    meetingDay: 'Monday',
    meetingTime: '19:00 UTC',
    isActive: false,
  },
  {
    id: 'kumo',
    name: 'Kumo Community',
    language: 'Rust',
    icon: 'RS',
    color: '#DEA584',
    description:
      'Build memory-safe, high-performance systems and contribute to cutting-edge Rust projects.',
    meetingDay: 'Saturday',
    meetingTime: '17:00 UTC',
    isActive: false,
  },
  {
    id: 'ame',
    name: 'Ame Community',
    language: 'PHP',
    icon: 'PHP',
    color: '#777BB4',
    description:
      'Build dynamic web applications and contribute to PHP-based open-source projects and frameworks.',
    longDescription:
      'The Ame Community focuses on PHP development, including modern frameworks like Laravel, Symfony, and WordPress. We work on web applications, APIs, and contribute to popular PHP open-source projects.',
    meetingDay: 'Sunday',
    meetingTime: '18:00 UTC',
    isActive: true,
  },
];

export const MENTORS = [
  {
    id: 'pacifique',
    name: 'Pacifique Linjanja',
    role: 'Senior Backend Engineer',
    image: '/images/mentor1.jpeg',
    bio: "Over 7 years experience in backend development, with a focus on building scalable and maintainable systems. Author of 'Scalable Software Development with NestJS'",
    expertise: ['JavaScript', 'TypeScript', 'Rust', 'Microservices', 'System Design'],
    socials: {
      github: 'https://github.com/pacyL2K19',
      linkedin: 'https://linkedin.com/in/pacifique-linjanja',
      twitter: 'https://x.com/senseiPac_',
      website: 'https://paclinjanja.com',
    },
  },
  {
    id: 'david',
    name: 'David Katho',
    role: 'Senior Protocol Engineer',
    image: '/images/mentor2.jpeg',
    bio: 'Specialist in building and scaling blockchain protocols. Previously led engineering teams at major tech companies.',
    expertise: ['Rust', 'Solidity', 'EVM', 'Blockchain', 'Smart Contracts'],
    socials: {
      github: 'https://github.com/davidkathoh',
      linkedin: 'https://www.linkedin.com/in/davidkathoh/',
      website: 'https://davidkatho.com',
    },
  },
  {
    id: 'didas',
    name: 'Didas Mbarushimana',
    role: 'Software Engineer & Open Source Advocate',
    image: '/images/mentor4.jpeg',
    bio: 'Full-stack software engineer with experience building scalable web applications and integrating AI-powered features using modern technologies such as React, Next.js, TypeScript, and backend services.',
    expertise: ['Javascript', 'Python', 'React'],
    socials: {
      github: 'https://github.com/DidasMba',
      linkedin: 'https://www.linkedin.com/in/didasmbarushimana/',
      // website: 'https://davidkatho.com',
    },
  },
];

export const PROJECTS = [
  {
    id: 'twenty',
    name: 'Twenty',
    description:
      'Open-source CRM tool that helps businesses manage their customers and leads efficiently with customizable workflows.',
    stars: '35.7k',
    contributors: '500+',
    image: '/images/featured-projects/twenty.jpeg',
    tags: ['TypeScript', 'React', 'CRM'],
    url: 'https://github.com/twentyhq/twenty',
  },
  {
    id: 'calcom',
    name: 'Cal.com',
    description:
      'The open-source Calendly alternative. Offers customizable booking pages and integrations for teams and individuals.',
    stars: '38.3k',
    contributors: '800+',
    image: '/images/featured-projects/calcom.png',
    tags: ['TypeScript', 'Next.js', 'Scheduling'],
    url: 'https://github.com/calcom/cal.com',
  },
  {
    id: 'weaviate',
    name: 'Weaviate TypeScript Client',
    description:
      'The official TypeScript client for Weaviate vector database, making it easy to integrate vector search capabilities.',
    stars: '90',
    contributors: '20+',
    image: '/images/featured-projects/weaviate-ts.png',
    tags: ['TypeScript', 'Vector DB'],
    url: 'https://github.com/weaviate/typescript-client',
  },
  {
    id: 'redis',
    name: 'Redis Go Client',
    description:
      'The official Go client for Redis, providing efficient interaction with Redis databases with support for all commands.',
    stars: '21k',
    contributors: '340+',
    image: '/images/featured-projects/redis-go.avif',
    tags: ['Go', 'Redis', 'Database'],
    url: 'https://github.com/redis/go-redis',
  },
];

export const FEATURES = [
  {
    title: 'Training & Skill Development',
    description:
      'In-depth training on contributing to open-source, from finding issues and forking repos to submitting pull requests.',
  },
  {
    title: 'Mentorship & Communities',
    description:
      'Join sub-communities led by experienced mentors who will guide you through the open-source journey.',
  },
  {
    title: 'Real-World Projects',
    description:
      'Work on internal open-source projects with commercial potential and earn rewards for your contributions.',
  },
  {
    title: 'Paid Opportunities',
    description:
      'Get connected with organizations looking for open-source contributors and receive compensation for your work.',
  },
  {
    title: 'Weekly Calls & Podcasts',
    description:
      'Engage in regular community calls and listen to monthly podcasts featuring insights from our mentors.',
  },
  {
    title: 'Inclusive Environment',
    description:
      'A welcoming space for developers of all backgrounds and experience levels to learn and contribute.',
  },
];

export const COMPANIES = [
  { name: 'Cal.com', url: 'https://cal.com/' },
  { name: 'Firefox', url: 'https://www.mozilla.org/firefox/' },
  { name: 'Sourcegraph', url: 'https://sourcegraph.com/' },
  { name: 'DRATA', url: 'https://drata.com/' },
  { name: 'UnionBank', url: 'https://www.unionbankph.com/' },
  { name: 'Twenty', url: 'https://twenty.com/' },
  { name: 'Weaviate', url: 'https://weaviate.io/' },
  { name: 'TRUST Wallet', url: 'https://trustwallet.com/' },
];

export const NAV_LINKS = [
  { name: 'About', href: '#about' },
  { name: 'Communities', href: '#communities' },
  { name: 'Projects', href: '#projects' },
  { name: 'Mentors', href: '/mentors' },
  { name: 'Blog', href: '/blog' },
];
