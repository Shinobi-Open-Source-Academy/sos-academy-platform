/**
 * Centralized Site Data
 *
 * All hard-coded content is extracted here for easy replacement with API calls.
 * When the admin platform is ready, these objects will be replaced with dynamic data.
 */

// ============================================================================
// HERO SECTION DATA
// ============================================================================

export const HERO_DATA = {
  shinobiText: 'Shinobi',
  academyBannerText: 'OPEN SOURCE ACADEMY',
  titleText: 'Open-Source Academy',
  subtitleText: 'Empowering the Next Generation of Open-Source Warriors',
  descriptionText:
    'Learn through practical, collaborative open-source experience. Gain real-world skills and build your portfolio while working on meaningful projects with experienced mentors.',
  joinButtonText: 'Join Our Academy',
  learnMoreButtonText: 'Learn More',
  companiesTitle: 'Our Impact',
  companiesSubtitle: 'Shipping 15,000+ PRs at forward-thinking companies like',

  // Animation settings
  typingSpeed: 150,
  typingStartDelay: 500,
  typingRestartDelay: 5000,
  typingPauseDelay: 2000,
  loadAnimationDelay: 100,

  // URLs
  joinUrl: '/#join',
  learnMoreUrl: '/#about',

  // Animation values
  parallaxMultipliers: {
    dots: 20,
    banner: -5,
    heading: -8,
    subtitle: -5,
    description: -3,
    logo: 10,
  },

  // Scroll marquee
  marqueeSpeed: 25,
  marqueePauseOnHover: true,
  marqueeDirection: 'left' as const,
};

// ============================================================================
// COMMUNITIES DATA
// ============================================================================

export const COMMUNITIES_DATA = {
  heading: {
    title: 'Our Communities',
    description:
      'Join specialized sub-communities based on programming languages and domains, each led by experienced mentors who will guide your open-source journey.',
  },
  weeklyCalls: {
    title: 'Weekly Community Calls',
    description:
      "Each community hosts weekly calls where members discuss their projects, share progress, and get guidance from mentors. It's a great way to stay connected and learn from peers.",
    codeSnippet: `function communityCall() {
  const members = getMembers();
  const projects = getProjects();
  
  // Weekly call setup
  const meeting = new Meeting({
    day: "Thursday",
    time: "19:00 UTC",
    hosts: mentors,
    agenda: [
      "Welcome & Introductions",
      "Project Updates",
      "Code Reviews",
      "Open Discussion",
      "Next Steps & Assignments"
    ]
  });
  
  // Connect members to share knowledge
  members.forEach(member => {
    if (member.hasUpdates) {
      meeting.addPresenter(member);
    }
    
    meeting.addParticipant(member);
  });
  
  return meeting;
}`,
  },
  stats: {
    communitiesCount: '5',
    membersCount: '30',
    mentorsCount: '10',
    projectsCount: '50',
  },
  animation: {
    staggerDelay: 0.15,
    cardAnimationDuration: 0.7,
    hoverTransitionDuration: '0.4s',
    codeScrollDuration: 40,
  },
  style: {
    sectionBg: 'bg-[#070a1d]',
    statsBg: 'bg-[#0c1228]',
    cardBg: 'bg-[#14182f] bg-opacity-70',
    titleColor: 'text-white',
    textColor: 'text-gray-300',
  },
};

