"use client";

import { useRef, useEffect, useState } from "react";

interface CodeSnippet {
  language: string;
  code: string;
  color: string;
  x: number;
  y: number;
  opacity: number;
  speed: number;
  scale: number;
  rotation: number;
  delay: number;
}

// Code snippets for various programming languages
const codeSnippets = [
  {
    language: "TypeScript",
    code: [
      "function calculateScore(prs: number): string {",
      "  // Convert PR count to ninja rank",
      '  if (prs > 500) return "Shinobi Master 🥷";',
      '  if (prs > 100) return "Code Ninja ⚔️";',
      '  return "Apprentice Developer 🌱";',
      "}",
      "",
      "interface Contributor {",
      "  name: string;",
      "  prs: number;",
      "  languages: string[];",
      "}",
      "",
      "// TODO: Implement reputation system",
    ],
    color: "#3178C6",
  },
  {
    language: "Rust",
    code: [
      "struct Shinobi {",
      "    name: String,",
      "    rank: u32,",
      "    specialities: Vec<String>,",
      "}",
      "",
      "impl Shinobi {",
      "    fn new(name: &str) -> Self {",
      '        println!("Training new shinobi: {}", name);',
      "        Shinobi {",
      "            name: name.to_string(),",
      "            rank: 1,",
      "            specialities: vec![],",
      "        }",
      "    }",
      "",
      "    // Secret technique - memory safe code",
      "}",
    ],
    color: "#DEA584",
  },
  {
    language: "Go",
    code: [
      "package main",
      "",
      'import "fmt"',
      "",
      "type Contribution struct {",
      "    RepoName string",
      "    PrCount  int",
      "    IsMerged bool",
      "}",
      "",
      "func handleOpenSource(username string) {",
      "    // Gophers make great ninjas",
      '    fmt.Println("Welcome to SOSA,", username)',
      "    // TODO: Track user progress",
      "}",
      "",
      "// Speed is our advantage",
    ],
    color: "#00ADD8",
  },
  {
    language: "Python",
    code: [
      'def train_shinobi(student_name, path="backend"):',
      '    """Train a student in the way of open source."""',
      "    paths = {",
      '        "backend": ["Python", "Django", "FastAPI"],',
      '        "frontend": ["React", "Vue", "Svelte"],',
      '        "data": ["Pandas", "NumPy", "TensorFlow"]',
      "    }",
      "    ",
      '    print(f"{student_name} is learning {path}!")',
      "    # The journey of 1000 PRs begins with a single commit",
      '    return paths.get(path, ["Git", "GitHub"])',
      "",
      "# Ninja-level code incoming",
    ],
    color: "#3776AB",
  },
  {
    language: "JavaScript",
    code: [
      "const calculateProjectImpact = (stars, forks) => {",
      "  // Complex algorithm to measure project success",
      "  let impact = stars * 0.7 + forks * 0.3;",
      "  console.log(`Project impact score: ${impact.toFixed(2)}`);",
      '  return impact > 100 ? "High impact! 🚀" : "Growing! 📈";',
      "};",
      "",
      "// JavaScript ninjas move silently through the DOM",
      'document.querySelectorAll(".shinobi").forEach(el => {',
      '  el.addEventListener("click", () => alert("⚡️"));',
      "});",
    ],
    color: "#F7DF1E",
  },
  {
    language: "Solidity",
    code: [
      "pragma solidity ^0.8.0;",
      "",
      "contract ShinobiDAO {",
      "    mapping(address => uint256) public contributions;",
      "    address public sensei;",
      "    ",
      "    event NewContribution(address indexed contributor, uint256 prCount);",
      "    ",
      "    constructor() {",
      "        sensei = msg.sender;",
      "        // Blockchain ninjas are unstoppable",
      "    }",
      "    ",
      "    // TODO: Add governance mechanism",
      "}",
    ],
    color: "#AA6746",
  },
  {
    language: "Elixir",
    code: [
      "defmodule Shinobi.Training do",
      '  @moduledoc """',
      "  Handles concurrent training for ninjas",
      '  """',
      "  ",
      "  def train_concurrently(ninjas) do",
      "    ninjas",
      "    |> Task.async_stream(fn ninja ->",
      '      IO.puts("#{ninja.name} is mastering #{ninja.language}")',
      "      Process.sleep(100) # Lightning fast training",
      "      %{ninja | level: ninja.level + 1}",
      "    end)",
      "    |> Enum.to_list()",
      "  end",
      "end",
    ],
    color: "#4E2A8E",
  },
  {
    language: "C",
    code: [
      "#include <stdio.h>",
      "#include <stdlib.h>",
      "",
      "typedef struct {",
      "    char name[50];",
      "    int contributions;",
      "    float skill_level;",
      "} Shinobi;",
      "",
      "Shinobi* create_shinobi(const char* name) {",
      "    Shinobi* s = (Shinobi*)malloc(sizeof(Shinobi));",
      "    strcpy(s->name, name);",
      "    s->contributions = 0;",
      "    s->skill_level = 1.0;",
      '    printf("Shinobi %s initialized!\\n", name);',
      "    /* TODO: free after use */",
      "    return s;",
      "}",
    ],
    color: "#555555",
  },
  {
    language: "Java",
    code: [
      "public class OpenSourceAcademy {",
      "    private static final Logger logger = LoggerFactory.getLogger(OpenSourceAcademy.class);",
      "    ",
      "    @Autowired",
      "    private ContributorRepository repo;",
      "    ",
      "    public List<ProjectDTO> findProjects(String language) {",
      "        // Enterprise-grade ninja code",
      '        logger.info("Finding projects for {}", language);',
      "        return repo.findByLanguage(language).stream()",
      "            .filter(p -> p.getDifficulty() <= 3)",
      "            .map(this::convertToDTO)",
      "            .collect(Collectors.toList());",
      "    }",
      "}",
    ],
    color: "#B07219",
  },
];

