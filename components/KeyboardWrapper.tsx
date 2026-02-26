'use client'

import { useEffect, useRef } from 'react'
import type { SimpleKeyboard } from 'react-simple-keyboard/build/interfaces'
import { BaseKeyboard } from './BaseKeyboard'

interface IProps {
  id: number
  label: string
  type: 'concept' | 'connection'
  onChange: (id: number, value: string, type: string) => void
  onCaretChange?: (id: number, position: number) => void
  onKeyboardReady?: (id: number, keyboard: SimpleKeyboard) => void
}

function KeyboardWrapper({
  id,
  label,
  type,
  onChange,
  onCaretChange,
  onKeyboardReady,
}: IProps) {
  const keyboardRef = useRef<SimpleKeyboard | null>(null)
  const skipNextOnChange = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const keyboard = keyboardRef.current
        if (keyboard) {
          const currentInput = keyboard.getInput() ?? ''
          const caretPos = keyboard.getCaretPosition() ?? currentInput.length
          const newValue =
            currentInput.slice(0, caretPos) + '   ' + currentInput.slice(caretPos)
          skipNextOnChange.current = true
          keyboard.setInput(newValue)
          keyboard.setCaretPosition(caretPos + 3)
          onChange(id, newValue, type)
          onCaretChange?.(id, caretPos + 3)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [id, type, onChange, onCaretChange])

  const onKeyPress = (button: string) => {

    if (button === '{tab}') {
      const keyboard = keyboardRef.current
      if (keyboard) {
        const currentInput = keyboard.getInput() ?? ''
        const caretPos = keyboard.getCaretPosition() ?? currentInput.length
        const newValue =
          currentInput.slice(0, caretPos) + '   ' + currentInput.slice(caretPos)
        skipNextOnChange.current = true
        keyboard.setInput(newValue)
        keyboard.setCaretPosition(caretPos + 3)
        onChange(id, newValue, type)
        onCaretChange?.(id, caretPos + 3)
      }
      return
    }

    if (button === '{enter}') {
      if (type === 'connection') return

      const keyboard = keyboardRef.current
      if (keyboard) {
        const currentInput = keyboard.getInput() ?? ''
        const caretPos = keyboard.getCaretPosition() ?? currentInput.length
        const newValue =
          currentInput.slice(0, caretPos) + '\n' + currentInput.slice(caretPos)
        skipNextOnChange.current = true
        keyboard.setInput(newValue)
        keyboard.setCaretPosition(caretPos + 1)
        onChange(id, newValue, type)
        onCaretChange?.(id, caretPos + 1)
      }
    }
  }

  const handleOnChange = (value: string) => {
    if (skipNextOnChange.current) {
      skipNextOnChange.current = false
      return
    }
    onChange(id, value, type)
    const pos = keyboardRef.current?.getCaretPosition()
    if (pos !== null && pos !== undefined) {
      onCaretChange?.(id, pos)
    }
  }

  return (
    <div className="bg-card animate-in fade-in zoom-in-95 z-50 flex w-[360px] items-center gap-2 rounded-lg border p-1 shadow-xl duration-150 sm:w-[420px]">
      <BaseKeyboard
        keyboardRef={(r) => (keyboardRef.current = r)}
        onChange={handleOnChange}
        onKeyPress={onKeyPress}
        onInit={(keyboard) => {
          keyboard.setInput(label)
          keyboard.setCaretPosition(label.length)
          onCaretChange?.(id, label.length)
          onKeyboardReady?.(id, keyboard)
        }}
      />
    </div>
  )
}

export default KeyboardWrapper
