'use client'

import { useEffect, useRef, useState } from 'react'
import type { SimpleKeyboard } from 'react-simple-keyboard/build/interfaces'
import { BaseKeyboard } from '@/components/keyboard/BaseKeyboard'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface UIKeyboardProps {
  value: string
  onChange: (value: string) => void
  onKeyPress?: (button: string) => void
  onSave?: () => void
  className?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function UIKeyboard({
  value,
  onChange,
  onKeyPress,
  onSave,
  className,
  inputRef,
}: UIKeyboardProps) {
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  const keyboardRef = useRef<SimpleKeyboard | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
        'absolute left-[50%] z-[100] flex w-max translate-x-[-50%] flex-col items-center gap-2',
        placement === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
        className
      )}
    >
      {placement === 'top' && onSave && (
        <div className="flex w-[360px] justify-end sm:w-[420px]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onSave}
            className="h-8 shadow-sm"
          >
            Bestätigen
          </Button>
        </div>
      )}
      <div className="bg-card animate-in fade-in zoom-in-95 z-50 flex w-[360px] items-center gap-2 rounded-lg border p-1 shadow-xl duration-150 sm:w-[420px]">
        <BaseKeyboard
          keyboardRef={(r) => (keyboardRef.current = r)}
          onChange={onChange}
          onKeyPress={handleKeyPress}
        />
      </div>
      {placement === 'bottom' && onSave && (
        <div className="flex w-[360px] justify-end sm:w-[420px]">
          <Button
            variant="secondary"
            size="sm"
            onClick={onSave}
            className="h-8 shadow-sm"
          >
            Bestätigen
          </Button>
        </div>
      )}
    </div>
  )
}