// Helper function for rgba color
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function CodeBackground() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Short delay to allow page transition
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const generateSnippets = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Create random code snippets
      const newSnippets: CodeSnippet[] = [];

      for (let i = 0; i < 15; i++) {
        const snippetData =
          codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        const randomCodeIndex = Math.floor(
          Math.random() * snippetData.code.length
        );
        const randomCode = snippetData.code[randomCodeIndex];

        newSnippets.push({
          language: snippetData.language,
          code: randomCode,
          color: snippetData.color,
          x: Math.random() * containerWidth,
          y: Math.random() * containerHeight,
          opacity: 0.12 + Math.random() * 0.1, // More visible
          speed: 0.18 + Math.random() * 0.22, // Slightly slower for smoother float
          scale: 0.9 + Math.random() * 0.5,
          rotation: -8 + Math.random() * 16,
          delay: Math.random() * 5,
        });
      }

      setSnippets(newSnippets);
    };

    // Generate initial snippets
    generateSnippets();

    // Handle resize
    const handleResize = () => {
      generateSnippets();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
    >
      {snippets.map((snippet, index) => (
        <div
          key={index}
          className="absolute font-mono"
          style={{
            left: `${snippet.x}px`,
            top: `${snippet.y}px`,
            transform: `scale(${snippet.scale}) rotate(${snippet.rotation}deg)`,
            opacity: isVisible ? snippet.opacity : 0,
            color: "white",
            transition: `opacity 1.2s cubic-bezier(0.4,0,0.2,1) ${snippet.delay}s`,
            animation: isVisible
              ? `float ${
                  7.5 + snippet.delay
                }s ease-in-out infinite alternate, pulse-fade 6s ease-in-out infinite alternate`
              : "none",
          }}
        >
          <div className="max-w-xs bg-black/50 rounded p-2 backdrop-blur-sm">
            <div
              className="text-xs font-semibold mb-1"
              style={{ color: snippet.color }}
            >
              {`// ${snippet.language}`}
            </div>
            <div
              className="text-xs whitespace-pre"
              style={{
                textShadow: `0 0 18px ${hexToRgba(
                  snippet.color,
                  0.7
                )}, 0 0 4px #000`,
              }}
            >
              {snippet.code}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
