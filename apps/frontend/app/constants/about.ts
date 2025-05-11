export const ABOUT_CONSTANTS = {
  HEADING: {
    TITLE_LINE_1: "Bring your backlog.",
    TITLE_LINE_2: "We'll handle the rest.",
    DESCRIPTION:
      "Our mission is to train, empower, and nurture a community of developers who not only contribute to open-source projects but also lead and innovate within it.",
  },
  ANIMATION: {
    CARD_HOVER_TRANSLATE: "-5px",
    STAGGER_DELAY: 0.1, // seconds between each card animation
    CARD_ANIMATION_DURATION: 0.6, // seconds
    ICON_PULSE_DURATION: 3, // seconds
  },
  STYLE: {
    SECTION_BG: "bg-white dark:bg-gray-900",
    CARD_BG: "bg-white dark:bg-gray-800",
    PRIMARY_COLOR: "text-primary",
    ICON_BG: "bg-primary/15",
    ICON_COLOR: "text-primary",
    ICON_HOVER_BG: "bg-primary/30",
    ICON_HOVER_GLOW: "filter drop-shadow(0 0 8px rgba(48,79,254,0.5))",
    TEXT_COLOR: "text-gray-600 dark:text-gray-400",
    HEADING_COLOR:
      "bg-gradient-to-r from-primary to-gray-800 dark:from-primary dark:to-gray-400 bg-clip-text text-transparent",
  },
};

export type FeatureCard = {
  id: string;
  title: string;
  description: string;
  icon: string; // SVG path
};

export const FEATURE_CARDS: FeatureCard[] = [
  {
    id: "training",
    title: "Training & Skill Development",
    description:
      "In-depth training on contributing to open-source, from finding issues and forking repos to submitting pull requests.",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    id: "mentorship",
    title: "Mentorship & Communities",
    description:
      "Join sub-communities led by experienced mentors who will guide you through the open-source journey.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    id: "projects",
    title: "Real-World Projects",
    description:
      "Work on internal open-source projects with commercial potential and earn rewards for your contributions.",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  },
  {
    id: "paid",
    title: "Paid Opportunities",
    description:
      "Get connected with organizations looking for open-source contributors and receive compensation for your work.",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "podcasts",
    title: "Weekly Calls & Podcasts",
    description:
      "Engage in regular community calls and listen to monthly podcasts featuring insights from our mentors.",
    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  },
  {
    id: "inclusive",
    title: "Inclusive Environment",
    description:
      "A welcoming space for developers of all backgrounds and experience levels to learn and contribute.",
    icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
];
