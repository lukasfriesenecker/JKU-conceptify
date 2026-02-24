import { Button } from './ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Trash2 } from 'lucide-react'

interface ProjectCardProps {
  title: string
  description: string
  thumbnail?: string
  onClick?: () => void
  onDelete?: (e: React.MouseEvent) => void
}

function ProjectCard({ title, description, thumbnail, onClick, onDelete }: ProjectCardProps) {
  return (
    <Card className="relative mx-auto flex h-full w-full max-w-sm flex-col rounded-xs overflow-hidden pt-0 group border-border">
      <img
        src={thumbnail || "https://avatar.vercel.sh/shadcn1"}
        alt="Project thumbnail"
        className="relative z-20 aspect-video w-full object-cover border-b"
      />
      {onDelete && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-2 z-40 size-8"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(e)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Button variant="secondary" className="w-full" onClick={onClick}>
          Projekt öffnen
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProjectCard
