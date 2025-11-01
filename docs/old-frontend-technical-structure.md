# Old Frontend Technical Structure

This document preserves the technical structure, configuration, and implementation details from the old frontend.

**Last Updated:** November 1, 2025

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Next.js Configuration](#nextjs-configuration)
3. [Component Architecture](#component-architecture)
4. [Data Management](#data-management)
5. [Styling & Themes](#styling--themes)
6. [Performance Optimizations](#performance-optimizations)
7. [Community Pages Structure](#community-pages-structure)

---

## Project Structure

```
apps/old-frontend/
├── app/
│   ├── api/
│   │   └── health/
│   ├── blog/
│   ├── communities/
│   │   └── [slug]/
│   ├── components/
│   │   ├── community/
│   │   ├── footer/
│   │   ├── icons/
│   │   └── ui/
│   ├── config/
│   ├── constants/
│   ├── data/
│   ├── documentation/
│   ├── privacy-policy/
│   └── types/
├── lib/
│   ├── hooks/
│   ├── types/
│   └── utils/
└── public/
    └── images/
```

---

## Next.js Configuration

### Key Features
- **Output Mode:** `standalone` (for optimal Docker deployment, reduces bundle size by ~80%)
- **React Strict Mode:** Enabled
- **Compiler Optimizations:**
  - Remove console logs in production (except error & warn)

### Image Optimization
```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 60, // 60 days
}
```

### Webpack Optimizations
```javascript
optimization: {
  moduleIds: 'deterministic',
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        name: 'vendor',
        chunks: 'all',
        test: /node_modules/,
        priority: 20,
      },
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        priority: 10,
        reuseExistingChunk: true,
        enforce: true,
      },
    },
  },
}
```

### Path Aliases
```javascript
resolve: {
  alias: {
    '@': __dirname,
    '@/app': path.resolve(__dirname, 'app'),
  }
}
```

### Headers Configuration
```javascript
headers: [
  // CORS headers
  { key: 'Access-Control-Allow-Credentials', value: 'true' },
  { key: 'Access-Control-Allow-Origin', value: '*' },
  { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },

  // Security headers
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
]
```

### Static Asset Caching
```javascript
{
  source: '/static/:path*',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
  ],
}
```

---

## Component Architecture

### Main Page Components

#### 1. Hero Component
- **Type:** Client Component ('use client')
- **State Management:**
  - isLoaded (boolean)
  - mousePosition ({ x: number, y: number })
  - isSubscriptionModalOpen (boolean)
  - dots (array of animated dot configurations)
- **Features:**
  - Parallax mouse tracking (throttled to 50ms)
  - Animated code background
  - Logo animation
  - Company marquee
  - Modal integration
- **Performance:** Throttled mouse move handler, delayed animations

#### 2. About Component
- **Type:** Client Component
- **Features:**
  - 6 feature cards
  - Icon animations
  - Hover effects
  - Gradient text headings

#### 3. Communities Component
- **Type:** Client Component
- **State:** isInView (Intersection Observer)
- **Features:**
  - Community cards with staggered animations
  - Statistics with CountUp animation
  - Weekly calls information box
  - Code snippet background
- **Animation Delay:** 0.15s per card

#### 4. Mentors Component
- **Type:** Client Component
- **State:** isVisible, isMentorApplicationModalOpen
- **Features:**
  - Mentor cards with social links
  - Intersection Observer for scroll animations
  - Modal integration

#### 5. FeaturedProjects Component
- **Features:**
  - Project cards
  - Tags display
  - External links
  - Image optimization

### Layout Components

#### Navbar
- **Type:** Client Component
- **State:**
  - isMenuOpen
  - isLoaded
  - isScrolled
  - activeLink
  - isSubscriptionModalOpen
- **Features:**
  - Fixed positioning
  - Scroll detection (throttled to 100ms)
  - Active link tracking
  - Mobile responsive menu
  - Smooth transitions

#### Footer
- **Sections:**
  - Newsletter subscription
  - Quick links
  - Contact information
  - Social media links
- **Grid Layout:** Responsive 2-column on desktop

### UI Components

#### Modal Component
- **Props:** isOpen, onClose, title, children
- **Features:**
  - Backdrop click to close
  - Escape key to close
  - Focus trap
  - Animation (scale + opacity)

#### MultiSelect Component
- **Props:** label, placeholder, options, selectedValues, onChange, required, error
- **Features:**
  - Dropdown with search
  - Multiple selection
  - Visual chips for selected items
  - Keyboard navigation

#### CompanyMarquee Component
- **Props:** companies, speed, pauseOnHover, direction
- **Features:**
  - Infinite scroll animation
  - Pause on hover
  - Seamless loop
  - Configurable speed and direction

#### CountUp Component (from react-countup)
- **Usage:** Animated number counting
- **Duration:** 3-4 seconds
- **Separator:** Comma for thousands

---

## Data Management

### Centralized Data Structure
All hard-coded content stored in `app/data/siteData.ts` for easy replacement with API calls.

### Data Objects
1. **HERO_DATA** - Hero section content and animation settings
2. **COMMUNITIES_DATA** - Communities section configuration
3. **COMMUNITIES_LIST** - Array of 5 communities with details
4. **MENTORS_DATA** - Mentors section configuration
5. **MENTORS_LIST** - Array of mentor profiles
6. **FEATURED_PROJECTS_DATA** - Projects section configuration
7. **FEATURED_PROJECTS_LIST** - Array of featured projects
8. **CODE_SNIPPETS** - Code background snippets (6 languages)
9. **FOOTER_DATA** - Footer content
10. **DOCUMENTATION_DATA** - Documentation page content
11. **BLOG_DATA** - Blog page content
12. **PRIVACY_POLICY_DATA** - Privacy policy content

### Configuration Files
1. **communityData.ts** - Extended community details for individual pages
2. **mentors.ts** - Mentor configurations
3. **socialLinks.ts** - Social media links
4. **companies.ts** - Partner companies
5. **about.ts** - About section constants
6. **featured-projects.ts** - Projects data

---

## Styling & Themes

### Tailwind Configuration
```javascript
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
],
theme: {
  extend: {},
},
plugins: [],
```

### PostCSS Configuration
```javascript
plugins: ['@tailwindcss/postcss'],
```

### Global CSS Variables
```css
:root {
  --background: #0a0a0a;
  --foreground: #ededed;
  --navbar-height: /* calculated */
}
```

### Color Scheme
- **Primary:** Custom blue (defined in Tailwind config)
- **Dark Backgrounds:**
  - #070a1d (hero, communities)
  - #0a0a0a (general dark)
  - #0c1228 (stats boxes)
  - #14182f (cards)
- **Light Backgrounds:**
  - White for light sections
  - Gray-50 to Gray-100 for subtle variations

### Typography
- **Font Family:** system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Font Weights:** Light (300), Normal (400), Medium (500), Semibold (600), Bold (700)

---

## Performance Optimizations

### Image Optimization
- Next.js Image component throughout
- AVIF and WebP formats
- Responsive sizes
- Lazy loading
- 60-day cache TTL

### Code Splitting
- Automatic route-based splitting
- Vendor chunk separation
- Common chunk extraction
- Dynamic imports for modals

### Animation Optimization
- **Throttled Event Handlers:**
  - Mouse move: 50ms
  - Scroll: 100ms
- **Passive Event Listeners:**
  - All scroll and mouse move events
- **Intersection Observer:**
  - Lazy trigger animations
  - Threshold: 0.1 (10% visible)

### Bundle Optimization
- Console.log removal in production
- Deterministic module IDs
- Standalone output mode
- Source maps disabled in production

### Rendering Optimization
- Client-side rendering for interactive components
- Server-side rendering for static content
- Proper use of React.memo (where applicable)
- Efficient re-render prevention

---

## Community Pages Structure

### Dynamic Route: `/communities/[slug]`

### Page Components

#### CommunityHeader
- Community name
- Language icon
- Color theme
- Join button

#### CommunityAbout
- Long description
- Code snippet display

#### CommunityLeadership
- Kage (leader)
- Mentors list
- Contact information

#### CommunityMembers
- Member cards
- Contribution levels (genin, chunin, jonin)
- Join date
- Contribution count

#### CommunityProjects
- Project cards
- Technologies used
- Difficulty level
- Status indicator
- Repository links

### Data Structure

```typescript
interface CommunityDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  color: string;
  icon: string;
  codeSnippet: string;
  kage: Mentor;
  mentors: Mentor[];
  members: Member[];
  projects: Project[];
  meetingDay: string;
  meetingTime: string;
  meetingLink: string;
  resourceLinks: ResourceLink[];
  stats: {
    memberCount: number;
    projectCount: number;
    contributionsCount: number;
  };
}
```

### Member Levels
- **Genin:** Entry level (< 20 contributions)
- **Chunin:** Intermediate (20-99 contributions)
- **Jonin:** Advanced (100+ contributions)

### Project Difficulty
- **Beginner:** Good first issues
- **Intermediate:** Some experience required
- **Advanced:** Complex contributions

---

## API Client Implementation

### Class Structure
```typescript
class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api';
    this.defaultTimeout = 10000;
  }

  private async request<T>(endpoint: string, config: RequestConfig): Promise<ApiResponse<T>>;
  async get<T>(endpoint: string, config?: RequestConfig);
  async post<T>(endpoint: string, body?: unknown, config?: RequestConfig);
  async put<T>(endpoint: string, body?: unknown, config?: RequestConfig);
  async delete<T>(endpoint: string, config?: RequestConfig);
}
```

### Error Handling
```typescript
class ApiError extends Error {
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, status: number, details?: Record<string, unknown>);
}
```

### Features
- Automatic timeout handling
- AbortController for request cancellation
- Type-safe responses
- Centralized error handling
- Retry logic (if needed)

---

## Custom Hooks

### useMentorApplication
```typescript
const {
  submitApplication,
  loading,
  error,
  success,
  reset
} = useMentorApplication();
```

### useNewsletterSubscription
```typescript
const {
  subscribe,
  loading,
  error,
  success,
  reset
} = useNewsletterSubscription();
```

### useApi (Generic Hook)
```typescript
const {
  data,
  loading,
  error,
  execute
} = useApi<T>(apiFunction);
```

---

## Validation Utilities

### Validation Rules
```typescript
VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  name: {
    required: true,
    minLength: 2,
    message: 'Name must be at least 2 characters'
  },
  githubHandle: {
    required: false,
    pattern: /^[a-zA-Z0-9-]+$/,
    message: 'Invalid GitHub handle'
  },
  expertise: {
    required: false,
    minLength: 10,
    message: 'Please provide more details'
  },
  motivation: {
    required: false,
    minLength: 20,
    message: 'Please elaborate on your motivation'
  }
}
```

### Helper Functions
- `validateForm(data, rules)` - Validate all fields
- `isValidEmail(email)` - Email validation
- `hasFormErrors(errors)` - Check if errors exist
- `clearFieldError(errors, field)` - Clear specific field error

---

## TypeScript Types

### Community Types
```typescript
interface CommunityDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  color: string;
  icon: string;
  codeSnippet: string;
  kage: Mentor;
  mentors: Mentor[];
  members: Member[];
  projects: Project[];
  meetingDay: string;
  meetingTime: string;
  meetingLink: string;
  resourceLinks: ResourceLink[];
  stats: CommunityStats;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  joinedDate: string;
  level: 'genin' | 'chunin' | 'jonin';
  contributions: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  repoUrl: string;
  demoUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maintainers: string[];
  contributors: string[];
  status: 'active' | 'maintenance' | 'archived';
  startDate: string;
}
```

### Mentor Types
```typescript
interface Mentor {
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
```

### API Types
```typescript
interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  status: number;
  success: boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}
```

---

## Build Configuration

### Development
```bash
next dev -p 3000
```

### Production Build
```bash
NODE_ENV=production next build
```

### Start Production Server
```bash
next start -p 3000
```

### Docker Deployment
- Uses standalone output
- Multi-stage build
- Optimized layer caching
- Production-ready

---

## Environment Variables

### Required
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Optional
- `NODE_ENV` - Environment mode
- `PORT` - Server port (default: 3000)

---

*End of Technical Documentation*
