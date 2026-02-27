import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface EmptyCanvasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmptyCanvasDialog({
  open,
  onOpenChange,
}: EmptyCanvasDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Export nicht möglich</DialogTitle>
          <DialogDescription>
            Auf der Zeichenfläche befinden sich keine Konzepte.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
