"use client";

import type { IConcept } from "@/types/Concept";
import type { IConnection } from "@/types/Connection";
import { useCallback, useEffect, useState } from "react";

function useConceptMapData() {
  const STORAGE_KEY = "concept-map-data";

  const [title, setTitle] = useState(() => {
    if (typeof window === "undefined") return "Neue Concept Map";

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return "Neue Concept Map";

    try {
      return JSON.parse(stored).title ?? "Neue Concept Map";
    } catch {
      return "Neue Concept Map";
    }
  });

  const [description, setDescription] = useState(() => {
    if (typeof window === "undefined") return "Neue Concept Map Beschreibung";

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return "Neue Concept Map Beschreibung";

    try {
      return JSON.parse(stored).description ?? "Neue Concept Map Beschreibung";
    } catch {
      return "Neue Concept Map Beschreibung";
    }
  });

  const [concepts, setConcepts] = useState<IConcept[]>(() => {
    if (typeof window === "undefined") {
      return [
        {
          id: 0,
          label: "Concept 0",
          x: 150,
          y: 200,
          width: "100px",
          height: "50px",
        },
        {
          id: 1,
          label: "Concept 1",
          x: 150,
          y: 500,
          width: "100px",
          height: "50px",
        },
      ];
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored)
      return [
        {
          id: 0,
          label: "Concept 0",
          x: 150,
          y: 200,
          width: "100px",
          height: "50px",
        },
        {
          id: 1,
          label: "Concept 1",
          x: 150,
          y: 500,
          width: "100px",
          height: "50px",
        },
      ];

    try {
      return JSON.parse(stored).concepts ?? [];
    } catch {
      return [];
    }
  });

  const [connections, setConnections] = useState<IConnection[]>(() => {
    if (typeof window === "undefined")
      return [{ id: 0, label: "Connection 0", from: 0, to: 1, width: "90" }];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored)
      return [{ id: 0, label: "Connection 0", from: 0, to: 1, width: "90" }];

    try {
      return JSON.parse(stored).connections ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const data = {
      title,
      description,
      concepts,
      connections,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [concepts, connections, title, description]);

  const handleConceptDrag = useCallback(
    (id: number, dx: number, dy: number) => {
      setConcepts((prevConcepts) =>
        prevConcepts.map((concept) => {
          if (concept.id === id) {
            return {
              ...concept,
              x: concept.x + dx,
              y: concept.y + dy,
            };
          }

          return concept;
        }),
      );
    },
    [],
  );

  const handleLabelChange = useCallback(
    (id: number, value: string, type: string) => {
      if (type == "concept") {
        setConcepts((prevConcepts) =>
          prevConcepts.map((concept) => {
            if (concept.id === id) {
              return {
                ...concept,
                label: value,
              };
            }
            return concept;
          }),
        );
      } else {
        setConnections((prevConnections) =>
          prevConnections.map((con) => {
            if (con.id === id) {
              return {
                ...con,
                label: value,
              };
            }
            return con;
          }),
        );
      }
    },
    [],
  );

  const handleColorChange = useCallback(
    (id: number, color: any, type: string) => {
      setConcepts((prevConcepts) =>
        prevConcepts.map((concept) => {
          if (concept.id === id) {
            return {
              ...concept,
              ...(type === "background"
                ? { backgroundColor: color.hex }
                : { textColor: color.hex }),
            };
          }
          return concept;
        }),
      );
    },
    [],
  );
  const handleConceptScale = useCallback(
    (id: number, dx: number, dy: number, width: string, height: string) => {
      setConcepts((prevConcepts) =>
        prevConcepts.map((concept) => {
          if (concept.id === id) {
            return {
              ...concept,
              x: concept.x + dx,
              y: concept.y + dy,
              width: width,
              height: height,
            };
          }
          return concept;
        }),
      );
    },
    [],
  );

  const deleteConcept = useCallback((id: number) => {
    setConcepts((prev) => prev.filter((concept) => concept.id !== id));
    setConnections((prev) =>
      prev
        .filter((conn) => conn.from !== id && conn.to !== id)
        .map((conn) => {
          if (conn.extraTargets?.includes(id)) {
            return {
              ...conn,
              extraTargets: conn.extraTargets.filter((t) => t !== id),
            };
          }
          return conn;
        }),
    );
  }, []);

  const deleteConnection = useCallback((id: number) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id));
  }, []);

  const getConceptCenter = (id: number) => {
    const concept = concepts.find((c) => c.id === id);

    if (!concept) return { x: 0, y: 0 };

    return {
      x: concept.x + parseFloat(concept.width) / 2,
      y: concept.y + parseFloat(concept.height) / 2,
    };
  };

  const getConnectionCenter = (id: number): { x: number; y: number } => {
    const connection = connections.find((c) => c.id === id);
    if (!connection) return { x: 0, y: 0 };

    const fromPos = getEndpointCenter(connection.from, connection.fromType);
    const toPos = getEndpointCenter(connection.to, connection.toType);
    return {
      x: (fromPos.x + toPos.x) / 2,
      y: (fromPos.y + toPos.y) / 2,
    };
  };

  const getEndpointCenter = (
    id: number,
    type?: "concept" | "connection",
  ): { x: number; y: number } => {
    if (type === "connection") {
      return getConnectionCenter(id);
    }
    return getConceptCenter(id);
  };

  const lableChangeWidthAdjustment = useCallback(
    (id: number, value: string, type: string, heightValue?: string) => {
      if (type == "concept") {
        setConcepts((prevConcepts) =>
          prevConcepts.map((concept) => {
            if (concept.id === id) {
              return {
                ...concept,
                width: value,
                ...(heightValue ? { height: heightValue } : {}),
              };
            }
            return concept;
          }),
        );
      } else {
        setConnections((prevConnections) =>
          prevConnections.map((con) => {
            if (con.id === id) {
              return {
                ...con,
                width: value,
              };
            }
            return con;
          }),
        );
      }
    },
    [],
  );

  const addConcept = useCallback(
    (x: number, y: number, onCreated?: (id: number) => void) => {
      setConcepts((prev) => {
        const newId =
          prev.length > 0 ? Math.max(...prev.map((c) => c.id)) + 1 : 0;
        const newConcept: IConcept = {
          id: newId,
          label: "Neues Konzept",
          x: x - 100 / 2,
          y: y - 50 / 2,
          width: "100px",
          height: "50px",
          backgroundColor: "",
          textColor: "",
        };
        if (onCreated) onCreated(newId);
        return [...prev, newConcept];
      });
    },
    [],
  );

  return {
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
    lableChangeWidthAdjustment,
    addConcept,
  };
}

export default useConceptMapData;
