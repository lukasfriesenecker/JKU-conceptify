import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Cloud, FileDown, FolderPlus } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

interface SaveMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveOnline: () => void
  onSaveFile: () => void
}

export default function SaveMethodDialog({
  open,
  onOpenChange,
  onSaveOnline,
  onSaveFile,
}: SaveMethodDialogProps) {
  const { data: session } = authClient.useSession()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Speichermethode wählen</DialogTitle>
          <DialogDescription>
            Bitte wählen Sie, wie Sie Ihr Projekt speichern möchten.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {session ? (
            <Button
              className="flex h-16 justify-start gap-4"
              variant="outline"
              onClick={() => {
                onSaveOnline()
                onOpenChange(false)
              }}
            >
              <Cloud className="text-primary size-7" />
              <div className="flex flex-col items-start text-left">
                <span className="text-base font-semibold">
                  Online speichern
                </span>
                <span className="text-muted-foreground text-xs">
                  In Ihrem Account online speichern
                </span>
              </div>
            </Button>
          ) : (
            <div className="text-muted-foreground bg-muted/50 rounded p-3 text-sm">
              Melden Sie sich an, um Projekte online zu speichern.
            </div>
          )}

          <Button
            className="flex h-16 justify-start gap-4"
            variant="outline"
            onClick={() => {
              onSaveFile()
              onOpenChange(false)
            }}
          >
            <FolderPlus className="text-primary size-7" />
            <div className="flex flex-col items-start text-left">
              <span className="text-base font-semibold">Datei speichern</span>
              <span className="text-muted-foreground text-xs">
                Als JSON-Datei auf Ihrem Gerät speichern
              </span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
