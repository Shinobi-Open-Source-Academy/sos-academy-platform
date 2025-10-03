export const HERO_CONFIG = {
  // Animation timings
  TYPING_SPEED: 150, // milliseconds per character
  TYPING_START_DELAY: 500, // delay before typing starts
  TYPING_RESTART_DELAY: 5000, // ms to wait after typing completes
  TYPING_PAUSE_DELAY: 2000, // ms to wait before restarting typing
  LOAD_ANIMATION_DELAY: 100, // ms delay for initial animations

  // Text content
  SHINOBI_TEXT: 'Shinobi',
  ACADEMY_BANNER_TEXT: 'OPEN SOURCE ACADEMY',
  TITLE_TEXT: 'Open-Source Academy',
  SUBTITLE_TEXT: 'Empowering the Next Generation of Open-Source Warriors',
  DESCRIPTION_TEXT:
    'Learn through practical, collaborative open-source experience. Gain real-world skills and build your portfolio while working on meaningful projects with experienced mentors.',

  // Button text
  JOIN_BUTTON_TEXT: 'Join Our Academy',
  LEARN_MORE_BUTTON_TEXT: 'Learn More',

  // URLs
  JOIN_URL: '/#join',
  LEARN_MORE_URL: '/#about',

  // Companies section
  COMPANIES_TITLE: 'Our Impact',
  COMPANIES_SUBTITLE: 'Shipping 15,000+ PRs at forward-thinking companies like',

  // Animation values
  PARALLAX_MULTIPLIERS: {
    DOTS: 20,
    BANNER: -5,
    HEADING: -8,
    SUBTITLE: -5,
    DESCRIPTION: -3,
    LOGO: 10,
  },

  // Scroll marquee
  MARQUEE_SPEED: 25, // seconds for one full scroll cycle
  MARQUEE_PAUSE_ON_HOVER: true,
  MARQUEE_DIRECTION: 'left' as const,
};
