'use client'

import { useCallback, useRef, useState, type MouseEvent } from 'react'
import useSelectionState from '@/hooks/state/useSelectionState'
import useConceptMapData, {
  getEdgeIntersection,
  getConceptBounds,
} from '@/hooks/state/useConceptMapData'
import useFileOperations from '@/hooks/files/useFileOperations'
import useConnectionDraw from '@/hooks/canvas/useConnectionDraw'
import usePanZoom from '@/hooks/canvas/usePanZoom'
import useExport from '@/hooks/files/useExport'
import Toolbar from '@/components/layout/Toolbar'
import AccountInfo from '@/components/layout/AccountInfo'
import ConceptMenu from '@/components/canvas/ConceptMenu'
import ConnectionMenu from '@/components/canvas/ConnectionMenu'
import KeyboardWrapper from '@/components/keyboard/CanvasKeyboard'
import { Button } from '@/components/ui/button'
import ColorPicker from '@/components/canvas/ColorPicker'
import Connection from '@/components/canvas/Connection'
import Concept from '@/components/canvas/Concept'
import UnsavedChangesDialog from '@/components/dialogs/UnsavedChangesDialog'
import SaveMethodDialog from '@/components/dialogs/SaveMethodDialog'
import NoConceptsDialog from '@/components/dialogs/EmptyCanvasDialog'
import { Check } from 'lucide-react'

