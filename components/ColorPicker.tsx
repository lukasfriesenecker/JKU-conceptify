'use client'

import { useState } from 'react'
import { SketchPicker } from 'react-color'
import type { IConcept } from '../types/Concept'
import { X } from 'lucide-react'
interface IProps {
  concept: IConcept
  viewport: { x: number; y: number; scale: number }
  onColorChange: (id: number, color: any, type: string) => void
  onClose: (id: number) => void
  target: string
}
function ColorPicker({
  concept,
  viewport,
  onColorChange,
  onClose,
  target,
}: IProps) {
  const [background, setBackground] = useState('#fff')
  const screenX = concept.x * viewport.scale + viewport.x
  const screenY = concept.y * viewport.scale + viewport.y

  const height = parseFloat(concept.height) * viewport.scale

  const handleChangeComplete = (color: any) => {
    setBackground(color)
    onColorChange(concept.id, color, target)
  }

  return (
    <div
      className="bg-card animate-in fade-in zoom-in-95 absolute z-50 rounded-lg border p-1 shadow-xl duration-150"
      style={{
        left: `${screenX}px`,
        top: `${screenY + height + 10}px`,
        transform: 'scale(1.5)',
        transformOrigin: 'top left',
      }}
    >
      <button
        className="hover:bg-muted top-2 right-2 cursor-pointer rounded p-1 transition-colors"
        aria-label="Close color picker"
        onClick={() => onClose(concept.id)}
      >
        <X size={16} />
      </button>

      <SketchPicker
        disableAlpha
        color={background}
        onChangeComplete={handleChangeComplete}
      />
    </div>
  )
}

export default ColorPicker
