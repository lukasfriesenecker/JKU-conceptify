"use client";

import { useState } from "react";
import AccountInfo from "@/components/AccountInfo";
import ProjectCard from "@/components/ProjectCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const mockProjects = [
  { id: 1, title: "Software Architecture", description: "High-level overview of our backend microservices.", image: "https://avatar.vercel.sh/shadcn1" },
  { id: 2, title: "Database Schema v2", description: "Entity relationships for the new e-commerce feature.", image: "https://avatar.vercel.sh/shadcn2" },
  { id: 3, title: "User Flow - Onboarding", description: "Visualizing the steps a new user takes during signup.", image: "https://avatar.vercel.sh/shadcn3" },
  { id: 4, title: "Marketing Campaign Map", description: "Mind map of marketing strategies for Q3.", image: "https://avatar.vercel.sh/shadcn4" },
  { id: 5, title: "Q4 Roadmap", description: "Strategic planning for the last quarter of the year.", image: "https://avatar.vercel.sh/shadcn5" },
  { id: 6, title: "API Integrations", description: "Map out flow for third-party API webhooks.", image: "https://avatar.vercel.sh/shadcn6" },
  { id: 7, title: "Design System", description: "Core UI components and their states.", image: "https://avatar.vercel.sh/shadcn7" },
];

function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = mockProjects.filter((project) => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-svh w-full flex-col bg-dot-pattern overflow-hidden">
      <AccountInfo />
      
      <main className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-6 pt-26 pb-6 md:px-10">
        <div className="mb-6 w-full md:w-80 relative bg-background shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Projekt suchen..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id}
                  title={project.title}
                  description={project.description}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-30 text-center bg-card/50 rounded-xl border border-dashed">
              <h3 className="text-lg font-semibold mb-2">Keine Projekte gefunden</h3>
              <p className="text-muted-foreground mb-6">Es konnten keine zum Suchbegriff passenden Projekte gefunden werden.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProjectsPage;