export const COMMUNITIES_LIST = [
  {
    id: 'suna',
    name: 'Suna Community',
    language: 'JavaScript',
    icon: 'JS',
    color: 'bg-yellow-500',
    description:
      'Master modern JavaScript and its frameworks while contributing to web-focused open-source projects.',
    codeSnippet: `// Modern JavaScript with async/await
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
}

// Initialize project
const project = new OpenSourceProject("react", 175000, 132);
project.addContributor("shinobi_dev");
project.fetchIssues().then(issues => {
  console.log(\`Found \${issues.length} issues to work on\`);
});`,
  },
  {
    id: 'konoha',
    name: 'Konoha Community',
    language: 'Python',
    icon: 'PY',
    color: 'bg-green-500',
    description:
      'Dive into Python development and contribute to data science, automation, and web backend projects.',
    codeSnippet: `# Python data analysis workflow
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

class DataContribution:
    def __init__(self, dataset_name):
        self.dataset_name = dataset_name
        self.data = None
        self.model = None
        
    def load_data(self, path):
        self.data = pd.read_csv(path)
        print(f"Loaded {len(self.data)} records from {self.dataset_name}")
        return self.data
    
    def preprocess(self):
        # Handle missing values
        self.data.fillna(self.data.mean(), inplace=True)
        
        # Feature engineering
        self.data['log_feature'] = np.log1p(self.data['feature'] + 1)
        return self.data
    
    def train_model(self, target_col):
        X = self.data.drop(target_col, axis=1)
        y = self.data[target_col]
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)
        
        self.model = RandomForestClassifier(n_estimators=100)
        self.model.fit(X_train, y_train)
        
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Model accuracy: {accuracy:.4f}")
        return self.model

# Create contribution
project = DataContribution("open_source_activity")
project.load_data("contributions.csv")
project.preprocess()
project.train_model("is_contributor")`,
  },
  {
    id: 'kiri',
    name: 'Kiri Community',
    language: 'Go',
    icon: 'GO',
    color: 'bg-blue-500',
    description:
      'Build high-performance, concurrent systems and microservices with Go language expertise.',
    codeSnippet: `package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"time"
)

type Repository struct {
	Name        string
	URL         string
	Stars       int
	Contributors int
}

func fetchOpenSourceRepos(ctx context.Context, wg *sync.WaitGroup, results chan<- Repository) {
	defer wg.Done()
	
	// Simulate API call to GitHub
	select {
	case <-time.After(1 * time.Second):
		results <- Repository{
			Name:        "awesome-go",
			URL:         "https://github.com/avelino/awesome-go",
			Stars:       42000,
			Contributors: 156,
		}
		results <- Repository{
			Name:        "gin",
			URL:         "https://github.com/gin-gonic/gin",
			Stars:       35000,
			Contributors: 287,
		}
	case <-ctx.Done():
		fmt.Println("Request canceled")
		return
	}
}

func main() {
	// Create a cancellable context
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	
	// Set up channel for results and wait group for goroutines
	results := make(chan Repository, 10)
	var wg sync.WaitGroup
	
	// Start server in goroutine
	server := &http.Server{Addr: ":8080"}
	go func() {
		log.Println("Starting server on :8080")
		if err := server.ListenAndServe(); err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()
	
	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt)
	
	go func() {
		<-sigChan
		cancel()
		server.Shutdown(ctx)
	}()
	
	// Start worker goroutines
	wg.Add(1)
	go fetchOpenSourceRepos(ctx, &wg, results)
	
	// Process results
	go func() {
		wg.Wait()
		close(results)
	}()
	
	for repo := range results {
		fmt.Printf("Found repo: %s with %d stars and %d contributors\n", 
			repo.Name, repo.Stars, repo.Contributors)
	}
}`,
  },
  {
    id: 'iwa',
    name: 'Iwa Community',
    language: 'Java',
    icon: 'JV',
    color: 'bg-red-500',
    description:
      'Focus on enterprise-grade applications, Android development, and Java-based open-source projects.',
    codeSnippet: `package org.shinobi.opensource;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

public class ContributionTracker {
    private final GithubService githubService;
    private final List<Contributor> contributors = new ArrayList<>();

    public ContributionTracker(GithubService githubService) {
        this.githubService = githubService;
    }

    public CompletableFuture<List<Contribution>> trackContributions(String repository) {
        return CompletableFuture.supplyAsync(() -> {
            System.out.println("Fetching contributions for " + repository);
            
            try {
                List<Contribution> contributions = githubService.getContributions(repository);
                
                // Process using streams
                List<Contribution> validContributions = contributions.stream()
                    .filter(c -> c.getStatus().equals("merged"))
                    .sorted((c1, c2) -> c2.getDate().compareTo(c1.getDate()))
                    .collect(Collectors.toList());
                
                // Notify contributors
                validContributions.forEach(contribution -> {
                    System.out.println("Processing contribution: " + contribution.getId());
                    notifyContributor(contribution.getContributor(), contribution);
                });
                
                return validContributions;
            } catch (Exception e) {
                System.err.println("Error tracking contributions: " + e.getMessage());
                return List.of();
            }
        });
    }

    private void notifyContributor(String contributor, Contribution contribution) {
        contributors.stream()
            .filter(c -> c.getName().equals(contributor))
            .findFirst()
            .ifPresent(c -> c.notify("Your contribution #" + contribution.getId() + " was processed"));
    }

    public void addContributor(Contributor contributor) {
        contributors.add(contributor);
    }
}`,
  },
  {
    id: 'taki',
    name: 'Taki Community',
    language: 'Ruby',
    icon: 'RB',
    color: 'bg-pink-500',
    description:
      'Contribute to elegant, readable codebases and web applications using Ruby and Rails.',
    codeSnippet: `# Ruby on Rails contribution workflow
require 'octokit'
require 'active_support/all'

class OpenSourceContribution
  attr_reader :repo, :user, :issues, :pull_requests

  def initialize(repo, user)
    @repo = repo
    @user = user
    @issues = []
    @pull_requests = []
    @client = Octokit::Client.new(access_token: ENV['GITHUB_TOKEN'])
  end

  def fetch_open_issues
    puts "Fetching open issues for #{repo}..."
    @issues = @client.issues(repo, state: 'open')
                    .select { |issue| issue.pull_request.nil? }
    
    suitable_issues = @issues.select do |issue|
      issue.labels.any? { |label| ['good-first-issue', 'help-wanted'].include?(label.name) }
    end
    
    puts "Found #{suitable_issues.count} suitable issues for new contributors"
    suitable_issues
  end

  def create_pull_request(issue_number, branch_name)
    # Simulate the PR creation process
    puts "Creating pull request for issue ##{issue_number}"
    
    # Fork the repository
    fork = @client.fork(repo)
    puts "Forked #{repo} to #{fork.full_name}"
    
    # Create a branch, make changes, commit, and push (simulated)
    puts "Working on branch #{branch_name}"
    sleep(2) # Simulate work
    
    # Create pull request
    pr = @client.create_pull_request(
      repo,
      'main',
      "#{user}:#{branch_name}",
      "Fix for issue ##{issue_number}",
      "This pull request addresses issue ##{issue_number}"
    )
    
    @pull_requests << pr
    puts "Created pull request ##{pr.number}"
    pr
  end
  
  def contribution_stats
    merged_prs = @client.pull_requests(repo, state: 'closed')
                        .select { |pr| pr.user.login == user && pr.merged_at.present? }
    
    {
      open_issues_count: @issues.count,
      submitted_prs: @pull_requests.count,
      merged_prs: merged_prs.count,
      contribution_streak: calculate_streak(merged_prs)
    }
  end
  
  private
  
  def calculate_streak(merged_prs)
    return 0 if merged_prs.empty?
    
    dates = merged_prs.map { |pr| pr.merged_at.to_date }.sort
    # Calculate the longest streak of consecutive days
    # Implementation left as an exercise
    7 # Placeholder return value
  end
end

# Usage
contribution = OpenSourceContribution.new('rails/rails', 'shinobi_dev')
issues = contribution.fetch_open_issues
contribution.create_pull_request(issues.first.number, 'fix-documentation')
puts contribution.contribution_stats`,
  },
];

