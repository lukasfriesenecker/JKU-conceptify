"use client";

import { useEffect, useRef } from 'react'
import interact from 'interactjs'

function useScalable(
  id: number,
  onScale: (
    id: number,
    dx: number,
    dy: number,
    width: string,
    height: string
  ) => void,
  isResizable: boolean,
  scale: number 
) {
  const ref = useRef<SVGRectElement | null>(null)
  const onScaleRef = useRef(onScale)
  onScaleRef.current = onScale
  const scaleRef = useRef(scale)      
  scaleRef.current = scale            

  useEffect(() => {
    if (!ref.current) return
    if (!isResizable) return

    const el = ref.current

    const interactable = interact(el).resizable({
      edges: { left: true, right: true, top: true, bottom: true },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 100, height: 50 },
        }),
      ],
      listeners: {
        move(event) {
          const s = scaleRef.current   
          const target = event.target

          let x = parseFloat(target.getAttribute('x')) || 0
          let y = parseFloat(target.getAttribute('y')) || 0

          const width = event.rect.width / s
          const height = event.rect.height / s

          x += event.deltaRect.left / s
          y += event.deltaRect.top / s

          onScaleRef.current(id, x, y, `${width}px`, `${height}px`)
        },
      },
    })

    return () => interactable.unset()
  }, [id, isResizable])

  return ref
}

export default useScalable