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
import Keyboard from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
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
  const [layoutName, setLayoutName] = useState('default')

  useEffect(() => {
    setTitle(initialTitle)
    setDescription(initialDescription)
  }, [initialTitle, initialDescription])

  const keyboard = useRef<any>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null)
  const keyboardTheme =
    theme === 'dark' ? 'hg-theme-default dark' : 'hg-theme-default light'

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

  const onKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default')
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
                  <MenubarItem disabled={isSaveDisabled} onClick={onSaveFile}>
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
              <MenubarItem disabled={!session || isSaveDisabled} onClick={onSaveOnline}>
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
          onClick={isFileSystemSupported ? onSave : onDownload}
          disabled={isFileSystemSupported ? isSaveDisabled : false}
        >
          {isFileSystemSupported ? (
            <Save className="text-card-foreground size-6" />
          ) : (
            <FileDown className="text-card-foreground size-6" />
          )}
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
            <Button variant="ghost">
              {title.length > 20 ? title.slice(0, 20) + '…' : title}
              <Separator orientation="vertical" className="hidden 2xl:flex" />
              <span className="hidden 2xl:inline">
                {description.length > 40
                  ? description.slice(0, 40) + '…'
                  : description}
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
              />
            </div>
            {mounted && (
              <Keyboard
                keyboardRef={(r) => (keyboard.current = r)}
                layoutName={layoutName}
                layout={{
                  default: [
                    '^ 1 2 3 4 5 6 7 8 9 0 ß ´ {bksp}',
                    '{tab} q w e r t z u i o p ü +',
                    '{lock} a s d f g h j k l ö ä # {enter}',
                    '{shift} < y x c v b n m , . - {shift}',
                    '( ) {space}',
                  ],
                  shift: [
                    '° ! " § $ % & / { } = ? ` {bksp}',
                    '{tab} Q W E R T Z U I O P Ü *',
                    '{lock} A S D F G H J K L Ö Ä \' {enter}',
                    '{shift} > Y X C V B N M ; : _ {shift}',
                    '[ ] {space}',
                  ],
                }}
                onChange={handleKeyboardChange}
                onKeyPress={onKeyPress}
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