// ============================================================================
// MENTORS DATA
// ============================================================================

export const MENTORS_DATA = {
  heading: {
    title: 'Expert Mentors',
    description:
      'Learn from industry professionals with years of experience in their fields. Our mentors are passionate about sharing their knowledge and helping you grow.',
  },
  cta: {
    buttonText: 'Become a Mentor',
  },
};

export const MENTORS_LIST = [
  {
    name: 'Pacifique Linjanja',
    role: 'Senior Backend Engineer',
    image: '/images/mentor3.jpeg',
    bio: "Over 7 years experience in backend development, with a focus on building scalable and maintainable systems. Passionate about mentoring the next generation of engineers. Author of 'Scalable Software Development with NestJS'",
    expertise: [
      'JS',
      'TS',
      'Rust',
      'Microservices',
      'System Design',
      'Software Architecture',
    ],
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
      github: 'https://github.com/mayawilliams',
      linkedin: 'https://linkedin.com/in/mayawilliams',
      website: 'https://davidkatho.com',
    },
  },
  {
    name: '<Missed Ninja />',
    role: 'A Peaceful Kage',
    image: '/images/missedKage.webp',
    bio: 'We are in the process of adding more mentors to the academy. If you are interested in becoming a mentor, please apply with the link below.',
    expertise: ['Teaching', 'Mentoring', 'Coding', 'Team Leading'],
    social: {},
  },
];

