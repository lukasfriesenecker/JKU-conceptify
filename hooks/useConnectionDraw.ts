'use client'

import { useRef, useState } from 'react'
import type { IConnection, EndpointType } from '@/types/Connection'

interface UseConnectionDrawProps {
  svgRef: React.RefObject<SVGSVGElement | null>
  setConnections: React.Dispatch<React.SetStateAction<IConnection[]>>
  toCanvasCoordinates: (
    localX: number,
    localY: number
  ) => { x: number; y: number }
}

function useConnectionDraw({
  svgRef,
  setConnections,
  toCanvasCoordinates,
}: UseConnectionDrawProps) {
  const [activePointerConnections, setActivePointerConnections] = useState<
    Record<
      number,
      {
        fromId: number
        fromType: EndpointType
        startX: number
        startY: number
        currentX: number
        currentY: number
      }
    >
  >({})
  const isDrawingRef = useRef(false)
  const handleStartConnection = (
    fromId: number,
    event: React.PointerEvent,
    fromType: EndpointType = 'concept'
  ) => {
    ;(event.target as Element).setPointerCapture(event.pointerId)

    const svgRect = svgRef.current?.getBoundingClientRect()
    if (!svgRect) return

    const { x, y } = toCanvasCoordinates(
      event.clientX - svgRect.left,
      event.clientY - svgRect.top
    )

    setActivePointerConnections((prev) => ({
      ...prev,
      [event.pointerId]: {
        fromId,
        fromType,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      },
    }))

    isDrawingRef.current = true
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!activePointerConnections[event.pointerId]) return

    const svgRect = svgRef.current?.getBoundingClientRect()
    if (!svgRect) return

    const { x, y } = toCanvasCoordinates(
      event.clientX - svgRect.left,
      event.clientY - svgRect.top
    )

    setActivePointerConnections((prev) => ({
      ...prev,
      [event.pointerId]: { ...prev[event.pointerId], currentX: x, currentY: y },
    }))
  }

  const handleGlobalPointerUp = (event: React.PointerEvent) => {
    const pending = activePointerConnections[event.pointerId]
    if (!pending) return

    const elementAtPoint = document.elementFromPoint(
      event.clientX,
      event.clientY
    )

    const conceptElement = elementAtPoint?.closest('g[data-concept-id]')
    const toId = conceptElement
      ? parseInt(conceptElement.getAttribute('data-concept-id') || '')
      : null

    if (toId !== null) {
      if (pending.fromType === 'connection') {
        setConnections((prev) =>
          prev.map((conn) => {
            if (conn.id === pending.fromId) {
              const existing = conn.extraTargets ?? []
              if (
                toId !== conn.from &&
                toId !== conn.to &&
                !existing.includes(toId)
              ) {
                return { ...conn, extraTargets: [...existing, toId] }
              }
            }
            return conn
          })
        )
      } else if (pending.fromId !== toId) {
        setConnections((prev) => {
          const nextId =
            prev.length > 0 ? Math.max(...prev.map((c) => c.id)) + 1 : 0
          const newConnection: IConnection = {
            id: nextId,
            label: 'Neue Verbindung',
            from: pending.fromId,
            to: toId,
            width: '90',
          }
          return [...prev, newConnection]
        })
      }
    }

    setActivePointerConnections((prev) => {
      const next = { ...prev }

      delete next[event.pointerId]

      return next
    })

    setTimeout(() => {
      isDrawingRef.current = false
    }, 0)
  }

  return {
    activePointerConnections,
    isDrawingRef,
    handleStartConnection,
    handlePointerMove,
    handleGlobalPointerUp,
  }
}

export default useConnectionDraw
