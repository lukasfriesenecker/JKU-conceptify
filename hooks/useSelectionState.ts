'use client'

import { useCallback, useState } from 'react'

type ColorTarget = 'text' | 'background'

interface ColorEditingState {
  id: number
  target: ColorTarget
}
function useSelectionState() {
  const [selectedConceptIds, setSelectedConceptIds] = useState<number[]>([])
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<number[]>(
    []
  )
  const [editingConceptIds, setEditingConceptIds] = useState<number[]>([])
  const [editingConnectionIds, setEditingConnectionIds] = useState<number[]>([])
  const [colorEditingStates, setColorEditingStates] = useState<
    ColorEditingState[]
  >([])

  const startEditingConcept = (id: number) => {
    setEditingConceptIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    deselectConcept(id)
  }

  const stopEditingConcept = (id: number) => {
    setEditingConceptIds((prev) => prev.filter((eid) => eid !== id))
  }

  const startEditingConnection = (id: number) => {
    setEditingConnectionIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    )
  }

  const stopEditingConnection = (id: number) => {
    setEditingConnectionIds((prev) => prev.filter((eid) => eid !== id))
  }

  const startColoringConcept = (id: number, target: ColorTarget) => {
    setColorEditingStates((prev) => {
      const exists = prev.some(
        (state) => state.id === id && state.target === target
      )
      if (exists) return prev
      return [...prev, { id, target }]
    })
    deselectConcept(id)
  }

  const stopColoringConcept = (id: number, target?: ColorTarget) => {
    setColorEditingStates((prev) => {
      if (target) {
        return prev.filter(
          (state) => !(state.id === id && state.target === target)
        )
      }
      return prev.filter((state) => state.id !== id)
    })
  }

  const deselectConcept = (id: number) => {
    setSelectedConceptIds((prev) => prev.filter((sid) => sid !== id))
  }

  const toggleSelection = useCallback((id: number) => {
    setSelectedConceptIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((sid) => sid !== id)
      } else {
        stopEditingConcept(id)
        stopColoringConcept(id)
        return [...prev, id]
      }
    })
  }, [])

  const clearSelection = () => {
    setSelectedConceptIds([])
    setSelectedConnectionIds([])
    setEditingConceptIds([])
    setEditingConnectionIds([])
  }

  const renameConcept = (id: number) => {
    startEditingConcept(id)
  }

  const toggleConnectionSelection = useCallback((id: number) => {
    setSelectedConnectionIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((sid) => sid !== id)
      } else {
        stopEditingConnection(id)
        return [...prev, id]
      }
    })
  }, [])

  const deselectConnection = (id: number) => {
    setSelectedConnectionIds((prev) => prev.filter((sid) => sid !== id))
  }

  const renameConnection = (id: number) => {
    startEditingConnection(id)
    deselectConnection(id)
  }

  const editConceptBackgroundColor = (id: number) => {
    startColoringConcept(id, 'background')
  }

  const editConceptTextColor = (id: number) => {
    startColoringConcept(id, 'text')
  }
  const handleColorPickerClose = useCallback((id: number) => {
    stopColoringConcept(id)
  }, [])

  const handleOnEnter = useCallback((id: number, type: string) => {
    if (type == 'concept') {
      stopEditingConcept(id)
    } else {
      stopEditingConnection(id)
    }
  }, [])

  return {
    selectedConceptIds,
    setSelectedConceptIds,
    selectedConnectionIds,
    setSelectedConnectionIds,
    editingConceptIds,
    editingConnectionIds,
    colorEditingStates,
    startEditingConcept,
    stopEditingConcept,
    startEditingConnection,
    stopEditingConnection,
    startColoringConcept,
    stopColoringConcept,
    toggleSelection,
    deselectConcept,
    toggleConnectionSelection,
    deselectConnection,
    renameConnection,
    clearSelection,
    renameConcept,
    editConceptBackgroundColor,
    editConceptTextColor,
    handleColorPickerClose,
    handleOnEnter,
  }
}

export default useSelectionState
