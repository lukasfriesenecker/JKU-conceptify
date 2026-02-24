'use client'

import { memo, useLayoutEffect, useRef, useState } from 'react'
import useDraggable from '../hooks/useDraggable'
import useScalable from '../hooks/useScalable'

interface ConceptProps {
  id: number
  label: string
  x: number
  y: number
  width: string
  height: string
  scale: number
  backgroundColor: string
  textColor: string
  onDrag: (id: number, dx: number, dy: number) => void
  onScale: (
    id: number,
    dx: number,
    dy: number,
    width: string,
    height: string
  ) => void
  onSelect: (id: number) => void
  isSelected: boolean
  onStartConnection: (
    fromId: number,
    event: React.PointerEvent<Element>
  ) => void
  onLabelChange: (
    id: number,
    textWidth: string,
    type: string,
    textHeight?: string
  ) => void
  caretPosition?: number
  onCaretClick?: (id: number, position: number) => void
  hideConnectionPoints?: boolean
  onScaleStart?: (id: number) => void
  onScaleEnd?: (id: number) => void
  onDragStart?: (id: number) => void
  onDragEnd?: (id: number) => void
}

function Concept({
  id,
  label,
  x,
  y,
  width,
  height,
  scale,
  onDrag,
  onScale,
  onSelect,
  isSelected,
  onStartConnection,
  onLabelChange,
  backgroundColor,
  textColor,
  caretPosition,
  onCaretClick,
  hideConnectionPoints,
  onScaleStart,
  onScaleEnd,
  onDragStart,
  onDragEnd,
}: ConceptProps) {
  const [minDims, setMinDims] = useState({ width: 100, height: 50 })
  const dragRef = useDraggable(id, scale, onDrag, onDragStart, onDragEnd)
  const scaleRef = useScalable(
    id,
    onScale,
    isSelected,
    scale,
    minDims.width,
    minDims.height,
    onScaleStart,
    onScaleEnd
  )
  const handleRadius = 6 / scale
  const pointerStartPos = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  const textRef = useRef<SVGTextElement | null>(null)
  const tspanRefs = useRef<(SVGTSpanElement | null)[]>([])
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null
  )

  useLayoutEffect(() => {
    if (!textRef.current) return
    if (!scaleRef.current) return

    const bbox = textRef.current.getBBox()
    const padding = hideConnectionPoints ? 30 : 64
    const textWidth = bbox.width + padding
    const hasMultipleLines = label.includes('\n')
    const extraHeight = hasMultipleLines ? 14 : 0
    const textHeight = Math.max(54, bbox.height + 20 + extraHeight)

    setMinDims({ width: textWidth, height: textHeight })

    onLabelChange(id, `${textWidth}px`, 'concept', `${textHeight}px`)
  }, [label, id, onLabelChange, hideConnectionPoints])

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
  }, [caretPosition, label])

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

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartPos.current = { x: e.clientX, y: e.clientY }
    hasMoved.current = false
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const distance = Math.sqrt(
      Math.pow(e.clientX - pointerStartPos.current.x, 2) +
        Math.pow(e.clientY - pointerStartPos.current.y, 2)
    )

    if (distance > 5) {
      hasMoved.current = true
    }
  }

  return (
    <g
      ref={dragRef}
      data-concept-id={id}
      transform={`translate(${x}, ${y})`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={(e) => {
        e.stopPropagation()
        if (!hasMoved.current) {
          onSelect(id)
        }
      }}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <rect
        ref={scaleRef}
        width={width}
        height={height}
        rx="2"
        style={{ fill: backgroundColor }}
        className={`fill-card cursor-pointer transition-colors ${
          isSelected ? 'stroke-primary stroke-1' : 'stroke-border stroke-1'
        }`}
      />

      {isSelected && (
        <g className="pointer-events-none">
          <circle cx="0" cy="0" r={handleRadius} className="fill-ring" />
          <circle cx={width} cy="0" r={handleRadius} className="fill-ring" />
          <circle cx="0" cy={height} r={handleRadius} className="fill-ring" />
          <circle
            cx={width}
            cy={height}
            r={handleRadius}
            className="fill-ring"
          />
        </g>
      )}

      <circle
        cx={27}
        cy={27}
        r={12}
        style={{
          fill: textColor,
          display: hideConnectionPoints ? 'none' : undefined,
        }}
        className="fill-ring"
        onPointerDown={(e) => {
          e.nativeEvent.stopImmediatePropagation()
          onStartConnection(id, e)
        }}
      />

      <text
        ref={textRef}
        x={hideConnectionPoints ? 15 : 49}
        y={27}
        dominantBaseline="central"
        className="fill-card-foreground text-sm font-medium select-none"
        style={{
          fill: textColor,
          cursor: caretPosition !== undefined ? 'text' : undefined,
        }}
        onClick={handleTextClick}
        xmlSpace="preserve"
      >
        {label.split('\n').map((line, i) => (
          <tspan
            key={i}
            ref={(el) => {
              tspanRefs.current[i] = el
            }}
            x={hideConnectionPoints ? 15 : 49}
            dy={i === 0 ? 0 : '1.2em'}
          >
            {line || ' '}
          </tspan>
        ))}
      </text>

      {cursorPos && (
        <rect
          x={cursorPos.x}
          y={cursorPos.y}
          width={1.5}
          height={16}
          className="fill-card-foreground cursor-blink pointer-events-none"
        />
      )}
    </g>
  )
}

export default memo(Concept)
