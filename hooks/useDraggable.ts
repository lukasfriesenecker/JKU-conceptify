"use client";

import interact from "interactjs";
import { useEffect, useRef } from "react";

function useDraggable(
  id: number,
  scale: number,
  onDrag: (id: number, dx: number, dy: number) => void,
) {
  const ref = useRef<SVGGElement | null>(null);

  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const onDragRef = useRef(onDrag);
  onDragRef.current = onDrag;

  useEffect(() => {
    if (!ref.current) return;

    const interactable = interact(ref.current).draggable({
      ignoreFrom: ".fill-ring",
      listeners: {
        move(event) {
          onDragRef.current(
            id,
            event.dx / scaleRef.current,
            event.dy / scaleRef.current,
          );
        },
      },
    });

    return () => {
      interactable.unset();
    };
  }, [id]);

  return ref;
}

export default useDraggable;
