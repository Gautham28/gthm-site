import { useEffect, useRef } from "react";

const IGNORE_SELECTOR = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  '[role="dialog"]',
  '[role="button"]',
  "[contenteditable='true']",
].join(",");

function isDrawPointer(event) {
  return event.pointerType === "mouse" || event.pointerType === "pen";
}

function applyStroke(ctx) {
  const stroke = getComputedStyle(document.documentElement).getPropertyValue("--draw-stroke").trim();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 2.25;
  ctx.strokeStyle = stroke || "rgba(250, 250, 250, 0.42)";
}

function pointOnCanvas(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function syncCanvasSize(canvas, ctx, host) {
  const dpr = window.devicePixelRatio || 1;
  const width = host.clientWidth;
  const height = host.clientHeight;
  const nextWidth = Math.max(1, Math.floor(width * dpr));
  const nextHeight = Math.max(1, Math.floor(height * dpr));

  if (canvas.width === nextWidth && canvas.height === nextHeight) {
    applyStroke(ctx);
    return;
  }

  const snapshot = document.createElement("canvas");
  snapshot.width = canvas.width;
  snapshot.height = canvas.height;

  if (canvas.width > 0 && canvas.height > 0) {
    snapshot.getContext("2d").drawImage(canvas, 0, 0);
  }

  canvas.width = nextWidth;
  canvas.height = nextHeight;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (snapshot.width > 0 && snapshot.height > 0) {
    ctx.drawImage(snapshot, 0, 0, snapshot.width / dpr, snapshot.height / dpr);
  }

  applyStroke(ctx);
}

export function DrawCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawing = {
      active: false,
      prevX: 0,
      prevY: 0,
      midX: 0,
      midY: 0,
    };

    const resize = () => syncCanvasSize(canvas, ctx, host);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const stop = () => {
      drawing.active = false;
      document.documentElement.classList.remove("is-drawing");
    };

    const onPointerDown = (event) => {
      if (!isDrawPointer(event) || event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest(IGNORE_SELECTOR)) return;

      const point = pointOnCanvas(canvas, event);
      event.preventDefault();
      drawing.active = true;
      drawing.prevX = point.x;
      drawing.prevY = point.y;
      drawing.midX = point.x;
      drawing.midY = point.y;
      applyStroke(ctx);
      document.documentElement.classList.add("is-drawing");
    };

    const onPointerMove = (event) => {
      if (!drawing.active) return;

      const point = pointOnCanvas(canvas, event);
      const midX = (drawing.prevX + point.x) / 2;
      const midY = (drawing.prevY + point.y) / 2;

      ctx.beginPath();
      ctx.moveTo(drawing.midX, drawing.midY);
      ctx.quadraticCurveTo(drawing.prevX, drawing.prevY, midX, midY);
      ctx.stroke();

      drawing.prevX = point.x;
      drawing.prevY = point.y;
      drawing.midX = midX;
      drawing.midY = midY;
    };

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);

    return () => {
      observer.disconnect();
      stop();
      window.removeEventListener("pointerdown", onPointerDown, { capture: true });
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("blur", stop);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="draw-canvas" />;
}
