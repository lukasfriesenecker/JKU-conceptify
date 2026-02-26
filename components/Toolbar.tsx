'use client'

import {
  Cloud,
  Download,
  File,
  FileDown,
  FolderOpen,
  FolderPlus,
  Menu,
  Moon,
  Save,
  SlidersVertical,
  Sun,
} from 'lucide-react'
import type { SimpleKeyboard } from 'react-simple-keyboard/build/interfaces'
import { BaseKeyboard } from './BaseKeyboard'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useTheme } from './ThemeProvider'
import { authClient } from '@/lib/auth-client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useState, useRef, useEffect } from 'react'

interface ToolbarProps {
  title: string
  description: string
  onSave: () => void
  onSaveFile: () => void
  onSaveAs: () => void
  onSaveProjectInfo: (title: string, desc: string) => void
  onOpen: () => void
  onNewProject: () => void
  onDownload: () => void
  onSaveOnline: () => void
  isSaveDisabled: boolean
  isSaveFileDisabled: boolean
  isSaveOnlineDisabled: boolean
  supportsFileSystemAccess: boolean
  zoomLevel: number
  onResetZoom: () => void
  panZoomLocked: boolean
  onPanZoomLockedChange: (locked: boolean) => void
  onExportPng: () => void
  onExportJpg: () => void
  onExportPdf: () => void
  hideConnectionPoints: boolean
  onHideConnectionPointsChange: (hidden: boolean) => void
}

