'use client'

import { useState, useEffect } from 'react'
import AccountInfo from '@/components/AccountInfo'
import ProjectCard from '@/components/ProjectCard'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Project {
  id: string
  title: string
  description: string
  thumbnail?: string
  updatedAt: string
}

function ProjectsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [projectToOpen, setProjectToOpen] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects')
        if (res.ok) {
          const data = await res.json()
          setProjects(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenProject = async (id: string) => {
    const isDirty = localStorage.getItem('conceptify-is-dirty') === 'true'

    if (isDirty) {
      setProjectToOpen(id)
      setIsDialogOpen(true)
      return
    }

    confirmOpenProject(id)
  }

  const confirmOpenProject = async (id: string) => {
    setIsDialogOpen(false)

    toast.promise(
      fetch(`/api/projects?id=${id}`).then(async (res) => {
        if (!res.ok) {
          throw new Error('Fehler beim Laden')
        }
        
        const data = await res.json()

        const projectData = {
          title: data.title,
          description: data.description,
          concepts: data.concepts || [],
          connections: data.connections || [],
        }

        localStorage.setItem('concept-map-data', JSON.stringify(projectData))
        localStorage.setItem('conceptify-cloud-project-id', data.id)
        router.push('/')
      }),
      {
        loading: 'Öffne Projekt...',
        success: 'Projekt geöffnet',
        error: 'Fehler beim Laden des Projekts',
        position: 'bottom-center',
      },
    )
  }

  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return

    setIsDeleteDialogOpen(false)
    const id = projectToDelete
    setProjectToDelete(null)

    toast.promise(
      fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error('Fehler beim Löschen')
        }
        setProjects(prev => prev.filter(p => p.id !== id))
      }),
      {
        loading: 'Lösche Projekt...',
        success: 'Projekt gelöscht',
        error: 'Fehler beim Löschen des Projekts',
        position: 'bottom-center',
      }
    )
  }

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
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  thumbnail={project.thumbnail}
                  onClick={() => handleOpenProject(project.id)}
                  onDelete={(e) => {
                    e.stopPropagation()
                    handleDeleteProject(project.id)
                  }}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ungespeicherte Änderungen</DialogTitle>
            <DialogDescription>
              Sie haben ungespeicherte Änderungen im aktuellen Projekt. Möchten
              Sie diese wirklich verwerfen und das neue Projekt öffnen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => projectToOpen && confirmOpenProject(projectToOpen)}
            >
              Trotzdem öffnen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Projekt löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie dieses Projekt wirklich löschen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProject}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectsPage
