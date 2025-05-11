export const COMMUNITIES_CONSTANTS = {
  HEADING: {
    TITLE: "Our Communities",
    DESCRIPTION:
      "Join specialized sub-communities based on programming languages and domains, each led by experienced mentors who will guide your open-source journey.",
  },
  WEEKLY_CALLS: {
    TITLE: "Weekly Community Calls",
    DESCRIPTION:
      "Each community hosts weekly calls where members discuss their projects, share progress, and get guidance from mentors. It's a great way to stay connected and learn from peers.",
    CODE_SNIPPET: `function communityCall() {
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
}`
  },
  STATS: {
    COMMUNITIES_COUNT: "5",
    MEMBERS_COUNT: "30+",
    MENTORS_COUNT: "10",
    PROJECTS_COUNT: "50+",
  },
  ANIMATION: {
    STAGGER_DELAY: 0.15, // seconds between each card animation
    CARD_ANIMATION_DURATION: 0.7, // seconds
    HOVER_TRANSITION_DURATION: "0.4s",
    CODE_SCROLL_DURATION: 40, // seconds
  },
  STYLE: {
    SECTION_BG: "bg-[#070a1d]",
    STATS_BG: "bg-[#0c1228]",
    CARD_BG: "bg-[#14182f] bg-opacity-70",
    TITLE_COLOR: "text-white",
    TEXT_COLOR: "text-gray-300",
  },
};

export type Community = {
  id: string;
  name: string;
  language: string;
  icon: string;
  color: string;
  description: string;
  codeSnippet: string;
};

export const COMMUNITIES: Community[] = [
  {
    id: "suna",
    name: "Suna Community",
    language: "JavaScript",
    icon: "JS",
    color: "bg-yellow-500",
    description:
      "Master modern JavaScript and its frameworks while contributing to web-focused open-source projects.",
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
}

// Initialize project
const project = new OpenSourceProject("react", 175000, 132);
project.addContributor("shinobi_dev");
project.fetchIssues().then(issues => {
  console.log(\`Found \${issues.length} issues to work on\`);
});
`,
  },
  {
    id: "konoha",
    name: "Konoha Community",
    language: "Python",
    icon: "PY",
    color: "bg-green-500",
    description:
      "Dive into Python development and contribute to data science, automation, and web backend projects.",
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
project.train_model("is_contributor")
`,
  },
  {
    id: "kiri",
    name: "Kiri Community",
    language: "Go",
    icon: "GO",
    color: "bg-blue-500",
    description:
      "Build high-performance, concurrent systems and microservices with Go language expertise.",
    codeSnippet: `
package main

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
}
`,
  },
  {
    id: "iwa",
    name: "Iwa Community",
    language: "Java",
    icon: "JV",
    color: "bg-red-500",
    description:
      "Focus on enterprise-grade applications, Android development, and Java-based open-source projects.",
    codeSnippet: `
package org.shinobi.opensource;

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
}
`,
  },
  {
    id: "taki",
    name: "Taki Community",
    language: "Ruby",
    icon: "RB",
    color: "bg-pink-500",
    description:
      "Contribute to elegant, readable codebases and web applications using Ruby and Rails.",
    codeSnippet: `
# Ruby on Rails contribution workflow
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
puts contribution.contribution_stats
`,
  },
];
