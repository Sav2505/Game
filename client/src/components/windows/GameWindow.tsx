import { type MouseEvent as ReactMouseEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

interface WindowSize {
  width: number;
  height?: number;
}

interface WindowResizeLimits {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

interface WindowPosition {
  x: number;
  y: number;
}

interface GameWindowProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  initialPosition?: WindowPosition;
  size?: WindowSize;
  resizable?: boolean;
  resizeLimits?: WindowResizeLimits;
}

interface DragState {
  offsetX: number;
  offsetY: number;
}

interface ResizeState {
  startMouseX: number;
  startMouseY: number;
  startWidth: number;
  startHeight: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function GameWindow({
  isOpen,
  title,
  onClose,
  children,
  className,
  bodyClassName,
  initialPosition,
  size = { width: 840 },
  resizable = false,
  resizeLimits
}: GameWindowProps) {
  const windowRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);

  const resolvedMinWidth = resizeLimits?.minWidth ?? 520;
  const resolvedMaxWidth = resizeLimits?.maxWidth ?? 1350;
  const resolvedMinHeight = resizeLimits?.minHeight ?? 360;
  const resolvedMaxHeight = resizeLimits?.maxHeight ?? 1000;

  const resolvedInitialSize = useMemo<Required<WindowSize>>(
    () => ({
      width: size.width,
      height: size.height ?? 620
    }),
    [size.width, size.height]
  );

  const defaultPosition = useMemo<WindowPosition>(() => {
    if (initialPosition) {
      return initialPosition;
    }

    const fallbackWidth = size.width;
    const x = Math.max(24, Math.round((window.innerWidth - fallbackWidth) / 2));
    const y = Math.max(24, Math.round(window.innerHeight * 0.12));
    return { x, y };
  }, [initialPosition?.x, initialPosition?.y, size.width]);

  const [position, setPosition] = useState<WindowPosition>(defaultPosition);
  const [currentSize, setCurrentSize] = useState<Required<WindowSize>>(resolvedInitialSize);

  useEffect(() => {
    setPosition(defaultPosition);
  }, [defaultPosition]);

  useEffect(() => {
    setCurrentSize(resolvedInitialSize);
  }, [resolvedInitialSize]);

  const constrainSize = (requestedWidth: number, requestedHeight: number, x: number, y: number) => {
    const viewportMaxWidth = Math.max(resolvedMinWidth, window.innerWidth - x);
    const viewportMaxHeight = Math.max(resolvedMinHeight, window.innerHeight - y);
    const allowedMaxWidth = Math.min(resolvedMaxWidth, viewportMaxWidth);
    const allowedMaxHeight = Math.min(resolvedMaxHeight, viewportMaxHeight);

    return {
      width: clamp(requestedWidth, resolvedMinWidth, allowedMaxWidth),
      height: clamp(requestedHeight, resolvedMinHeight, allowedMaxHeight)
    };
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const keepInViewport = () => {
      const element = windowRef.current;
      if (!element) {
        return;
      }

      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const maxX = Math.max(0, window.innerWidth - width);
      const maxY = Math.max(0, window.innerHeight - height);

      setPosition((previous) => ({
        x: clamp(previous.x, 0, maxX),
        y: clamp(previous.y, 0, maxY)
      }));

      setCurrentSize((previous) => constrainSize(previous.width, previous.height, position.x, position.y));
    };

    keepInViewport();
    window.addEventListener('resize', keepInViewport);

    return () => {
      window.removeEventListener('resize', keepInViewport);
    };
  }, [isOpen, position.x, position.y, resolvedMaxHeight, resolvedMaxWidth, resolvedMinHeight, resolvedMinWidth]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const dragState = dragStateRef.current;
      const element = windowRef.current;
      const resizeState = resizeStateRef.current;

      if (dragState && element) {
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        const maxX = Math.max(0, window.innerWidth - width);
        const maxY = Math.max(0, window.innerHeight - height);

        const nextX = clamp(event.clientX - dragState.offsetX, 0, maxX);
        const nextY = clamp(event.clientY - dragState.offsetY, 0, maxY);
        setPosition({ x: nextX, y: nextY });
      }

      if (resizeState) {
        const deltaX = event.clientX - resizeState.startMouseX;
        const deltaY = event.clientY - resizeState.startMouseY;
        const requestedWidth = resizeState.startWidth + deltaX;
        const requestedHeight = resizeState.startHeight + deltaY;
        const nextSize = constrainSize(requestedWidth, requestedHeight, position.x, position.y);
        setCurrentSize(nextSize);
      }
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
      resizeStateRef.current = null;
      document.body.classList.remove('dragging-window');
      document.body.classList.remove('resizing-window');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('dragging-window');
      document.body.classList.remove('resizing-window');
    };
  }, [isOpen, position.x, position.y, resolvedMaxHeight, resolvedMaxWidth, resolvedMinHeight, resolvedMinWidth]);

  const handleHeaderMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !windowRef.current) {
      return;
    }

    const rect = windowRef.current.getBoundingClientRect();
    dragStateRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };

    document.body.classList.add('dragging-window');
  };

  const handleResizeMouseDown = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !windowRef.current || !resizable) {
      return;
    }

    event.stopPropagation();

    resizeStateRef.current = {
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startWidth: windowRef.current.offsetWidth,
      startHeight: windowRef.current.offsetHeight
    };

    document.body.classList.add('resizing-window');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="game-window-layer" role="presentation">
      <div
        ref={windowRef}
        className={`game-window-frame ${className ?? ''}`.trim()}
        style={{ left: position.x, top: position.y, width: currentSize.width, height: currentSize.height }}
      >
        <div className="game-window-header" onMouseDown={handleHeaderMouseDown}>
          <h2 className="game-window-title">{title}</h2>
          <button
            className="game-window-close"
            type="button"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={onClose}
            aria-label="Close window"
          >
            X
          </button>
        </div>
        <div className={`game-window-body ${bodyClassName ?? ''}`.trim()}>{children}</div>
        {resizable ? (
          <button
            type="button"
            className="game-window-resize-handle game-window-resize-handle-bottom-right"
            aria-label="Resize window"
            onMouseDown={handleResizeMouseDown}
          />
        ) : null}
      </div>
    </div>
  );
}
