'use client'

import { useState } from 'react'
import AccountInfo from '@/components/AccountInfo'
import ProjectCard from '@/components/ProjectCard'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

const mockProjects = [
  {
    id: 1,
    title: 'Software Architecture',
    description: 'High-level overview of our backend microservices.',
    image: 'https://avatar.vercel.sh/shadcn1',
  },
  {
    id: 2,
    title: 'Database Schema v2',
    description: 'Entity relationships for the new e-commerce feature.',
    image: 'https://avatar.vercel.sh/shadcn2',
  },
  {
    id: 3,
    title: 'User Flow - Onboarding',
    description: 'Visualizing the steps a new user takes during signup.',
    image: 'https://avatar.vercel.sh/shadcn3',
  },
  {
    id: 4,
    title: 'Marketing Campaign Map',
    description: 'Mind map of marketing strategies for Q3.',
    image: 'https://avatar.vercel.sh/shadcn4',
  },
  {
    id: 5,
    title: 'Q4 Roadmap',
    description: 'Strategic planning for the last quarter of the year.',
    image: 'https://avatar.vercel.sh/shadcn5',
  },
  {
    id: 6,
    title: 'API Integrations',
    description: 'Map out flow for third-party API webhooks.',
    image: 'https://avatar.vercel.sh/shadcn6',
  },
  {
    id: 7,
    title: 'Design System',
    description: 'Core UI components and their states.',
    image: 'https://avatar.vercel.sh/shadcn7',
  },
]

function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = mockProjects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-dot-pattern flex h-svh w-full flex-col overflow-hidden">
      <AccountInfo />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pt-26 pb-6 md:px-10">
        <div className="bg-background relative mb-6 w-full shrink-0 md:w-80">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Projekt suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="-mr-2 flex-1 overflow-y-auto pr-2">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card/50 flex flex-col items-center justify-center rounded-xl border border-dashed p-30 text-center">
              <h3 className="mb-2 text-lg font-semibold">
                Keine Projekte gefunden
              </h3>
              <p className="text-muted-foreground mb-6">
                Es konnten keine zum Suchbegriff passenden Projekte gefunden
                werden.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProjectsPage
