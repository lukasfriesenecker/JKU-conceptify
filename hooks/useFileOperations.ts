"use client";

/// <reference types="@types/wicg-file-system-access" />
import type { IConcept } from "@/types/Concept";
import type { IConnection } from "@/types/Connection";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseFileOperationsProps {
  title: string;
  description: string;
  concepts: IConcept[];
  connections: IConnection[];
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setConcepts: React.Dispatch<React.SetStateAction<IConcept[]>>;
  setConnections: React.Dispatch<React.SetStateAction<IConnection[]>>;
  clearSelection: () => void;
}

function useFileOperations({
  title,
  description,
  concepts,
  connections,
  setTitle,
  setDescription,
  setConcepts,
  setConnections,
  clearSelection,
}: UseFileOperationsProps) {
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
    null,
  );
  const [cloudProjectId, setCloudProjectId] = useState<string | null>(null);
  const [currentSaveMethod, setCurrentSaveMethod] = useState<"file" | "online" | null>(null);
  const [isSaveMethodDialogOpen, setIsSaveMethodDialogOpen] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const initialData = {
      title,
      description,
      concepts,
      connections,
    };
    setLastSavedData(JSON.stringify(initialData));
  }, []);

  const currentDataString = JSON.stringify({
    title,
    description,
    concepts,
    connections,
  });

  const hasChanges = currentDataString !== lastSavedData;

  const supportsFileSystemAccess =
    typeof window !== "undefined" &&
    "showSaveFilePicker" in window &&
    (() => {
      try {
        return window.self === window.top;
      } catch {
        return false;
      }
    })();

  const getProjectData = useCallback(() => {
    return { title, description, concepts, connections };
  }, [title, description, concepts, connections]);

  const writeToFile = async (handle: FileSystemFileHandle) => {
    const projectData = getProjectData();

    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(projectData, null, 2));
    await writable.close();

    setLastSavedData(JSON.stringify(projectData));
  };

  const handleDownload = () => {
    const projectData = getProjectData();
    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "concept_map.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setLastSavedData(JSON.stringify(projectData));
    toast.success("Datei heruntergeladen", { position: "bottom-center" });
    return true;
  };

  const handleSaveAs = async (): Promise<boolean> => {
    if (!supportsFileSystemAccess) {
      return handleDownload();
    }

    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "concept_map.json",
        types: [
          {
            description: "JSON File",
            accept: { "application/json": [".json"] },
          },
        ],
      });

      setFileHandle(handle);
      setCurrentSaveMethod("file");
      await writeToFile(handle);
      toast.success("Datei gespeichert", { position: "bottom-center" });
      return true;
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Fehler beim Speichern der Datei", {
          position: "bottom-center",
        });
        console.error(error);
      }
      return false;
    }
  };

  const handleSaveOnline = async (): Promise<boolean> => {
    try {
      const projectData = getProjectData();
      const payload = {
        id: cloudProjectId,
        ...projectData,
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save project");
      }

      const data = await res.json();
      setCloudProjectId(data.id);
      setCurrentSaveMethod("online");
      setLastSavedData(JSON.stringify(projectData));

      toast.success("Online gespeichert", { position: "bottom-center" });
      return true;
    } catch (error) {
      toast.error("Fehler beim Speichern", { position: "bottom-center" });
      return false;
    }
  };

  const handleSave = async (): Promise<boolean> => {
    if (currentSaveMethod === "online") {
      return handleSaveOnline();
    }
    
    if (currentSaveMethod === "file") {
      if (!supportsFileSystemAccess) {
        return handleDownload();
      }

      try {
        if (!fileHandle) {
          return handleSaveAs();
        }

        await writeToFile(fileHandle);

        toast.success("Datei gespeichert", { position: "bottom-center" });
        return true;
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Fehler beim Speichern der Datei", { position: "bottom-center" });
        }
        
        return false;
      }
    }

    setIsSaveMethodDialogOpen(true);
    return false;
  };

  const handleSaveProjectInfo = (newTitle: string, newDesc: string) => {
    setTitle(newTitle);
    setDescription(newDesc);
  };

  const loadFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        setConcepts(data.concepts);
        setConnections(data.connections);
        setTitle(data.title);
        setDescription(data.description);
        setFileHandle(null);
        setCloudProjectId(null);
        setCurrentSaveMethod("file");
        clearSelection();
        setLastSavedData(JSON.stringify(data));

        toast.success("Projekt geöffnet", { position: "bottom-center" });
      } catch {
        toast.error("Fehler beim Öffnen der Datei");
      }
    };
    reader.readAsText(file);
  };

  const handleOpen = async () => {
    if (!supportsFileSystemAccess) {
      fileInputRef.current?.click();
      return;
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: "JSON File",
            accept: { "application/json": [".json"] },
          },
        ],
        multiple: false,
      });

      const file = await handle.getFile();
      const content = await file.text();
      const data = JSON.parse(content);

      setConcepts(data.concepts);
      setConnections(data.connections);
      setTitle(data.title);
      setDescription(data.description);
      setFileHandle(handle);
      setCloudProjectId(null);
      setCurrentSaveMethod("file");
      clearSelection();
      setLastSavedData(JSON.stringify(data));

      toast.success("Projekt geöffnet", { position: "bottom-center" });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Fehler beim Öffnen der Datei");
        console.error(error);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFileContent(file);
    }

    e.target.value = "";
  };

  const handleNewProject = () => {
    setConcepts([]);
    setConnections([]);
    setTitle("Neue Concept Map");
    setDescription("Neue Concept Map Beschreibung");
    setFileHandle(null);
    setCloudProjectId(null);
    setCurrentSaveMethod(null);
    clearSelection();
    setLastSavedData("");

    toast.success("Neues Projekt erstellt", { position: "bottom-center" });
  };

  return {
    handleSave,
    handleSaveAs,
    handleSaveOnline,
    handleSaveProjectInfo,
    handleOpen,
    handleNewProject,
    handleDownload,
    handleFileInputChange,
    hasChanges,
    supportsFileSystemAccess,
    fileInputRef,
    isSaveMethodDialogOpen,
    setIsSaveMethodDialogOpen,
    currentSaveMethod,
  };
}

export default useFileOperations;
