'use client'

import { useCallback, useState } from 'react'
import { jsPDF } from 'jspdf'
import type { IConcept } from '@/types/Concept'
import type { IConnection } from '@/types/Connection'
import {
  getEndpointBoundsStateless,
  getEndpointCenterStateless,
  getEdgeIntersection,
} from './useConceptMapData'

interface UseExportProps {
  svgRef: React.RefObject<SVGSVGElement | null>
  title: string
  concepts: IConcept[]
  connections: IConnection[]
  getEndpointCenter: (
    id: number,
    type?: 'concept' | 'connection'
  ) => { x: number; y: number }
}

function useExport({
  svgRef,
  title,
  concepts,
  connections,
  getEndpointCenter,
}: UseExportProps) {
  const [noConceptsDialogOpen, setNoConceptsDialogOpen] = useState(false)

  const buildExportSvg = useCallback(
    (options?: { targetAspectRatio?: number; paddingRatio?: number }) => {
      const svgElement = svgRef.current
      if (!svgElement) return null

      const contentGroup = svgElement.querySelector(
        'g[transform]'
      ) as SVGGElement | null
      if (!contentGroup) return null

      const padding = 40
      const offsetShift = 34

      const getExportBounds = (id: number, type: 'concept' | 'connection' | undefined) => {
        const bounds = getEndpointBoundsStateless(id, type, concepts, connections)
        if (!type || type === 'concept') {
          bounds.x += offsetShift 

          if (bounds.width > 50) {
            bounds.width -= offsetShift
          }
        } else if (type === 'connection') {
          bounds.width -= 30
          bounds.x += 15
        }
        return bounds
      }

      const getExportCenter = (id: number, type: 'concept' | 'connection' | undefined) => {
        const bounds = getExportBounds(id, type)
        return {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2
        }
      }

      const exportCoords = new Map<number, any>()

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity

      for (const concept of concepts) {
        const bounds = getExportBounds(concept.id, 'concept')
        minX = Math.min(minX, bounds.x)
        minY = Math.min(minY, bounds.y)
        maxX = Math.max(maxX, bounds.x + bounds.width)
        maxY = Math.max(maxY, bounds.y + bounds.height)
      }

      for (const connection of connections) {
        const rawExportFrom = getExportCenter(connection.from, connection.fromType)
        const rawExportTo = getExportCenter(connection.to, connection.toType)

        const exportFromBounds = getExportBounds(connection.from, connection.fromType)
        const exportToBounds = getExportBounds(connection.to, connection.toType)

        const exportFrom = getEdgeIntersection(rawExportTo, exportFromBounds)
        const exportTo = getEdgeIntersection(rawExportFrom, exportToBounds)

        const exportMidX = (exportFrom.x + exportTo.x) / 2
        const exportMidY = (exportFrom.y + exportTo.y) / 2

        const oldFrom = getEndpointCenterStateless(connection.from, connection.fromType, concepts, connections)
        const oldTo = getEndpointCenterStateless(connection.to, connection.toType, concepts, connections)
        const oldMidX = (oldFrom.x + oldTo.x) / 2

        const extraTargets = (connection.extraTargets || []).map(targetId => {
          const tBounds = getExportBounds(targetId, 'concept')
          const origin = { x: exportMidX, y: exportMidY }
          return getEdgeIntersection(origin, tBounds)
        })

        exportCoords.set(connection.id, {
          from: exportFrom,
          to: exportTo,
          midShift: exportMidX - oldMidX,
          origMidX: oldMidX,
          extraTargets
        })

        const labelWidth = parseFloat(connection.width) + 10
        minX = Math.min(minX, exportFrom.x, exportTo.x, exportMidX - 45)
        minY = Math.min(minY, exportFrom.y, exportTo.y, exportMidY - 15)
        maxX = Math.max(maxX, exportFrom.x, exportTo.x, exportMidX - 45 + labelWidth)
        maxY = Math.max(maxY, exportFrom.y, exportTo.y, exportMidY + 15)

        for (const tgt of extraTargets) {
          minX = Math.min(minX, tgt.x)
          minY = Math.min(minY, tgt.y)
          maxX = Math.max(maxX, tgt.x)
          maxY = Math.max(maxY, tgt.y)
        }
      }

      if (!isFinite(minX)) return null

      minX -= padding
      minY -= padding
      maxX += padding
      maxY += padding

      let width = maxX - minX
      let height = maxY - minY

      if (options?.targetAspectRatio) {
        const currentAspectRatio = width / height
        if (currentAspectRatio > options.targetAspectRatio) {
          const newHeight = width / options.targetAspectRatio
          const diff = newHeight - height
          minY -= diff / 2
          maxY += diff / 2
          height = newHeight
        } else {
          const newWidth = height * options.targetAspectRatio
          const diff = newWidth - width
          minX -= diff / 2
          maxX += diff / 2
          width = newWidth
        }
      }

      if (options?.paddingRatio) {
        const newWidth = width * options.paddingRatio
        const newHeight = height * options.paddingRatio
        const diffX = newWidth - width
        const diffY = newHeight - height
        minX -= diffX / 2
        maxX += diffX / 2
        minY -= diffY / 2
        maxY += diffY / 2
        width = newWidth
        height = newHeight
      }

      const clonedGroup = contentGroup.cloneNode(true) as SVGGElement
      clonedGroup.setAttribute('transform', `translate(${-minX}, ${-minY})`)

      const originalElements = contentGroup.querySelectorAll('*')
      const clonedElements = clonedGroup.querySelectorAll('*')

      const toRemove: Set<number> = new Set()
      for (let i = 0; i < originalElements.length; i++) {
        const original = originalElements[i] as SVGElement
        if (
          original.tagName === 'circle' &&
          original.classList.contains('fill-ring')
        ) {
          toRemove.add(i)
        }
        if (original.classList.contains('cursor-blink')) {
          toRemove.add(i)
        }
      }

      const getThemeColors = () => {
        const el = document.createElement('div')
        el.className =
          'bg-background text-muted-foreground fixed opacity-0 pointer-events-none -z-50'
        document.body.appendChild(el)
        const computed = getComputedStyle(el)
        const bg = computed.backgroundColor
        const fg = computed.color
        document.body.removeChild(el)
        return { bg, fg }
      }

      const { bg: bgColor, fg: dotColor } = getThemeColors()
      const fgColor = dotColor

      const styleProps = [
        'fill',
        'stroke',
        'stroke-width',
        'font-size',
        'font-family',
        'font-weight',
        'text-anchor',
        'dominant-baseline',
        'opacity',
        'color',
      ]

      for (let i = 0; i < originalElements.length; i++) {
        const original = originalElements[i] as SVGElement
        const cloned = clonedElements[i] as SVGElement

        if (toRemove.has(i)) {
          cloned.remove()
          continue
        }

        if (
          original.tagName === 'g' &&
          original.hasAttribute('data-concept-id')
        ) {
          const x = parseFloat(
            original.getAttribute('transform')?.split('(')[1].split(',')[0] ||
              '0'
          )
          const y = parseFloat(
            original.getAttribute('transform')?.split(',')[1].split(')')[0] ||
              '0'
          )
          cloned.setAttribute(
            'transform',
            `translate(${x + offsetShift}, ${y})`
          )
        }

        const parentConnG = original.closest('g[data-connection-id]')
        const connId = parentConnG ? parseInt(parentConnG.getAttribute('data-connection-id') || '-1', 10) : -1
        const exportData = exportCoords.get(connId)

        if (original.tagName === 'line' && exportData) {
          const isMain = original.getAttribute('data-is-main-line') === 'true'
          const isExtra = original.getAttribute('data-is-extra-line') === 'true'
          
          if (isMain) {
            cloned.setAttribute('x1', String(exportData.from.x))
            cloned.setAttribute('y1', String(exportData.from.y))
            cloned.setAttribute('x2', String(exportData.to.x))
            cloned.setAttribute('y2', String(exportData.to.y))
          } else if (isExtra) {
            const idx = parseInt(original.getAttribute('data-extra-index') || '0', 10)
            const tgt = exportData.extraTargets[idx]
            if (tgt) {
               const midX = (exportData.from.x + exportData.to.x) / 2
               const midY = (exportData.from.y + exportData.to.y) / 2
               cloned.setAttribute('x1', String(midX))
               cloned.setAttribute('y1', String(midY))
               cloned.setAttribute('x2', String(tgt.x))
               cloned.setAttribute('y2', String(tgt.y))
            }
          }
        }

        const isConnectionRect = original.getAttribute('data-export-type') === 'connection-rect'
        const isConnectionText = original.getAttribute('data-export-type') === 'connection-text' || original.parentElement?.getAttribute('data-export-type') === 'connection-text'
        const hidePointsStr = original.tagName === 'tspan' ? original.parentElement?.getAttribute('data-hide-points') : original.getAttribute('data-hide-points')
        
        if (isConnectionRect && exportData) {
          const origW = parseFloat(original.getAttribute('width') || '0')
          const w = hidePointsStr === 'false' ? (origW - 30) : origW
          
          const midX = (exportData.from.x + exportData.to.x) / 2
          const targetX = hidePointsStr === 'false' ? (midX + 15 - origW / 2) : (midX - origW / 2)

          cloned.setAttribute('width', String(w))
          cloned.setAttribute('x', String(targetX))
        } else if (
          original.tagName === 'rect' &&
          !original.classList.contains('fill-ring') &&
          !isConnectionRect
        ) {
          const origW = parseFloat(original.getAttribute('width') || '0')
          if (origW > 50) {
            cloned.setAttribute('width', String(origW - offsetShift))
          }
        }

        if (isConnectionText && exportData) {
          const parentRect = original.closest('g[data-connection-id]')?.querySelector('rect')
          const origW = parseFloat(parentRect?.getAttribute('width') || '0')
          const midX = (exportData.from.x + exportData.to.x) / 2

          const targetX = hidePointsStr === 'false' ? (midX + 15 - origW / 2) : (midX - origW / 2)
          const textX = targetX + 7
          cloned.setAttribute('x', String(textX))
        } else if (original.tagName === 'text' || original.tagName === 'tspan') {
          const currentX = original.getAttribute('x')
          const parentRect = original.closest('g')?.querySelector('rect')

          if (parentRect) {
            const rectX = parseFloat(parentRect.getAttribute('x') || '0')

            if (currentX === '49') {
              cloned.setAttribute('x', String(rectX + 15))
            }
          }
        }

        const computed = window.getComputedStyle(original)

        for (const prop of styleProps) {
          const value = computed.getPropertyValue(prop)

          if (value) {
            cloned.style.setProperty(prop, value)
          }
        }

        if (original.classList.contains('stroke-primary')) {
          const borderEl = contentGroup.querySelector(
            '[class*="stroke-border"]'
          ) as SVGElement | null
          if (borderEl) {
            const resolvedBorder =
              getComputedStyle(borderEl).getPropertyValue('stroke')
            cloned.style.setProperty('stroke', resolvedBorder)
          }
        }

        cloned.removeAttribute('class')
      }

      const exportSvg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      )
      exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      exportSvg.setAttribute('width', `${width}`)
      exportSvg.setAttribute('height', `${height}`)
      exportSvg.setAttribute('viewBox', `0 0 ${width} ${height}`)

      const bgRect = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      )
      bgRect.setAttribute('width', '100%')
      bgRect.setAttribute('height', '100%')
      bgRect.style.fill = bgColor
      exportSvg.appendChild(bgRect)

      const defs = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'defs'
      )
      const pattern = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'pattern'
      )
      pattern.setAttribute('id', 'export-dot-pattern')
      pattern.setAttribute('width', '20')
      pattern.setAttribute('height', '20')
      pattern.setAttribute('patternUnits', 'userSpaceOnUse')
      const dot = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      )
      dot.setAttribute('cx', '2')
      dot.setAttribute('cy', '2')
      dot.setAttribute('r', '1')
      dot.style.fill = dotColor
      pattern.appendChild(dot)
      defs.appendChild(pattern)

      const marker = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'marker'
      )
      marker.setAttribute('id', 'arrow')
      marker.setAttribute('viewBox', '0 0 10 10')
      marker.setAttribute('refX', '9')
      marker.setAttribute('refY', '5')
      marker.setAttribute('markerWidth', '6')
      marker.setAttribute('markerHeight', '6')
      marker.setAttribute('orient', 'auto-start-reverse')

      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      )
      path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z')
      
      path.setAttribute('fill', fgColor)
      
      marker.appendChild(path)
      defs.appendChild(marker)

      exportSvg.appendChild(defs)

      const dotBg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      )
      dotBg.setAttribute('width', '100%')
      dotBg.setAttribute('height', '100%')
      dotBg.setAttribute('fill', 'url(#export-dot-pattern)')
      exportSvg.appendChild(dotBg)

      exportSvg.appendChild(clonedGroup)

      return { exportSvg, width, height }
    },
    [svgRef, concepts, connections, getEndpointCenter]
  )

  const renderToCanvas = useCallback(
    (
      format: 'image/png' | 'image/jpeg',
      extension: string,
      quality?: number
    ) => {
      const result = buildExportSvg()
      if (!result) return

      const { exportSvg, width, height } = result

      const svgString = new XMLSerializer().serializeToString(exportSvg)
      const blob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)

      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const context = canvas.getContext('2d')
      if (!context) return

      const img = new Image()
      img.onload = () => {
        context.scale(scale, scale)
        context.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)

        canvas.toBlob(
          (outputBlob) => {
            if (!outputBlob) return

            const link = document.createElement('a')
            link.download = `${title}.${extension}`
            link.href = URL.createObjectURL(outputBlob)
            link.click()
            URL.revokeObjectURL(link.href)
          },
          format,
          quality
        )
      }

      img.src = url
    },
    [buildExportSvg, title]
  )

  const generateThumbnailBase64 = useCallback(async (): Promise<{
    light: string | null
    dark: string | null
  }> => {
    return new Promise(async (resolve) => {
      const root = window.document.documentElement
      const originalClasses = Array.from(root.classList)

      const captureTheme = async (
        themeName: 'light' | 'dark'
      ): Promise<string | null> => {
        return new Promise((resolveCapture) => {
          root.classList.remove('light', 'dark')
          root.classList.add(themeName)

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const result = buildExportSvg({
                targetAspectRatio: 16 / 9,
                paddingRatio: 1.15,
              })
              if (!result) {
                resolveCapture(null)
                return
              }

              const { exportSvg, width, height } = result

              const svgString = new XMLSerializer().serializeToString(exportSvg)
              const blob = new Blob([svgString], {
                type: 'image/svg+xml;charset=utf-8',
              })
              const url = URL.createObjectURL(blob)

              const scale = 0.5

              const canvas = document.createElement('canvas')
              canvas.width = width * scale
              canvas.height = height * scale
              const context = canvas.getContext('2d')

              if (!context) {
                resolveCapture(null)
                return
              }

              const bgColor =
                getComputedStyle(document.body).backgroundColor || 'white'

              context.fillStyle = bgColor
              context.fillRect(0, 0, canvas.width, canvas.height)

              const img = new Image()
              img.onload = () => {
                context.scale(scale, scale)
                context.drawImage(img, 0, 0, width, height)
                URL.revokeObjectURL(url)

                const base64 = canvas.toDataURL('image/jpeg', 0.95)
                resolveCapture(base64)
              }

              img.onerror = () => {
                URL.revokeObjectURL(url)
                resolveCapture(null)
              }

              img.src = url
            })
          })
        })
      }

      const noTransitionStyle = document.createElement('style')
      noTransitionStyle.innerHTML = '* { transition: none !important; }'
      document.head.appendChild(noTransitionStyle)

      const light = await captureTheme('light')
      const dark = await captureTheme('dark')

      document.head.removeChild(noTransitionStyle)
      root.className = originalClasses.join(' ')

      resolve({ light, dark })
    })
  }, [buildExportSvg])

  const exportAsPng = useCallback(() => {
    if (concepts.length === 0) {
      setNoConceptsDialogOpen(true)
      return
    }
    renderToCanvas('image/png', 'png')
  }, [renderToCanvas, concepts])

  const exportAsJpg = useCallback(() => {
    if (concepts.length === 0) {
      setNoConceptsDialogOpen(true)
      return
    }
    renderToCanvas('image/jpeg', 'jpg', 0.95)
  }, [renderToCanvas])

  const exportAsPdf = useCallback(() => {
    if (concepts.length === 0) {
      setNoConceptsDialogOpen(true)
      return
    }
    const result = buildExportSvg()
    if (!result) return

    const { exportSvg, width, height } = result

    const svgString = new XMLSerializer().serializeToString(exportSvg)
    const blob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)

    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale

    const context = canvas.getContext('2d')
    if (!context) return

    const img = new Image()

    img.onload = () => {
      context.scale(scale, scale)
      context.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)

      const imgData = canvas.toDataURL('image/png')

      const orientation = width > height ? 'l' : 'p'
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [width, height],
      })

      pdf.addImage(imgData, 'PNG', 0, 0, width, height)
      pdf.save(`${title}.pdf`)
    }

    img.src = url
  }, [buildExportSvg, title])

  return {
    exportAsPng,
    exportAsJpg,
    exportAsPdf,
    generateThumbnailBase64,
    noConceptsDialogOpen,
    setNoConceptsDialogOpen,
  }
}

export default useExport
