'use client'

import { useEffect, useRef, useState } from 'react'
import Keyboard from 'react-simple-keyboard'
import type { SimpleKeyboard } from 'react-simple-keyboard/build/interfaces'
import 'react-simple-keyboard/build/css/index.css'
import { useTheme } from './ThemeProvider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AuthKeyboardProps {
  value: string
  onChange: (value: string) => void
  onKeyPress?: (button: string) => void
  onSave?: () => void
  className?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function AuthKeyboard({
  value,
  onChange,
  onKeyPress,
  onSave,
  className,
  inputRef,
}: AuthKeyboardProps) {
  const [layoutName, setLayoutName] = useState('default')
  const [isLocked, setIsLocked] = useState(false)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  const keyboardRef = useRef<SimpleKeyboard | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const keyboardTheme =
    theme === 'dark' ? 'hg-theme-default dark' : 'hg-theme-default light'

  useEffect(() => {
    if (keyboardRef.current) {
      keyboardRef.current.setInput(value)
    }
  }, [value])

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()

      if (rect.bottom > window.innerHeight - 20) {
        setPlacement('top')
      } else {
        setPlacement('bottom')
      }
    }
  }, [])

  const handleKeyPress = (button: string) => {
    if (button === '{shift}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default')
      setIsLocked(false)
      if (onKeyPress) onKeyPress(button)
      return
    }

    if (button === '{lock}') {
      const newLocked = !isLocked
      setIsLocked(newLocked)
      setLayoutName(newLocked ? 'shift' : 'default')
      if (onKeyPress) onKeyPress(button)
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
        
        keyboard.setInput(newValue)
        keyboard.setCaretPosition(caretPos + 3)
        onChange(newValue)

        if (inputRef?.current) {
          setTimeout(() => {
            inputRef.current?.setSelectionRange(caretPos + 3, caretPos + 3)
          }, 0)
        }
      }
      if (onKeyPress) onKeyPress(button)
      return
    }

    if (onKeyPress) onKeyPress(button)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute left-[50%] z-[100] flex w-max translate-x-[-50%] flex-col items-center gap-2",
        placement === 'bottom' ? "top-full mt-2" : "bottom-full mb-2",
        className
      )}
    >
      {placement === 'top' && onSave && (
        <div className="flex w-[360px] justify-end sm:w-[420px]">
          <Button variant="secondary" size="sm" onClick={onSave} className="h-8 shadow-sm">
            Bestätigen
          </Button>
        </div>
      )}
      <div
        className="bg-card animate-in fade-in zoom-in-95 z-50 flex w-[360px] items-center gap-2 rounded-lg border p-1 shadow-xl duration-150 sm:w-[420px]"
      >
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
          onChange={onChange}
          onKeyPress={handleKeyPress}
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
      {placement === 'bottom' && onSave && (
        <div className="flex w-[360px] justify-end sm:w-[420px]">
          <Button variant="secondary" size="sm" onClick={onSave} className="h-8 shadow-sm">
            Bestätigen
          </Button>
        </div>
      )}
    </div>
  )
}
