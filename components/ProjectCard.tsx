import { Button } from './ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'

interface ProjectCardProps {
  title: string
  description: string
  onClick?: () => void
}

function ProjectCard({ title, description, onClick }: ProjectCardProps) {
  return (
    <Card className="relative mx-auto flex h-full w-full max-w-sm flex-col rounded-xs pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <img
        src="https://avatar.vercel.sh/shadcn1"
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
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
