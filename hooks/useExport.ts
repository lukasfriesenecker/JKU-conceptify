"use client";

import { useCallback } from "react";
import { jsPDF } from "jspdf";
import type { IConcept } from "@/types/Concept";
import type { IConnection } from "@/types/Connection";

interface UseExportProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  title: string;
  concepts: IConcept[];
  connections: IConnection[];
  getEndpointCenter: (
    id: number,
    type?: "concept" | "connection",
  ) => { x: number; y: number };
}

function useExport({
  svgRef,
  title,
  concepts,
  connections,
  getEndpointCenter,
}: UseExportProps) {
  const buildExportSvg = useCallback(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return null;

    const contentGroup = svgElement.querySelector(
      "g[transform]",
    ) as SVGGElement | null;
    if (!contentGroup) return null;

    const padding = 40;
    const offsetShift = 34;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const concept of concepts) {
      const w = parseFloat(concept.width) - offsetShift;
      const h = parseFloat(concept.height);

      minX = Math.min(minX, concept.x + offsetShift);
      minY = Math.min(minY, concept.y);
      maxX = Math.max(maxX, concept.x + w + offsetShift);
      maxY = Math.max(maxY, concept.y + h);
    }

    for (const connection of connections) {
      const from = getEndpointCenter(connection.from, connection.fromType);
      const to = getEndpointCenter(connection.to, connection.toType);
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      const labelWidth = parseFloat(connection.width) + 10;

      minX = Math.min(minX, from.x, to.x, mx - 45);
      minY = Math.min(minY, from.y, to.y, my - 15);
      maxX = Math.max(maxX, from.x, to.x, mx - 45 + labelWidth);
      maxY = Math.max(maxY, from.y, to.y, my + 15);
    }

    if (!isFinite(minX)) return null;

    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    const clonedGroup = contentGroup.cloneNode(true) as SVGGElement;
    clonedGroup.setAttribute("transform", `translate(${-minX}, ${-minY})`);

    const originalElements = contentGroup.querySelectorAll("*");
    const clonedElements = clonedGroup.querySelectorAll("*");

    const toRemove: Set<number> = new Set();
    for (let i = 0; i < originalElements.length; i++) {
      const original = originalElements[i] as SVGElement;
      if (
        original.tagName === "circle" &&
        original.classList.contains("fill-ring")
      ) {
        toRemove.add(i);
      }
      if (original.classList.contains("cursor-blink")) {
        toRemove.add(i);
      }
    }

    const bodyStyles = getComputedStyle(document.body);
    const bgColor = bodyStyles.getPropertyValue("background-color") || "white";

    const dotElement = svgElement.querySelector(
      "pattern circle",
    ) as SVGElement | null;
    const dotColor = dotElement
      ? getComputedStyle(dotElement).getPropertyValue("fill")
      : "gray";

    const styleProps = [
      "fill",
      "stroke",
      "stroke-width",
      "font-size",
      "font-family",
      "font-weight",
      "text-anchor",
      "dominant-baseline",
      "opacity",
    ];

    for (let i = 0; i < originalElements.length; i++) {
      const original = originalElements[i] as SVGElement;
      const cloned = clonedElements[i] as SVGElement;

      if (toRemove.has(i)) {
        cloned.remove();
        continue;
      }

      if (
        original.tagName === "g" &&
        original.hasAttribute("data-concept-id")
      ) {
        const x = parseFloat(
          original.getAttribute("transform")?.split("(")[1].split(",")[0] ||
            "0",
        );
        const y = parseFloat(
          original.getAttribute("transform")?.split(",")[1].split(")")[0] ||
            "0",
        );
        cloned.setAttribute("transform", `translate(${x + offsetShift}, ${y})`);
      }

      if (
        original.tagName === "rect" &&
        !original.classList.contains("fill-ring")
      ) {
        const origW = parseFloat(original.getAttribute("width") || "0");
        if (origW > 50) {
          cloned.setAttribute("width", String(origW - offsetShift));
        }
      }

      if (original.tagName === "text" || original.tagName === "tspan") {
        const currentX = original.getAttribute("x");
        const parentRect = original.closest("g")?.querySelector("rect");

        if (parentRect) {
          const rectX = parseFloat(parentRect.getAttribute("x") || "0");

          if (currentX === "49") {
            cloned.setAttribute("x", String(rectX + 15));
          } else if (currentX && currentX.includes(".")) {
            const diff = 30;
            const newX = parseFloat(currentX) - diff;
            cloned.setAttribute("x", String(newX));
          }
        }
      }

      const computed = window.getComputedStyle(original);

      for (const prop of styleProps) {
        const value = computed.getPropertyValue(prop);

        if (value) {
          cloned.style.setProperty(prop, value);
        }
      }

      if (original.classList.contains("stroke-primary")) {
        const borderEl = contentGroup.querySelector(
          '[class*="stroke-border"]',
        ) as SVGElement | null;
        if (borderEl) {
          const resolvedBorder =
            getComputedStyle(borderEl).getPropertyValue("stroke");
          cloned.style.setProperty("stroke", resolvedBorder);
        }
      }

      cloned.removeAttribute("class");
    }

    const exportSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    exportSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    exportSvg.setAttribute("width", `${width}`);
    exportSvg.setAttribute("height", `${height}`);
    exportSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const bgRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    bgRect.setAttribute("width", `${width}`);
    bgRect.setAttribute("height", `${height}`);
    bgRect.style.fill = bgColor;
    exportSvg.appendChild(bgRect);

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const pattern = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "pattern",
    );
    pattern.setAttribute("id", "export-dot-pattern");
    pattern.setAttribute("width", "20");
    pattern.setAttribute("height", "20");
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    const dot = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    dot.setAttribute("cx", "2");
    dot.setAttribute("cy", "2");
    dot.setAttribute("r", "1");
    dot.style.fill = dotColor;
    pattern.appendChild(dot);
    defs.appendChild(pattern);
    exportSvg.appendChild(defs);

    const dotBg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    dotBg.setAttribute("width", `${width}`);
    dotBg.setAttribute("height", `${height}`);
    dotBg.setAttribute("fill", "url(#export-dot-pattern)");
    exportSvg.appendChild(dotBg);

    exportSvg.appendChild(clonedGroup);

    return { exportSvg, width, height };
  }, [svgRef, concepts, connections, getEndpointCenter]);

  const renderToCanvas = useCallback(
    (
      format: "image/png" | "image/jpeg",
      extension: string,
      quality?: number,
    ) => {
      const result = buildExportSvg();
      if (!result) return;

      const { exportSvg, width, height } = result;

      const svgString = new XMLSerializer().serializeToString(exportSvg);
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const context = canvas.getContext("2d");
      if (!context) return;

      const img = new Image();
      img.onload = () => {
        context.scale(scale, scale);
        context.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        canvas.toBlob(
          (outputBlob) => {
            if (!outputBlob) return;

            const link = document.createElement("a");
            link.download = `${title}.${extension}`;
            link.href = URL.createObjectURL(outputBlob);
            link.click();
            URL.revokeObjectURL(link.href);
          },
          format,
          quality,
        );
      };

      img.src = url;
    },
    [buildExportSvg, title],
  );

  const exportAsPng = useCallback(() => {
    renderToCanvas("image/png", "png");
  }, [renderToCanvas]);

  const exportAsJpg = useCallback(() => {
    renderToCanvas("image/jpeg", "jpg", 0.95);
  }, [renderToCanvas]);

  const exportAsPdf = useCallback(() => {
    const result = buildExportSvg();
    if (!result) return;

    const { exportSvg, width, height } = result;

    const svgString = new XMLSerializer().serializeToString(exportSvg);
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;

    const context = canvas.getContext("2d");
    if (!context) return;

    const img = new Image();

    img.onload = () => {
      context.scale(scale, scale);
      context.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      const imgData = canvas.toDataURL("image/png");

      const orientation = width > height ? "l" : "p";
      const pdf = new jsPDF({
        orientation,
        unit: "px",
        format: [width, height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`${title}.pdf`);
    };

    img.src = url;
  }, [buildExportSvg, title]);

  return { exportAsPng, exportAsJpg, exportAsPdf };
}

export default useExport;