function Canvas() {
  const { ref, viewport, resetZoom, panZoomLocked, setPanZoomLocked } =
    usePanZoom()
  const {
    selectedConceptIds,
    selectedConnectionIds,
    editingConceptIds,
    editingConnectionIds,
    colorEditingStates,
    startEditingConcept,
    toggleSelection,
    deselectConcept,
    toggleConnectionSelection,
    deselectConnection,
    renameConnection,
    clearSelection,
    renameConcept,
    editConceptBackgroundColor,
    editConceptTextColor,
    handleOnEnter,
    handleColorPickerClose,
  } = useSelectionState()
  const {
    title,
    setTitle,
    description,
    setDescription,
    concepts,
    setConcepts,
    connections,
    setConnections,
    handleConceptDrag,
    handleLabelChange,
    handleColorChange,
    handleConceptScale,
    deleteConcept,
    deleteConnection,
    getConceptCenter,
    getConnectionCenter,
    getEndpointCenter,
    getConnectionEndpoints,
    lableChangeWidthAdjustment,
    addConcept,
  } = useConceptMapData()
  const {
    handleSave,
    handleSaveFile,
    handleSaveAs,
    handleSaveProjectInfo,
    handleOpenProject,
    handleNewProject,
    handleDownload,
    handleFileInputChange,
    hasChanges,
    supportsFileSystemAccess,
    fileInputRef,
    isSaveMethodDialogOpen,
    setIsSaveMethodDialogOpen,
    handleSaveOnline,
    isLinkedToCloud,
    isLinkedToFile,
  } = useFileOperations({
    title,
    description,
    concepts,
    connections,
    setTitle,
    setDescription,
    setConcepts,
    setConnections,
    clearSelection,
    getThumbnail: () => generateThumbnailBase64(),
  })

  const [hideConnectionPoints, setHideConnectionPoints] = useState(false)
  const [pendingAction, setPendingAction] = useState<'open' | 'new' | null>(
    null
  )
  const [interactingConceptId, setInteractingConceptId] = useState<
    number | null
  >(null)

  const handleInteractionStart = useCallback((id: number) => {
    setInteractingConceptId(id)
  }, [])

  const handleInteractionEnd = useCallback(() => {
    setInteractingConceptId(null)
  }, [])

  const guardedNewProject = () => {
    if (hasChanges) {
      setPendingAction('new')
    } else {
      handleNewProject()
    }
  }

  const guardedOpen = () => {
    if (hasChanges) {
      setPendingAction('open')
    } else {
      handleOpenProject()
    }
  }

  const handleDialogSave = async () => {
    const action = pendingAction
    const saved = await handleSave()
    if (!saved) return
    setPendingAction(null)
    if (action === 'new') handleNewProject()
    else if (action === 'open') handleOpenProject()
  }

  const handleDialogDiscard = () => {
    const action = pendingAction
    setPendingAction(null)
    if (action === 'new') handleNewProject()
    else if (action === 'open') handleOpenProject()
  }

  const handleDialogCancel = () => {
    setPendingAction(null)
  }

  const toCanvasCoordinates = useCallback(
    (localX: number, localY: number) => {
      return {
        x: (localX - viewport.x) / viewport.scale,
        y: (localY - viewport.y) / viewport.scale,
      }
    },
    [viewport]
  )

  const {
    activePointerConnections,
    isDrawingRef,
    handleStartConnection,
    handlePointerMove,
    handleGlobalPointerUp,
  } = useConnectionDraw({
    svgRef: ref,
    setConnections,
    toCanvasCoordinates,
  })

  const {
    exportAsPng,
    exportAsJpg,
    exportAsPdf,
    generateThumbnailBase64,
    noConceptsDialogOpen,
    setNoConceptsDialogOpen,
  } = useExport({
    svgRef: ref,
    title,
    concepts,
    connections,
    getEndpointCenter,
  })

  const [caretPositions, setCaretPositions] = useState<Record<number, number>>(
    {}
  )
  const keyboardInstances = useRef<
    Record<number, { setCaretPosition: (pos: number) => void }>
  >({})

  const handleCaretChange = useCallback((id: number, position: number) => {
    setCaretPositions((prev) => ({ ...prev, [id]: position }))
  }, [])

  const handleKeyboardReady = useCallback(
    (id: number, keyboard: { setCaretPosition: (pos: number) => void }) => {
      keyboardInstances.current[id] = keyboard
    },
    []
  )

  const handleCaretClick = useCallback((id: number, position: number) => {
    setCaretPositions((prev) => ({ ...prev, [id]: position }))
    const keyboard = keyboardInstances.current[id]
    if (keyboard) {
      keyboard.setCaretPosition(position)
    }
  }, [])

  const handleDoubleClick = (event: MouseEvent<SVGSVGElement>) => {
    const svgElementPosition = event.currentTarget.getBoundingClientRect()
    const localX = event.clientX - svgElementPosition.left
    const localY = event.clientY - svgElementPosition.top

    const { x, y } = toCanvasCoordinates(localX, localY)
    clearSelection()
    addConcept(x, y, (newId) => {
      startEditingConcept(newId)
    })
  }

  return (
    <div className="bg-background h-screen w-screen touch-none">
      <Toolbar
        title={title}
        description={description}
        onSaveProjectInfo={handleSaveProjectInfo}
        onSave={handleSave}
        onSaveFile={handleSaveFile}
        onSaveAs={handleSaveAs}
        onSaveOnline={handleSaveOnline}
        onOpen={guardedOpen}
        onNewProject={guardedNewProject}
        onDownload={handleDownload}
        isSaveDisabled={!hasChanges && (isLinkedToFile || isLinkedToCloud)}
        isSaveFileDisabled={!hasChanges && isLinkedToFile}
        isSaveOnlineDisabled={!hasChanges && isLinkedToCloud}
        supportsFileSystemAccess={supportsFileSystemAccess}
        zoomLevel={viewport.scale}
        onResetZoom={resetZoom}
        panZoomLocked={panZoomLocked}
        onPanZoomLockedChange={setPanZoomLocked}
        onExportPng={exportAsPng}
        onExportJpg={exportAsJpg}
        onExportPdf={exportAsPdf}
        hideConnectionPoints={hideConnectionPoints}
        onHideConnectionPointsChange={setHideConnectionPoints}
      />

      <AccountInfo />

      <div className="pointer-events-none absolute inset-0">
        {selectedConceptIds.map((id) => {
          if (id === interactingConceptId) return null
          const concept = concepts.find((c) => c.id === id)
          if (!concept) return null

          return (
            <div key={`menu-${id}`} className="pointer-events-auto">
              <ConceptMenu
                concept={concept}
                viewport={viewport}
                onDeselect={deselectConcept}
                onDelete={deleteConcept}
                onRename={renameConcept}
                onBackgroundColorEditing={editConceptBackgroundColor}
                onTextColorEditing={editConceptTextColor}
              />
            </div>
          )
        })}
      </div>

      <div className="pointer-events-none absolute inset-0">
        {selectedConnectionIds.map((id) => {
          const connection = connections.find((c) => c.id === id)
          if (!connection) return null
          const connFrom = getEndpointCenter(
            connection.from,
            connection.fromType
          )
          const connTo = getEndpointCenter(connection.to, connection.toType)
          const mx = (connFrom.x + connTo.x) / 2
          const my = (connFrom.y + connTo.y) / 2
          const connRectWidth = parseFloat(connection.width) + 44
          const menuScreenX =
            (mx + connRectWidth / 2) * viewport.scale + viewport.x + 6
          const menuScreenY = (my - 17) * viewport.scale + viewport.y

          return (
            <div key={`conn-menu-${id}`} className="pointer-events-auto">
              <ConnectionMenu
                connectionId={id}
                screenX={menuScreenX}
                screenY={menuScreenY}
                onDeselect={deselectConnection}
                onDelete={(connId) => {
                  deselectConnection(connId)
                  deleteConnection(connId)
                }}
                onRename={renameConnection}
              />
            </div>
          )
        })}
      </div>

      <div className="pointer-events-none absolute inset-0">
        {editingConceptIds.map((id) => {
          const concept = concepts.find((c) => c.id === id)
          if (!concept) return null
          const screenX = concept.x * viewport.scale + viewport.x
          const screenY =
            concept.y * viewport.scale +
            viewport.y +
            parseFloat(concept.height) * viewport.scale +
            10
          return (
            <div
              key={`keyboard-${id}`}
              className="pointer-events-auto absolute z-50 flex flex-col items-end"
              style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
              }}
            >
              <KeyboardWrapper
                id={concept.id}
                label={concept.label}
                type="concept"
                onChange={handleLabelChange}
                onCaretChange={handleCaretChange}
                onKeyboardReady={handleKeyboardReady}
              />
              <Button
                variant="secondary"
                className="mt-2 gap-2"
                disabled={!concept.label || concept.label.length > 200}
                onClick={() => {
                  handleOnEnter(concept.id, 'concept')
                }}
              >
                <Check className="h-4 w-4" />
                Speichern
              </Button>
            </div>
          )
        })}
      </div>

      <div className="pointer-events-none absolute inset-0">
        {colorEditingStates.map(({ id, target }) => {
          const concept = concepts.find((c) => c.id === id)
          if (!concept) return null
          return (
            <div key={`sketch-${id}-${target}`} className="pointer-events-auto">
              <div className="sketch-no-inputs">
                <ColorPicker
                  concept={concept}
                  target={target}
                  viewport={viewport}
                  onColorChange={handleColorChange}
                  onClose={() => handleColorPickerClose(id)}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="pointer-events-none absolute inset-0">
        {editingConnectionIds.map((id) => {
          const connection = connections.find((c) => c.id === id)
          if (!connection) return null
          const from = getEndpointCenter(connection.from, connection.fromType)
          const to = getEndpointCenter(connection.to, connection.toType)
          const mx = (from.x + to.x) / 2
          const my = (from.y + to.y) / 2
          const connRectWidth = parseFloat(connection.width) + 44
          const connRectHeight = 34
          const screenX = (mx - connRectWidth / 2) * viewport.scale + viewport.x
          const screenY =
            (my + connRectHeight / 2) * viewport.scale + viewport.y + 5
          return (
            <div
              key={`keyboard-con-${id}`}
              className="pointer-events-auto absolute z-50 flex flex-col items-end"
              style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
              }}
            >
              <KeyboardWrapper
                id={connection.id}
                label={connection.label}
                type="connection"
                onChange={handleLabelChange}
                onCaretChange={handleCaretChange}
                onKeyboardReady={handleKeyboardReady}
              />
              <Button
                variant="secondary"
                className="mt-1 gap-2"
                disabled={!connection.label || connection.label.length > 200}
                onClick={() => handleOnEnter(connection.id, 'connection')}
              >
                <Check className="h-4 w-4" />
                Speichern
              </Button>
            </div>
          )
        })}
      </div>

      <svg
        ref={ref}
        className="h-full w-full"
        onDoubleClick={handleDoubleClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handleGlobalPointerUp}
      >
        <defs>
          <pattern
            id="dot-pattern"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.scale})`}
          >
            <circle cx="2" cy="2" r="1" className="fill-muted-foreground" />
          </pattern>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-card-foreground" />
          </marker>
        </defs>

        <rect className="h-full w-full fill-[url(#dot-pattern)]" />

        <g
          transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.scale})`}
        >
          {connections.map((connection) => (
            <g
              key={connection.id}
              data-connection-id={connection.id}
              onClick={() => {
                if (isDrawingRef.current) return
                toggleConnectionSelection(connection.id)
              }}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <Connection
                width={connection.width}
                id={connection.id}
                label={connection.label}
                {...getConnectionEndpoints(connection)}
                isSelected={selectedConnectionIds.includes(connection.id)}
                caretPosition={
                  editingConnectionIds.includes(connection.id)
                    ? caretPositions[connection.id]
                    : undefined
                }
                onLabelChange={lableChangeWidthAdjustment}
                onCaretClick={handleCaretClick}
                onStartConnection={(connId, e) =>
                  handleStartConnection(connId, e, 'connection')
                }
                extraTargetPositions={(connection.extraTargets ?? []).map(
                  (targetId) => {
                    const targetConcept = concepts.find(
                      (c) => c.id === targetId
                    )
                    if (!targetConcept) return getConceptCenter(targetId)

                    return getEdgeIntersection(
                      getConnectionCenter(connection.id),
                      getConceptBounds(targetConcept)
                    )
                  }
                )}
                hideConnectionPoints={hideConnectionPoints}
              />
            </g>
          ))}

          {concepts.map((concept) => (
            <Concept
              key={concept.id}
              id={concept.id}
              label={concept.label}
              x={concept.x}
              y={concept.y}
              width={concept.width}
              height={concept.height}
              scale={viewport.scale}
              backgroundColor={concept.backgroundColor}
              textColor={concept.textColor}
              onDrag={handleConceptDrag}
              onScale={handleConceptScale}
              onScaleStart={handleInteractionStart}
              onScaleEnd={handleInteractionEnd}
              onDragStart={handleInteractionStart}
              onDragEnd={handleInteractionEnd}
              onSelect={toggleSelection}
              isSelected={selectedConceptIds.includes(concept.id)}
              onStartConnection={handleStartConnection}
              onLabelChange={lableChangeWidthAdjustment}
              caretPosition={
                editingConceptIds.includes(concept.id)
                  ? caretPositions[concept.id]
                  : undefined
              }
              onCaretClick={handleCaretClick}
              hideConnectionPoints={hideConnectionPoints}
            />
          ))}

          {Object.entries(activePointerConnections).map(
            ([pointerId, pending]) => {
              return (
                <line
                  key={`${pointerId}`}
                  x1={pending.startX}
                  y1={pending.startY}
                  x2={pending.currentX}
                  y2={pending.currentY}
                  className="stroke-card-foreground pointer-events-none stroke-1"
                />
              )
            }
          )}
        </g>
      </svg>

      <UnsavedChangesDialog
        open={pendingAction !== null}
        onSave={handleDialogSave}
        onDiscard={handleDialogDiscard}
        onCancel={handleDialogCancel}
      />

      <SaveMethodDialog
        open={isSaveMethodDialogOpen}
        onOpenChange={setIsSaveMethodDialogOpen}
        onSaveOnline={handleSaveOnline}
        onSaveFile={handleSaveAs}
        supportsFileSystemAccess={supportsFileSystemAccess}
      />

      <NoConceptsDialog
        open={noConceptsDialogOpen}
        onOpenChange={setNoConceptsDialogOpen}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  )
}

export default Canvas
