'use client'

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
  scale: number,
  minWidth: number = 100,
  minHeight: number = 50,
  onScaleStart?: (id: number) => void,
  onScaleEnd?: (id: number) => void
) {
  const ref = useRef<SVGRectElement | null>(null)

  const onScaleRef = useRef(onScale)
  onScaleRef.current = onScale

  const onScaleStartRef = useRef(onScaleStart)
  onScaleStartRef.current = onScaleStart

  const onScaleEndRef = useRef(onScaleEnd)
  onScaleEndRef.current = onScaleEnd

  const scaleRef = useRef(scale)
  scaleRef.current = scale

  const minWidthRef = useRef(minWidth)
  minWidthRef.current = minWidth

  const minHeightRef = useRef(minHeight)
  minHeightRef.current = minHeight

  useEffect(() => {
    if (!ref.current) return
    if (!isResizable) return

    const el = ref.current

    const interactable = interact(el).resizable({
      edges: { left: true, right: true, top: true, bottom: true },
      modifiers: [
        interact.modifiers.restrictSize({
          min: (() => {
            return {
              width: minWidthRef.current * scaleRef.current,
              height: minHeightRef.current * scaleRef.current,
            }
          }) as any,
        }),
      ],
      listeners: {
        start(event) {
          onScaleStartRef.current?.(id)
        },
        move(event) {
          console.log(scaleRef.current)
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
        end(event) {
          onScaleEndRef.current?.(id)
        },
      },
    })

    return () => interactable.unset()
  }, [id, isResizable])

  return ref
}

export default useScalable