// ============================================================================
// FEATURED PROJECTS DATA
// ============================================================================

export const FEATURED_PROJECTS_DATA = {
  heading: {
    title: 'Featured Open-Source Projects',
    description:
      'Explore these high-impact projects where our community members make contributions. Perfect for building your portfolio and gaining real-world experience.',
  },
  cta: {
    buttonText: 'View All Projects',
    buttonUrl: '#',
  },
};

export const FEATURED_PROJECTS_LIST = [
  {
    title: 'Shinobi Internal Project',
    description:
      'A collaborative learning platform being developed by our community members. Join us to contribute to this exciting project and enhance your open-source skills.',
    githubStars: 'Coming Soon',
    contributors: 'Our Community',
    image: '/images/featured-projects/shinobi-internal.jpg',
    tags: ['Community', 'Learning', 'Collaboration'],
    url: '#',
    isInternal: true,
  },
  {
    title: 'Twenty',
    description:
      'Open-source CRM tool that helps businesses manage their customers and leads efficiently. It provides a modern interface with customizable workflows.',
    githubStars: '7.2k',
    contributors: '235',
    image: '/images/featured-projects/twenty.jpeg',
    tags: ['TypeScript', 'React', 'CRM', 'Business'],
    url: 'https://github.com/twentyhq/twenty',
  },
  {
    title: 'Cal.com',
    description:
      'The open-source Calendly alternative. Cal.com is a scheduling infrastructure for teams and individuals that offers customizable booking pages and integrations.',
    githubStars: '23.8k',
    contributors: '489',
    image: '/images/featured-projects/calcom.png',
    tags: ['TypeScript', 'Next.js', 'Scheduling', 'Calendar'],
    url: 'https://github.com/calcom/cal.com',
  },
  {
    title: 'Weaviate TypeScript Client',
    description:
      'The official TypeScript client for Weaviate vector database, making it easy to integrate vector search capabilities into TypeScript and JavaScript applications.',
    githubStars: '1.7k',
    contributors: '42',
    image: '/images/featured-projects/weaviate-ts.png',
    tags: ['TypeScript', 'Vector DB', 'Client Library'],
    url: 'https://github.com/weaviate/typescript-client',
  },
  {
    title: 'Redis Go Client',
    description:
      'High-performance Redis client for Go applications with connection pooling, clustering support, and comprehensive Redis command coverage.',
    githubStars: '4.1k',
    contributors: '89',
    image: '/images/featured-projects/redis-go.avif',
    tags: ['Go', 'Redis', 'Database', 'Client'],
    url: 'https://github.com/redis/go-redis',
  },
];

// ============================================================================
// CODE BACKGROUND DATA
// ============================================================================

