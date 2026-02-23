import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud, FileDown, FolderPlus } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface SaveMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveOnline: () => void;
  onSaveFile: () => void;
}

export default function SaveMethodDialog({
  open,
  onOpenChange,
  onSaveOnline,
  onSaveFile,
}: SaveMethodDialogProps) {
  const { data: session } = authClient.useSession();

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
              className="flex justify-start gap-4 h-16"
              variant="outline"
              onClick={() => {
                onSaveOnline();
                onOpenChange(false);
              }}
            >
              <Cloud className="size-7 text-primary" />
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-base">Online speichern</span>
                <span className="text-xs text-muted-foreground">In Ihrem Account online speichern</span>
              </div>
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground rounded bg-muted/50 p-3">
              Melden Sie sich an, um Projekte online zu speichern.
            </div>
          )}

          <Button
            className="flex justify-start gap-4 h-16"
            variant="outline"
            onClick={() => {
              onSaveFile();
              onOpenChange(false);
            }}
          >
            <FolderPlus className="size-7 text-primary" />
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold text-base">Datei speichern</span>
              <span className="text-xs text-muted-foreground">Als JSON-Datei auf Ihrem Gerät speichern</span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
