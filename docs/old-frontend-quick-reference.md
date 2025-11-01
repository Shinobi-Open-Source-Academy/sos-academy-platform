# Old Frontend Quick Reference Guide

Quick reference for rebuilding the frontend with all essential information in one place.

---

## 🎨 Brand Identity

**Name:** Shinobi Open-Source Academy (SOS Academy)
**Tagline:** "Empowering the Next Generation of Open-Source Warriors"
**Logo:** `/shinobiLogo.png`
**Primary Color:** Custom blue (--primary)
**Email:** info@shinobiopensource.academy

---

## 🔗 Important Links

### Social Media
- GitHub: https://github.com/Shinobi-Open-Source-Academy
- Twitter/X: https://x.com/SOSAcademy_
- LinkedIn: https://www.linkedin.com/company/shinobi-open-source-academy-sos-a/about/
- Discord: https://discord.gg/9Wgx7bCh

### External Resources
- Documentation: /documentation
- Blog: /blog (coming soon)
- Privacy Policy: /privacy-policy

---

## 📝 API Endpoints (Backend: localhost:4200/api)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/users/join/community` | POST | Join community (email, name, communities[], githubHandle) |
| `/users/mentor/apply` | POST | Mentor application (email, name, expertise, githubHandle, motivation) |
| `/users/newsletter/subscribe` | POST | Newsletter subscription (email) |

---

## 📊 Key Statistics

- Communities: 5
- Members: 30+
- Mentors: 10
- Projects: 50+
- PRs Shipped: 15,000+

---

## 🏘️ Communities

| Community | Language | Color | Icon | Meeting |
|-----------|----------|-------|------|---------|
| Suna | JavaScript | Yellow | JS | Tuesday 19:00 UTC |
| Konoha | Python | Green | PY | Thursday 18:00 UTC |
| Kiri | Go | Blue | GO | TBD |
| Iwa | Java | Red | JV | TBD |
| Taki | Ruby | Pink | RB | TBD |

---

## 👨‍🏫 Current Mentors

### Pacifique Linjanja
- **Role:** Senior Backend Engineer
- **Expertise:** JS, TS, Rust, Microservices, System Design, Software Architecture
- **GitHub:** pacyL2K19
- **LinkedIn:** pacifique-linjanja
- **Twitter:** @PacifiqueLinja1
- **Website:** paclinjanja.com

### David Katho
- **Role:** Senior Protocol Engineer
- **Expertise:** Rust, Solidity, EVM, Blockchain, Smart Contracts
- **Website:** davidkatho.com

---

## 🚀 Featured Projects

1. **SOS Academy Platform** (Internal) - Community learning platform
2. **Twenty** (35.7k ⭐) - Open-source CRM | TypeScript, React
3. **Cal.com** (38.3k ⭐) - Calendly alternative | TypeScript, Next.js
4. **Weaviate TS Client** (90 ⭐) - Vector DB client | TypeScript
5. **Redis Go Client** (21k ⭐) - Redis client for Go | Go

---

## 🏢 Partner Companies

Cal.com, Firefox, Sourcegraph, DRATA, UnionBank, Twenty, Weaviate, TRUST Wallet

---

## 🎯 Main Navigation Structure

```
Home
  ├── Hero (with CTA + Companies marquee)
  ├── About (6 feature cards)
  ├── Communities (5 communities + stats + weekly calls)
  ├── Featured Projects (5 projects)
  └── Mentors (3 mentors + CTA)

Header Links:
  - About (#about)
  - Communities (#communities)
  - Projects (#projects)
  - Mentors (#mentors)
  - Docs (/documentation)
  - Blog (/blog)

Footer:
  - Newsletter subscription
  - Quick links (6 links)
  - Contact info
  - Social media
```

---

## 📋 Forms

### Join Community Form
- Email* (required)
- Name (optional)
- Communities* (multi-select, required)
- GitHub Handle (optional)

### Mentor Application Form
- Email* (required)
- Name* (required)
- Expertise (textarea, optional)
- GitHub Handle (optional)
- Motivation (textarea, optional)

### Newsletter Form
- Email* (required)

---

## 💡 Six Core Features (About Section)

1. **Training & Skill Development** - Issue finding → PR submission
2. **Mentorship & Communities** - Mentor-led sub-communities
3. **Real-World Projects** - Internal projects with rewards
4. **Paid Opportunities** - Connections to paid OSS work
5. **Weekly Calls & Podcasts** - Community engagement
6. **Inclusive Environment** - Welcoming to all levels

---

## 🎨 Design Tokens