export const CODE_SNIPPETS = [
  {
    language: 'TypeScript',
    code: [
      'function calculateScore(prs: number): string {',
      '  // Convert PR count to ninja rank',
      '  if (prs > 500) return "Shinobi Master 🥷";',
      '  if (prs > 100) return "Code Ninja ⚔️";',
      '  return "Apprentice Developer 🌱";',
      '}',
      '',
      'interface Contributor {',
      '  name: string;',
      '  prs: number;',
      '  languages: string[];',
      '}',
      '',
      '// TODO: Implement reputation system',
    ],
    color: '#3178C6',
  },
  {
    language: 'Rust',
    code: [
      'struct Shinobi {',
      '    name: String,',
      '    rank: u32,',
      '    specialities: Vec<String>,',
      '}',
      '',
      'impl Shinobi {',
      '    fn new(name: &str) -> Self {',
      '        println!("Training new shinobi: {}", name);',
      '        Shinobi {',
      '            name: name.to_string(),',
      '            rank: 1,',
      '            specialities: vec![],',
      '        }',
      '    }',
      '',
      '    // Secret technique - memory safe code',
      '}',
    ],
    color: '#DEA584',
  },
  {
    language: 'Go',
    code: [
      'package main',
      '',
      'import "fmt"',
      '',
      'type Contribution struct {',
      '    RepoName string',
      '    PrCount  int',
      '    IsMerged bool',
      '}',
      '',
      'func handleOpenSource(username string) {',
      '    // Gophers make great ninjas',
      '    fmt.Println("Welcome to SOSA,", username)',
      '    // TODO: Track user progress',
      '}',
      '',
      '// Speed is our advantage',
    ],
    color: '#00ADD8',
  },
  {
    language: 'Python',
    code: [
      'def train_shinobi(student_name, path):',
      '    """Train a student in the way of open source."""',
      '    paths = {',
      '        "backend": ["Python", "Django", "FastAPI"],',
      '        "frontend": ["React", "Vue", "Svelte"],',
      '        "data": ["Pandas", "NumPy", "TensorFlow"]',
      '    }',
      '    ',
      '    print(f"{student_name} is learning {path}!")',
      '    # The journey of 1000 PRs begins with a single commit',
      '    return paths.get(path, ["Git", "GitHub"])',
      '',
      '# Ninja-level code incoming',
    ],
    color: '#3776AB',
  },
  {
    language: 'JavaScript',
    code: [
      'const calculateProjectImpact = (stars, forks) => {',
      '  // Complex algorithm to measure project success',
      '  let impact = stars * 0.7 + forks * 0.3;',
      '  console.log(`Project impact score: ${impact.toFixed(2)}`);',
      '  return impact > 100 ? "High impact! 🚀" : "Growing! 📈";',
      '};',
      '',
      '// JavaScript ninjas move silently through the DOM',
      'document.querySelectorAll(".shinobi").forEach(el => {',
      '  el.addEventListener("click", () => alert("⚡️"));',
      '});',
    ],
    color: '#F7DF1E',
  },
  {
    language: 'Solidity',
    code: [
      'pragma solidity ^0.8.0;',
      '',
      'contract ShinobiDAO {',
      '    mapping(address => uint256) public contributions;',
      '    address public sensei;',
      '    ',
      '    event NewContribution(address indexed contributor, uint256 prCount);',
      '    ',
      '    constructor() {',
      '        sensei = msg.sender;',
      '        // Blockchain ninjas are unstoppable',
      '    }',
      '    ',
      '    // TODO: Add governance mechanism',
      '}',
    ],
    color: '#AA6746',
  },
];

// ============================================================================
// FOOTER DATA
// ============================================================================

