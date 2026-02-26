'use client'

import { useState } from 'react'
import Keyboard from 'react-simple-keyboard'
import type { SimpleKeyboard } from 'react-simple-keyboard/build/interfaces'
import 'react-simple-keyboard/build/css/index.css'
import { useTheme } from './ThemeProvider'

interface BaseKeyboardProps {
  keyboardRef?: (r: SimpleKeyboard | null) => void
  onChange?: (input: string) => void
  onKeyPress?: (button: string) => void
  onInit?: (keyboard: SimpleKeyboard) => void
}

export function BaseKeyboard({
  keyboardRef,
  onChange,
  onKeyPress,
  onInit,
}: BaseKeyboardProps) {
  const [layoutName, setLayoutName] = useState('default')
  const [isLocked, setIsLocked] = useState(false)
  const { theme } = useTheme()
  const keyboardTheme =
    theme === 'dark' ? 'hg-theme-default dark' : 'hg-theme-default light'

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

    if (onKeyPress) onKeyPress(button)
  }

  return (
    <Keyboard
      keyboardRef={keyboardRef}
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
      onInit={onInit}
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
  )
}
