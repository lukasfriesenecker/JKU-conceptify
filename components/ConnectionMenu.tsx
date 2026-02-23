'use client'

import { Pencil, Trash2, X } from 'lucide-react'
import { Button } from './ui/button'

interface ConnectionMenuProps {
  screenX: number
  screenY: number
  connectionId: number
  onDeselect: (id: number) => void
  onDelete: (id: number) => void
  onRename: (id: number) => void
}

function ConnectionMenu({
  screenX,
  screenY,
  connectionId,
  onDeselect,
  onDelete,
  onRename,
}: ConnectionMenuProps) {
  return (
    <div
      className="bg-card animate-in fade-in zoom-in-95 absolute z-50 flex items-center gap-2 rounded-lg border p-1 shadow-xl duration-150"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
      }}
    >
      <div className="flex flex-col">
        <Button
          onClick={() => onRename(connectionId)}
          variant="ghost"
          className="flex justify-start gap-4"
        >
          <Pencil />
          Umbenennen
        </Button>
        <Button
          onClick={() => onDelete(connectionId)}
          variant="ghost"
          className="flex justify-start gap-4"
        >
          <Trash2 />
          Löschen
        </Button>
        <Button
          variant="ghost"
          className="flex justify-start gap-4"
          onClick={() => onDeselect(connectionId)}
        >
          <X />
          Abbrechen
        </Button>
      </div>
    </div>
  )
}

export default ConnectionMenu