export const FOOTER_DATA = {
  newsletter: {
    title: 'Stay Updated',
    description:
      'Get the latest updates on new projects, community events, and open-source opportunities.',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
  },
  quickLinks: [
    { href: '/#about', label: 'About Us' },
    { href: '/#communities', label: 'Our Communities' },
    { href: '/#projects', label: 'Projects' },
    { href: '/#mentors', label: 'Our Mentors' },
    { href: '/blog', label: 'Blog' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
  ],
  contact: {
    email: 'info@shinobiopensource.academy',
    discord: 'Join our Discord community for real-time discussions',
    schedule: 'Weekly community calls every Thursday at 7 PM UTC',
  },
  copyright: 'Shinobi Open-Source Academy. All rights reserved.',
};

// ============================================================================
// PAGE CONTENT DATA
// ============================================================================

export const DOCUMENTATION_DATA = {
  title: 'Community Documentation',
  subtitle:
    "Welcome to the Shinobi Open-Source Academy. Here's everything you need to know about our community guidelines and how to get started.",
  codeOfConduct: {
    title: 'Code of Conduct',
    description:
      'The Shinobi Open-Source Academy is committed to providing a welcoming and inspiring community for all. We pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.',
    standards: {
      title: 'Our Standards',
      description:
        'Examples of behavior that contributes to creating a positive environment include:',
      items: [
        'Using welcoming and inclusive language',
        'Being respectful of differing viewpoints and experiences',
        'Gracefully accepting constructive criticism',
        'Focusing on what is best for the community',
        'Showing empathy towards other community members',
        'Helping others learn and grow',
        'Contributing meaningfully to open-source projects',
      ],
    },
    unacceptableBehavior: {
      title: 'Unacceptable Behavior',
      description:
        'The following behaviors are considered harassment and are unacceptable within our community:',
      items: [
        'The use of sexualized language or imagery and unwelcome sexual attention or advances',
        'Trolling, insulting/derogatory comments, and personal or political attacks',
        'Public or private harassment',
        "Publishing others' private information without explicit permission",
        'Other conduct which could reasonably be considered inappropriate in a professional setting',
      ],
    },
    responsibilities: {
      title: 'Community Responsibilities',
      description:
        'Community leaders are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.',
    },
    enforcement: {
      title: 'Enforcement',
      description:
        'Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the community leaders. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances.',
    },
    reminder:
      'This Code of Conduct applies both within project spaces and in public spaces when an individual is representing the project or its community.',
  },
  gettingStarted: {
    title: 'Getting Started',
    newMembers: {
      title: 'For New Members',
      steps: [
        'Join our community by selecting your preferred programming languages',
        'Introduce yourself in the community channels',
        'Explore our featured projects and find one that interests you',
        'Start with "good first issue" labels on projects',
        'Ask questions and seek help from mentors',
        'Contribute regularly and build your portfolio',
      ],
    },
    mentors: {
      title: 'For Mentors',
      steps: [
        'Apply to become a mentor through our application process',
        'Share your expertise and guide new contributors',
        'Review code and provide constructive feedback',
        'Help maintain project quality and standards',
        'Participate in community calls and discussions',
        'Lead by example in open-source best practices',
      ],
    },
  },
  cta: {
    title: 'Ready to Join Our Community?',
    description:
      'Become part of the next generation of open-source warriors and start your journey today.',
    joinButtonText: 'Join Us',
    mentorButtonText: 'Apply as Mentor',
  },
};

export const BLOG_DATA = {
  title: 'Blog',
  subtitle:
    'Stay updated with the latest insights, tutorials, and stories from our community.',
  comingSoon: {
    title: 'Coming Soon',
    description:
      "We're working hard to bring you amazing content about open-source development, community insights, and success stories from our members.",
    whatToExpect: {
      title: 'What to Expect',
      items: [
        'Technical tutorials and guides',
        'Community success stories',
        'Open-source best practices',
        'Industry insights and trends',
        'Mentor spotlights and interviews',
        'Project showcases and case studies',
      ],
    },
  },
  cta: {
    title: 'Stay Updated',
    description:
      'Join our community to be the first to know when we publish new content.',
    joinButtonText: 'Join Us',
    mentorButtonText: 'Apply as Mentor',
  },
};

export const PRIVACY_POLICY_DATA = {
  title: 'Privacy Policy',
  subtitle:
    'Your privacy is important to us. This policy explains how we collect, use, and protect your information.',
  lastUpdated: new Date().toLocaleDateString(),
  sections: {
    informationWeCollect: {
      title: 'Information We Collect',
      description:
        'We collect information you provide directly to us, such as when you:',
      items: [
        'Subscribe to our community',
        'Apply to become a mentor',
        'Contact us for support',
        'Participate in our programs',
      ],
    },
    howWeUse: {
      title: 'How We Use Your Information',
      description: 'We use the information we collect to:',
      items: [
        'Provide and maintain our services',
        'Send you community updates and meeting invitations',
        'Process mentor applications',
        'Improve our platform and services',
        'Communicate with you about your participation',
      ],
    },
    informationSharing: {
      title: 'Information Sharing',
      description:
        'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.',
    },
    dataSecurity: {
      title: 'Data Security',
      description:
        'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
    },
    yourRights: {
      title: 'Your Rights',
      description: 'You have the right to:',
      items: [
        'Access your personal information',
        'Correct inaccurate information',
        'Request deletion of your information',
        'Opt out of communications',
      ],
    },
    contactUs: {
      title: 'Contact Us',
      description:
        'If you have any questions about this Privacy Policy, please contact us at',
      email: 'info@shinobiopensource.academy',
    },
    note: 'This privacy policy may be updated from time to time. We will notify you of any changes by posting the new policy on this page.',
  },
};
