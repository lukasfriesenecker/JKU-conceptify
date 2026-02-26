'use client'

import { useEffect, useRef, useState } from 'react'
import Keyboard from 'react-simple-keyboard'
import type { SimpleKeyboard } from 'react-simple-keyboard/build/interfaces'
import 'react-simple-keyboard/build/css/index.css'
import { useTheme } from './ThemeProvider'

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
  const [layoutName, setLayoutName] = useState('default')
  const [isLocked, setIsLocked] = useState(false)
  const keyboardRef = useRef<SimpleKeyboard | null>(null)
  const skipNextOnChange = useRef(false)
  const { theme } = useTheme()
  const keyboardTheme =
    theme === 'dark' ? 'hg-theme-default dark' : 'hg-theme-default light'

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
    if (button === '{shift}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default')
      setIsLocked(false)
      return
    }

    if (button === '{lock}') {
      const newLocked = !isLocked
      setIsLocked(newLocked)
      setLayoutName(newLocked ? 'shift' : 'default')
      return
    }

    if (layoutName === 'shift' && !isLocked) {
      setLayoutName('default')
    }

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
      <Keyboard
        keyboardRef={(r) => (keyboardRef.current = r)}
        layoutName={layoutName}
        layout={{
          default: [
            '^ 1 2 3 4 5 6 7 8 9 0 ß ´ {bksp}',
            '{tab} q w e r t z u i o p ü +',
            '{lock} a s d f g h j k l ö ä # {enter}',
            '{shift} < y x c v b n m , . - @',
            '( ) {space}',
          ],
          shift: [
            '° ! " § $ % & / { } = ? ` {bksp}',
            '{tab} Q W E R T Z U I O P Ü *',
            '{lock} A S D F G H J K L Ö Ä \' {enter}',
            '{shift} > Y X C V B N M ; : _ @',
            '[ ] {space}',
          ],
        }}
        onChange={handleOnChange}
        onKeyPress={onKeyPress}
        onInit={(keyboard) => {
          keyboard.setInput(label)
          keyboard.setCaretPosition(label.length)
          onCaretChange?.(id, label.length)
          onKeyboardReady?.(id, keyboard)
        }}
        theme={keyboardTheme}
        buttonTheme={[
          {
            class: '!max-w-12 sm:!max-w-16',
            buttons: '( ) [ ]',
          },
        ]}
        display={{
          '{bksp}': '⌫',
          '{enter}': '↵',
          '{shift}': '⇧',
          '{space}': '␣',
          '{lock}': '⇪',
          '{tab}': '⇥',
        }}
      />
    </div>
  )
}

export default KeyboardWrapper
