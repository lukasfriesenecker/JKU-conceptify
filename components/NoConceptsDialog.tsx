import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle } from 'lucide-react'

interface NoConceptsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NoConceptsDialog({
  open,
  onOpenChange,
}: NoConceptsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export nicht möglich</DialogTitle>
          <DialogDescription>
            Es konnten keine Concepts zum Exportieren gefunden werden.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="text-muted-foreground bg-muted/50 flex items-center gap-3 rounded p-3 text-sm">
            <AlertCircle className="text-primary size-5 shrink-0" />
            Keine Concepts zum Exportieren gefunden.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}