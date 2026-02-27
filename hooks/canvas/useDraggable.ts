'use client'

import interact from 'interactjs'
import { useEffect, useRef } from 'react'

function useDraggable(
  id: number,
  scale: number,
  onDrag: (id: number, dx: number, dy: number) => void,
  onDragStart?: (id: number) => void,
  onDragEnd?: (id: number) => void
) {
  const ref = useRef<SVGGElement | null>(null)

  const scaleRef = useRef(scale)
  scaleRef.current = scale

  const onDragRef = useRef(onDrag)
  onDragRef.current = onDrag

  const onDragStartRef = useRef(onDragStart)
  onDragStartRef.current = onDragStart

  const onDragEndRef = useRef(onDragEnd)
  onDragEndRef.current = onDragEnd

  useEffect(() => {
    if (!ref.current) return

    const interactable = interact(ref.current).draggable({
      ignoreFrom: '.fill-ring',
      listeners: {
        start() {
          onDragStartRef.current?.(id)
        },
        move(event) {
          onDragRef.current(
            id,
            event.dx / scaleRef.current,
            event.dy / scaleRef.current
          )
        },
        end() {
          onDragEndRef.current?.(id)
        },
      },
    })

    return () => {
      interactable.unset()
    }
  }, [id])

  return ref
}

export default useDraggable