function Toolbar({
  onSave,
  onSaveFile,
  onSaveAs,
  onSaveProjectInfo,
  title: initialTitle,
  description: initialDescription,
  onOpen,
  onNewProject,
  onDownload,
  onSaveOnline,
  isSaveDisabled,
  isSaveFileDisabled,
  isSaveOnlineDisabled,
  supportsFileSystemAccess,
  zoomLevel,
  onResetZoom,
  panZoomLocked,
  onPanZoomLockedChange,
  onExportPng,
  onExportJpg,
  onExportPdf,
  hideConnectionPoints,
  onHideConnectionPointsChange,
}: ToolbarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { theme, setTheme } = useTheme()
  const { data: session } = authClient.useSession()
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [activeInput, setActiveInput] = useState<
    'title' | 'description' | null
  >(null)

  useEffect(() => {
    setTitle(initialTitle)
    setDescription(initialDescription)
  }, [initialTitle, initialDescription])

  const keyboard = useRef<SimpleKeyboard | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyboardChange = (input: string) => {
    if (activeInput === 'title') {
      setTitle(input)
    } else if (activeInput === 'description') {
      setDescription(input)
    }
  }
  const handleInputFocus = (inputName: 'title' | 'description') => {
    setActiveInput(inputName)
    setTimeout(() => {
      titleInputRef.current?.setSelectionRange(
        titleInputRef.current.value.length,
        titleInputRef.current.value.length
      )
    }, 1)
    if (keyboard.current) {
      const currentValue = inputName === 'title' ? title : description
      keyboard.current.setInput(currentValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.currentTarget
      const start = target.selectionStart ?? 0
      const end = target.selectionEnd ?? 0
      const val = target.value
      const newValue = val.substring(0, start) + '   ' + val.substring(end)

      handleKeyboardChange(newValue)
      
      if (keyboard.current) {
         keyboard.current.setInput(newValue)
         keyboard.current.setCaretPosition(start + 3)
      }
      
      setTimeout(() => {
        target.setSelectionRange(start + 3, start + 3)
      }, 0)
    }
  }

  const onKeyPress = (button: string) => {
    if (button === '{tab}') {
      const keyboardObj = keyboard.current
      if (keyboardObj) {
        const currentInput = keyboardObj.getInput() ?? ''
        const caretPos = keyboardObj.getCaretPosition() ?? currentInput.length
        const newValue =
          currentInput.slice(0, caretPos) + '   ' + currentInput.slice(caretPos)
        
        keyboardObj.setInput(newValue)
        keyboardObj.setCaretPosition(caretPos + 3)
        handleKeyboardChange(newValue)
        
        if (activeInput === 'title' && titleInputRef.current) {
           setTimeout(() => titleInputRef.current?.setSelectionRange(caretPos + 3, caretPos + 3), 1)
        } else if (activeInput === 'description' && descriptionInputRef.current) {
           setTimeout(() => descriptionInputRef.current?.setSelectionRange(caretPos + 3, caretPos + 3), 1)
        }
      }
    }
  }

  const isFileSystemSupported = mounted && supportsFileSystemAccess

  return (
    <div className="bg-card absolute left-1/2 flex w-full -translate-x-1/2 justify-between border p-2 shadow-2xl md:rounded-sm lg:top-4 lg:w-2xl 2xl:w-3xl">
      <div className="flex h-9 w-1/4 flex-row gap-2">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className="px-4 py-2">
              <span className="hidden md:flex">Datei</span>
              <span className="flex md:hidden">
                <Menu className="text-card-foreground size-6" />
              </span>
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={onNewProject}>
                <File className="text-card-foreground size-4" />
                Neues Projekt
              </MenubarItem>
              <MenubarItem onClick={onOpen}>
                <FolderOpen className="text-card-foreground size-4" />
                Datei öffnen
              </MenubarItem>
              {isFileSystemSupported ? (
                <>
                  <MenubarItem disabled={isSaveFileDisabled} onClick={onSaveFile}>
                    <Save className="text-card-foreground size-4" />
                    Datei speichern
                  </MenubarItem>
                  <MenubarItem onClick={onSaveAs}>
                    <FolderPlus className="text-card-foreground size-4" />
                    Datei speichern unter
                  </MenubarItem>
                </>
              ) : (
                <MenubarItem onClick={onDownload}>
                  <FileDown className="text-card-foreground size-4" />
                  Herunterladen
                </MenubarItem>
              )}
              <MenubarItem disabled={!session || isSaveOnlineDisabled} onClick={onSaveOnline}>
                <Cloud className="text-card-foreground size-4" />
                Online speichern
              </MenubarItem>
              <MenubarSub>
                <MenubarSubTrigger className="hidden md:flex">
                  <Download className="text-card-foreground size-4" />
                  Exportieren
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={onExportPdf}>PDF</MenubarItem>
                  <MenubarItem onClick={onExportJpg}>JPG</MenubarItem>
                  <MenubarItem onClick={onExportPng}>PNG</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <Accordion type="single" className="flex md:hidden" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex gap-2">
                      <Download className="text-card-foreground size-4" />
                      Exportieren
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <MenubarItem onClick={onExportPdf}>PDF</MenubarItem>
                    <MenubarItem onClick={onExportJpg}>JPG</MenubarItem>
                    <MenubarItem onClick={onExportPng}>PNG</MenubarItem>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <Separator orientation="vertical" className="hidden md:flex" />
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={onSave}
          disabled={isSaveDisabled}
        >
          <Save className="text-card-foreground size-6" />
        </Button>
      </div>

      <div className="flex w-1/2 justify-center">
        <Popover
          open={popoverOpen}
          onOpenChange={(open) => {
            if (!open) {
              setTitle(initialTitle)
              setDescription(initialDescription)
              setActiveInput(null)
            }
            setPopoverOpen(open)
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="ghost" className="max-w-[120px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
              <span className="truncate block w-full overflow-hidden text-ellipsis whitespace-nowrap text-center">
                {title || 'Titel'}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="flex flex-col gap-6 md:w-xl">
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="title">Titel</Label>
              <Input
                ref={titleInputRef}
                type="text"
                id="title"
                placeholder="Titel"
                value={title}
                maxLength={60}
                onChange={(e) => handleKeyboardChange(e.target.value)}
                onFocus={() => handleInputFocus('title')}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="grid w-full gap-3">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                ref={descriptionInputRef}
                id="description"
                placeholder="Beschreibung"
                value={description}
                maxLength={200}
                onChange={(e) => handleKeyboardChange(e.target.value)}
                onFocus={() => handleInputFocus('description')}
                onKeyDown={handleKeyDown}
              />
            </div>
            {mounted && (
              <BaseKeyboard
                keyboardRef={(r) => (keyboard.current = r)}
                onChange={handleKeyboardChange}
                onKeyPress={onKeyPress}
              />
            )}
            <div className="flex flex-col justify-end gap-4 md:flex-row md:gap-2">
              <Button
                onClick={() => {
                  setTitle(initialTitle)
                  setDescription(initialDescription)
                  setActiveInput(null)
                  setPopoverOpen(false)
                }}
                variant="secondary"
              >
                Abbrechen
              </Button>
              <Button
                disabled={!title.trim() || !description.trim()}
                onClick={() => {
                  onSaveProjectInfo(title, description)
                  setActiveInput(null)
                  setPopoverOpen(false)
                }}
              >
                Speichern
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex w-1/4 justify-end gap-2">
        <Button
          variant="ghost"
          className="hidden items-center px-1 font-medium md:flex"
          onClick={onResetZoom}
        >
          {Math.round(zoomLevel * 100)} %
        </Button>
        <Separator orientation="vertical" className="hidden md:flex" />
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={() => {
            if (theme === 'light') {
              setTheme('dark')
            } else {
              setTheme('light')
            }
          }}
        >
          <Sun className="text-card-foreground size-6 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="text-card-foreground absolute size-6 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
        <Separator orientation="vertical" className="hidden md:flex" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <SlidersVertical className="text-card-foreground size-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="md:w-72">
            <div className="flex flex-col gap-4">
              <h4>Einstellungen</h4>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="panZoomLock"
                  checked={panZoomLocked}
                  onCheckedChange={(checked) =>
                    onPanZoomLockedChange(checked === true)
                  }
                />
                <Label htmlFor="panZoomLock">Bewegungen sperren</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="edit"
                  checked={hideConnectionPoints}
                  onCheckedChange={(checked) =>
                    onHideConnectionPointsChange(checked === true)
                  }
                />
                <Label htmlFor="edit">Verbindungspunkte ausblenden</Label>
              </div>

              <h4 className="flex md:hidden">Anzeigemodus</h4>

              <Button
                variant="ghost"
                size="icon"
                className="flex md:hidden"
                onClick={() => {
                  if (theme === 'light') {
                    setTheme('dark')
                  } else {
                    setTheme('light')
                  }
                }}
              >
                <Sun className="text-card-foreground size-6 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="text-card-foreground absolute size-6 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default Toolbar
