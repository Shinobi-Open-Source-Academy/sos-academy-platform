import { CommunityDetails } from "../types/community";
import { MENTORS } from "./mentors";

// Extended community data for the individual community pages
export const COMMUNITY_DETAILS: CommunityDetails[] = [
  {
    id: "suna",
    name: "Suna Community",
    slug: "suna",
    description:
      "Master modern JavaScript and its frameworks while contributing to web-focused open-source projects.",
    longDescription: `The Suna Community is focused on JavaScript and its ecosystem, including modern frameworks like React, Vue, Angular, and Node.js. 
    
We work on a variety of web-focused open-source projects, from frontend applications to backend services, helping members grow their skills while making meaningful contributions to the JavaScript ecosystem.

Our mentors are experienced JavaScript developers who guide newcomers through setting up their environment, understanding codebases, making their first contributions, and eventually becoming project maintainers themselves.`,
    color: "bg-yellow-500",
    icon: "JS",
    codeSnippet: `
// Modern JavaScript with async/await
import { fetchRepositories } from './api';

class OpenSourceProject {
  constructor(name, stars, issues) {
    this.name = name;
    this.stars = stars;
    this.issues = issues;
    this.contributors = [];
  }

  addContributor(contributor) {
    this.contributors.push(contributor);
    console.log(\`\${contributor} joined \${this.name}!\`);
    return this;
  }

  async fetchIssues() {
    try {
      const issues = await fetchRepositories(this.name);
      this.issues = issues.filter(issue => !issue.assignee);
      return this.issues;
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    }
  }
}`,
    kage: MENTORS[0], // The leader of the Suna community
    mentors: [MENTORS[0], MENTORS[3]], // All mentors in this community
    members: [
      {
        id: "member-1",
        name: "Taro Yamada",
        avatar: "/members/member1.png",
        role: "Frontend Developer",
        joinedDate: "2023-01-15",
        level: "chunin",
        contributions: 37,
      },
      {
        id: "member-2",
        name: "Lisa Johnson",
        avatar: "/members/member2.png",
        role: "Full Stack Developer",
        joinedDate: "2023-02-22",
        level: "jonin",
        contributions: 124,
      },
      {
        id: "member-3",
        name: "Alex Chen",
        avatar: "/members/member3.png",
        role: "Node.js Developer",
        joinedDate: "2023-03-10",
        level: "genin",
        contributions: 12,
      },
    ],
    projects: [
      {
        id: "project-1",
        name: "React Component Library",
        description:
          "A collection of reusable React components with accessibility built-in",
        technologies: ["React", "TypeScript", "Storybook"],
        repoUrl: "https://github.com/shinobiOpenSource/react-components",
        demoUrl: "https://components.shinobiopensource.academy",
        difficulty: "intermediate",
        maintainers: ["member-2"],
        contributors: ["member-1", "member-3"],
        status: "active",
        startDate: "2023-01-01",
      },
      {
        id: "project-2",
        name: "JavaScript Testing Utils",
        description:
          "Utilities to simplify testing for JavaScript applications",
        technologies: ["JavaScript", "Jest", "Testing Library"],
        repoUrl: "https://github.com/shinobiOpenSource/js-testing-utils",
        difficulty: "beginner",
        maintainers: ["member-2"],
        contributors: ["member-1", "member-3"],
        status: "active",
        startDate: "2023-02-15",
      },
    ],
    meetingDay: "Tuesday",
    meetingTime: "19:00 UTC",
    meetingLink: "https://meet.shinobiopensource.academy/suna",
    resourceLinks: [
      {
        title: "JavaScript Documentation",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        type: "documentation",
      },
      {
        title: "Community Discord",
        url: "https://discord.gg/shinobiopensource",
        type: "discord",
      },
    ],
    stats: {
      memberCount: 35,
      projectCount: 12,
      contributionsCount: 427,
    },
  },
  {
    id: "konoha",
    name: "Konoha Community",
    slug: "konoha",
    description:
      "Dive into Python development and contribute to data science, automation, and web backend projects.",
    longDescription: `The Konoha Community is centered around Python and its extensive ecosystem, covering everything from data science and machine learning to web development with frameworks like Django and FastAPI.
    
We focus on building tools and libraries that make Python development more accessible and efficient, while also contributing to existing open-source Python projects.

Our community is perfect for those interested in data analysis, automation, AI/ML, and backend web development.`,
    color: "bg-green-500",
    icon: "PY",
    codeSnippet: `
# Python data analysis workflow
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

class DataContribution:
    def __init__(self, dataset_name):
        self.dataset_name = dataset_name
        self.data = None
        self.model = None`,
    kage: MENTORS[1], // The leader of the Konoha community
    mentors: [MENTORS[1], MENTORS[4]], // All mentors in this community
    members: [
      {
        id: "member-4",
        name: "Maya Rodriguez",
        avatar: "/members/member4.png",
        role: "Data Scientist",
        joinedDate: "2023-01-05",
        level: "jonin",
        contributions: 89,
      },
      {
        id: "member-5",
        name: "Raj Patel",
        avatar: "/members/member5.png",
        role: "Machine Learning Engineer",
        joinedDate: "2023-02-10",
        level: "chunin",
        contributions: 42,
      },
    ],
    projects: [
      {
        id: "project-3",
        name: "DataNinja",
        description:
          "Data preprocessing utilities for machine learning workflows",
        technologies: ["Python", "Pandas", "NumPy", "Scikit-learn"],
        repoUrl: "https://github.com/shinobiOpenSource/dataninja",
        difficulty: "intermediate",
        maintainers: ["member-4"],
        contributors: ["member-5"],
        status: "active",
        startDate: "2023-01-20",
      },
    ],
    meetingDay: "Thursday",
    meetingTime: "18:00 UTC",
    meetingLink: "https://meet.shinobiopensource.academy/konoha",
    resourceLinks: [
      {
        title: "Python Documentation",
        url: "https://docs.python.org/3/",
        type: "documentation",
      },
      {
        title: "Community Discord",
        url: "https://discord.gg/shinobiopensource",
        type: "discord",
      },
    ],
    stats: {
      memberCount: 42,
      projectCount: 8,
      contributionsCount: 356,
    },
  },
  // Additional communities would be defined here
];

// Helper function to get community by slug
export function getCommunityBySlug(slug: string): CommunityDetails | undefined {
  return COMMUNITY_DETAILS.find((community) => community.slug === slug);
}

// Helper function to get all community slugs (for static paths generation)
export function getAllCommunitySlugs(): string[] {
  return COMMUNITY_DETAILS.map((community) => community.slug);
}
