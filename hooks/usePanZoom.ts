"use client";

import interact from "interactjs";
import { useEffect, useRef, useState } from "react";

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const SCALE_SENSITIVITY = 2;

function usePanZoom() {
  const ref = useRef<SVGSVGElement>(null);

  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [panZoomLocked, setPanZoomLocked] = useState(false);

  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const panZoomLockedRef = useRef(panZoomLocked);
  panZoomLockedRef.current = panZoomLocked;

  useEffect(() => {
    const svgElement = ref.current;
    if (!svgElement) return;

    const interactable = interact(svgElement)
      .draggable({
        ignoreFrom: ".fill-ring",
        listeners: {
          move(event) {
            if (panZoomLockedRef.current) return;
            setViewport((prev) => ({
              ...prev,
              x: prev.x + event.dx,
              y: prev.y + event.dy,
            }));
          },
        },
      })
      .gesturable({
        listeners: {
          move(event) {
            if (panZoomLockedRef.current) return;
            const current = viewportRef.current;

            let newScale = current.scale * (1 + event.ds * SCALE_SENSITIVITY);
            newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

            const scaleRatio = newScale / current.scale;

            const svgElementPosition = svgElement.getBoundingClientRect();
            const localX = event.client.x - svgElementPosition.left;
            const localY = event.client.y - svgElementPosition.top;

            const newX = localX - (localX - current.x) * scaleRatio;
            const newY = localY - (localY - current.y) * scaleRatio;

            setViewport({ x: newX, y: newY, scale: newScale });
          },
        },
      });

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (panZoomLockedRef.current) return;

      const current = viewportRef.current;
      const delta = (-event.deltaY / 1500) * SCALE_SENSITIVITY;

      let newScale = current.scale * (1 + delta);
      newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

      const scaleRatio = newScale / current.scale;

      const svgElementPosition = svgElement.getBoundingClientRect();
      const localX = event.clientX - svgElementPosition.left;
      const localY = event.clientY - svgElementPosition.top;

      const newX = localX - (localX - current.x) * scaleRatio;
      const newY = localY - (localY - current.y) * scaleRatio;

      setViewport({ x: newX, y: newY, scale: newScale });
    };

    svgElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      interactable.unset();
      svgElement.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const resetZoom = () => {
    const current = viewportRef.current;
    const svgElement = ref.current;
    if (!svgElement) {
      setViewport({ x: 0, y: 0, scale: 1 });
      return;
    }

    const rect = svgElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newX = centerX - (centerX - current.x) / current.scale;
    const newY = centerY - (centerY - current.y) / current.scale;

    setViewport({ x: newX, y: newY, scale: 1 });
  };

  return { ref, viewport, resetZoom, panZoomLocked, setPanZoomLocked };
}

export default usePanZoom;