### Colors
- Primary: Custom blue
- Dark BG: #070a1d, #0a0a0a, #0c1228, #14182f
- Light BG: White, Gray-50 to Gray-100
- Text Light: White, Gray-100, Gray-200
- Text Dark: Gray-900, Gray-800, Gray-700

### Spacing Scale
4px, 8px, 16px, 24px, 32px, 48px, 64px

### Animation Timings
- Fast: 200ms
- Normal: 300ms
- Slow: 500ms
- Very Slow: 700ms

### Border Radius
- Small: 4px
- Medium: 8px
- Large: 12px
- XL: 16px

---

## 🎭 Animation Patterns

### Hero Section
- Load animations with 100ms delay
- Parallax mouse tracking (throttled 50ms)
- Typing effect for heading
- Company marquee auto-scroll

### Sections
- Intersection Observer (10% threshold)
- Stagger animations (150ms delay per item)
- Hover: scale-105 + shadow-xl
- Transitions: ease-in-out

### Buttons
- Gradient shimmer effect on hover
- Scale transform (105%)
- Shadow elevation

---

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Grid Patterns
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns (for cards)

---

## 🔒 Important Info Messages

### Join Community
"By joining, you agree to receive community updates and meeting invitations every Monday."

### Mentor Application
"Applications are reviewed manually. We'll get back to you within 3-5 business days."

### Success Messages
- **Join:** "Welcome to the Shinobi Open-Source Academy! You'll receive a confirmation email shortly..."
- **Mentor:** "Your mentor application has been submitted successfully. Our team will review your application and get back to you within 3-5 business days..."
- **Newsletter:** "Thanks for joining! Please check your email for confirmation."

---

## ⚙️ Performance Optimizations Used

1. **Images:**
   - Next.js Image component
   - AVIF/WebP formats
   - Lazy loading
   - 60-day cache

2. **Code Splitting:**
   - Route-based splitting
   - Vendor chunk separation
   - Dynamic imports for modals

3. **Event Handlers:**
   - Mouse move throttled (50ms)
   - Scroll throttled (100ms)
   - Passive listeners

4. **Rendering:**
   - Intersection Observer for animations
   - Proper client/server component split
   - Minimal re-renders

---

## 📦 Key Dependencies

- next: 15.4.7
- react: 19.0.0
- react-dom: 19.0.0
- react-countup: ^6.5.3
- react-icons: ^5.5.0
- tailwindcss: ^4
- @biomejs/biome: ^1.9.4

---

## 🎪 Special Features

### Code Background
Animated code snippets in 6 languages (TypeScript, Rust, Go, Python, JavaScript, Solidity) floating in hero section background.

### Company Marquee
Infinite scroll animation, pause on hover, 25px/s speed, left direction.

### Weekly Calls Box
Dark themed box with live stats, countdown, and next meeting indicator (green pulse).

### Community Code Snippets
Each community has a unique code snippet in their language displayed on community pages.

---

## 🔢 Member Levels

- **Genin** 🌱 - Entry level (< 20 contributions)
- **Chunin** ⚔️ - Intermediate (20-99 contributions)
- **Jonin** 👑 - Advanced (100+ contributions)

---

## 🎯 Call-to-Action Buttons

1. **Primary Hero CTA:** "Join Our Academy" → Opens subscription modal
2. **Secondary Hero CTA:** "Learn More" → Scrolls to #about
3. **Mentors CTA:** "Become a Mentor" → Opens mentor application modal
4. **Footer CTA:** Newsletter subscription

---

## 📖 Content Tone & Voice

- **Friendly & Welcoming:** "Welcome to the Shinobi Open-Source Academy"
- **Empowering:** "Empowering the Next Generation"
- **Action-Oriented:** "Join", "Contribute", "Build", "Learn"
- **Community-Focused:** "Our Community", "Together", "Connect"
- **Professional yet Approachable:** Technical but not intimidating

---

## 🎨 Visual Hierarchy

1. **Hero** - Largest, most prominent, gradient backgrounds
2. **Section Headings** - Large, bold, often with gradients
3. **Card Titles** - Medium, semibold
4. **Body Text** - Normal weight, good line height
5. **Helper Text** - Small, muted color

---

## 💾 Image Assets Location

All images are in `/public/images/`:
- `/images/mentor1.jpeg`, `/images/mentor2.jpeg`, `/images/mentor3.jpeg`
- `/images/missedKage.webp`
- `/images/featured-projects/` (5 project images)
- `/shinobiLogo.png` (root public)

---

## 🔄 Weekly Schedule

- **Community Calls:** Every Thursday at 7 PM UTC
- **Updates:** Every Monday (mentioned in form)
- **Mentor Response Time:** 3-5 business days

---

*This quick reference should help you rebuild the frontend efficiently. Refer to the full content backup and technical structure docs for complete details.*
