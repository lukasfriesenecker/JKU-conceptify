'use client'

import { useLayoutEffect, useRef, useState } from 'react'

interface ConnectionProps {
  id: number
  label: string
  from: {
    x: number
    y: number
    type?: 'concept' | 'connection'
  }
  to: {
    x: number
    y: number
    type?: 'concept' | 'connection'
  }
  onLabelChange: (id: number, textWidth: string, type: string) => void
  width: string
  caretPosition?: number
  onCaretClick?: (id: number, position: number) => void
  onStartConnection?: (
    fromId: number,
    event: React.PointerEvent<Element>
  ) => void
  extraTargetPositions?: { x: number; y: number }[]
  isSelected?: boolean
  hideConnectionPoints?: boolean
}

function Connection({
  id,
  label,
  from,
  to,
  onLabelChange,
  width,
  caretPosition,
  onCaretClick,
  onStartConnection,
  extraTargetPositions,
  isSelected,
  hideConnectionPoints,
}: ConnectionProps) {
  const x = (from.x + to.x) / 2
  const y = (from.y + to.y) / 2
  const height = '30'
  const paddingLeft = hideConnectionPoints ? 7 : 37
  const paddingRight = 7
  const rectWidth = parseFloat(width) + paddingLeft + paddingRight
  const rectHeight = parseFloat(height) + 4
  const rectLeft = x - rectWidth / 2
  const rectTop = y - rectHeight / 2
  const textRef = useRef<SVGTextElement | null>(null)
  const tspanRefs = useRef<(SVGTSpanElement | null)[]>([])
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null
  )

  useLayoutEffect(() => {
    if (!textRef.current) return

    const bbox = textRef.current.getBBox()
    const textWidth = Math.max(0, bbox.width)

    onLabelChange(id, `${textWidth}px`, 'connection')
  }, [label, id, onLabelChange])

  useLayoutEffect(() => {
    if (caretPosition === undefined || caretPosition === null) {
      setCursorPos(null)
      return
    }

    if (!textRef.current) {
      setCursorPos(null)
      return
    }

    const lines = label.split('\n')
    let remaining = caretPosition
    let lineIndex = 0

    for (let i = 0; i < lines.length; i++) {
      if (remaining <= lines[i].length) {
        lineIndex = i
        break
      }

      remaining -= lines[i].length + 1
      lineIndex = Math.min(i + 1, lines.length - 1)
    }

    const charOffset = Math.max(
      0,
      Math.min(remaining, (lines[lineIndex] || '').length)
    )

    const tspan = tspanRefs.current[lineIndex]
    if (!tspan) {
      setCursorPos(null)
      return
    }

    const tspanBBox = tspan.getBBox()
    let cursorX = tspanBBox.x

    if (charOffset > 0) {
      try {
        const endPos = tspan.getEndPositionOfChar(charOffset - 1)
        cursorX = endPos.x
      } catch {
        try {
          cursorX = tspanBBox.x + tspan.getSubStringLength(0, charOffset)
        } catch {
          cursorX = tspanBBox.x
        }
      }
    }

    setCursorPos({ x: cursorX, y: tspanBBox.y })
  }, [caretPosition, label, x, y])

  const handleTextClick = (e: React.MouseEvent<SVGTextElement>) => {
    if (caretPosition === undefined || !onCaretClick || !textRef.current) return
    e.stopPropagation()

    const svg = textRef.current.ownerSVGElement
    if (!svg) return

    const point = svg.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY

    const svgPoint = point.matrixTransform(
      textRef.current.getScreenCTM()?.inverse()
    )

    const lines = label.split('\n')
    let bestLine = 0
    let bestDist = Infinity

    for (let i = 0; i < lines.length; i++) {
      const tspan = tspanRefs.current[i]
      if (!tspan) continue

      const bbox = tspan.getBBox()
      const centerY = bbox.y + bbox.height / 2
      const dist = Math.abs(svgPoint.y - centerY)

      if (dist < bestDist) {
        bestDist = dist
        bestLine = i
      }
    }

    const tspan = tspanRefs.current[bestLine]
    let charIndex = 0

    if (tspan) {
      const lineLen = lines[bestLine].length
      try {
        const charNum = tspan.getCharNumAtPosition(svgPoint)

        if (charNum >= 0) {
          const charStart =
            charNum === 0
              ? tspan.getBBox().x
              : tspan.getEndPositionOfChar(charNum - 1).x
          const charEnd = tspan.getEndPositionOfChar(charNum).x
          const charMid = (charStart + charEnd) / 2
          charIndex = svgPoint.x > charMid ? charNum + 1 : charNum
        } else {
          charIndex = lineLen
        }
      } catch {
        charIndex = lineLen
      }
    }

    let globalPos = 0

    for (let i = 0; i < bestLine; i++) {
      globalPos += lines[i].length + 1
    }

    globalPos += charIndex

    onCaretClick(id, globalPos)
  }

  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        className="stroke-card-foreground stroke-1"
        data-is-main-line="true"
        markerEnd="url(#arrow)"
      />

      {extraTargetPositions?.map((target, i) => (
        <line
          key={`extra-${i}`}
          x1={x}
          y1={y}
          x2={target.x}
          y2={target.y}
          className="stroke-card-foreground stroke-1"
          data-is-extra-line="true"
          data-extra-index={i}
          markerEnd="url(#arrow)"
        />
      ))}

      <g>
        <rect
          x={rectLeft}
          y={rectTop}
          width={rectWidth}
          height={rectHeight}
          rx="17"
          ry="17"
          className={`fill-card stroke-1 ${isSelected ? 'stroke-primary' : 'stroke-border'}`}
          data-export-type="connection-rect"
          data-hide-points={hideConnectionPoints ? 'true' : 'false'}
          data-export-x1-shift={
            !from.type || from.type === 'concept' ? 'true' : 'false'
          }
          data-export-x2-shift={
            !to.type || to.type === 'concept' ? 'true' : 'false'
          }
        />

        <circle
          cx={rectLeft + 17}
          cy={y}
          r={12}
          className="fill-ring cursor-pointer"
          style={{ display: hideConnectionPoints ? 'none' : undefined }}
          onPointerDown={(e) => {
            e.stopPropagation()
            if (onStartConnection) {
              onStartConnection(id, e)
            }
          }}
        />

        <text
          ref={textRef}
          x={rectLeft + paddingLeft}
          y={y}
          textAnchor="start"
          dominantBaseline="middle"
          className="fill-card-foreground text-xs font-medium select-none"
          style={{ cursor: caretPosition !== undefined ? 'text' : undefined }}
          onClick={handleTextClick}
          xmlSpace="preserve"
          data-export-type="connection-text"
          data-hide-points={hideConnectionPoints ? 'true' : 'false'}
          data-export-x1-shift={
            !from.type || from.type === 'concept' ? 'true' : 'false'
          }
          data-export-x2-shift={
            !to.type || to.type === 'concept' ? 'true' : 'false'
          }
        >
          {label.split('\n').map((line, i) => (
            <tspan
              key={i}
              ref={(el) => {
                tspanRefs.current[i] = el
              }}
              x={rectLeft + paddingLeft}
              dy={i === 0 ? 0 : '1.2em'}
              data-export-type="connection-text"
              data-hide-points={hideConnectionPoints ? 'true' : 'false'}
              data-export-x1-shift={
                !from.type || from.type === 'concept' ? 'true' : 'false'
              }
              data-export-x2-shift={
                !to.type || to.type === 'concept' ? 'true' : 'false'
              }
            >
              {line || ' '}
            </tspan>
          ))}
        </text>

        {cursorPos && (
          <rect
            key={`${cursorPos.x}-${cursorPos.y}`}
            x={cursorPos.x}
            y={cursorPos.y}
            width={1.5}
            height={13}
            className="fill-card-foreground cursor-blink pointer-events-none"
          />
        )}
      </g>
    </g>
  )
}

export default Connection
