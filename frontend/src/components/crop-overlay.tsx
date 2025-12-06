import React, { useCallback, useRef } from 'react';
import { Group, Rect } from 'react-konva';
import Konva from 'konva';
import { CropArea, CropAspectRatio } from '../types';

// Constants
const MIN_CROP_SIZE = 20;
const HANDLE_SIZE = 10;
const OVERLAY_OPACITY = 0.5;

// Props interface
interface CropOverlayProps {
  // Screenshot dimensions (bounds)
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
  // Current crop state
  cropArea: CropArea | null;
  aspectRatio: CropAspectRatio;
  isDrawing: boolean;
  // Callbacks
  onCropChange: (area: CropArea) => void;
  onCropStart: (area: CropArea) => void;
  onDrawingChange: (isDrawing: boolean) => void;
}

// Handle position type
type HandlePosition = 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r';

// Helper: Constrain crop area to image bounds while maintaining min size
function constrainToBounds(
  area: CropArea,
  imageX: number,
  imageY: number,
  imageWidth: number,
  imageHeight: number
): CropArea {
  const result = { ...area };

  // Ensure minimum size first (before position clamping)
  result.width = Math.max(MIN_CROP_SIZE, result.width);
  result.height = Math.max(MIN_CROP_SIZE, result.height);

  // Clamp position to ensure crop stays within bounds
  // Adjust x position - ensure crop fits within image
  if (result.x < imageX) {
    result.x = imageX;
  }
  if (result.x + result.width > imageX + imageWidth) {
    result.x = Math.max(imageX, imageX + imageWidth - result.width);
  }

  // Adjust y position - ensure crop fits within image
  if (result.y < imageY) {
    result.y = imageY;
  }
  if (result.y + result.height > imageY + imageHeight) {
    result.y = Math.max(imageY, imageY + imageHeight - result.height);
  }

  // Final width/height clamp (in case image is smaller than MIN_CROP_SIZE)
  result.width = Math.max(MIN_CROP_SIZE, Math.min(result.width, imageWidth));
  result.height = Math.max(MIN_CROP_SIZE, Math.min(result.height, imageHeight));

  return result;
}

// Aspect ratio numeric values
const RATIO_VALUES: Record<CropAspectRatio, number> = {
  'free': 0,
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '9:16': 9 / 16,
  '3:4': 3 / 4,
};

// Helper: Enforce aspect ratio during resize
function enforceAspectRatio(
  area: CropArea,
  ratio: CropAspectRatio,
  dragHandle: HandlePosition
): CropArea {
  const targetRatio = RATIO_VALUES[ratio];
  if (targetRatio === 0) return area;

  const result = { ...area };
  const isHorizontalDrag = ['l', 'r'].includes(dragHandle);
  const isVerticalDrag = ['t', 'b'].includes(dragHandle);

  if (isHorizontalDrag) {
    result.height = result.width / targetRatio;
  } else if (isVerticalDrag) {
    result.width = result.height * targetRatio;
  } else {
    // Corner: use width as primary
    result.height = result.width / targetRatio;
  }

  return result;
}

// Helper: Apply all constraints (bounds + aspect ratio) ensuring ratio is preserved
function applyConstraints(
  area: CropArea,
  imageX: number,
  imageY: number,
  imageWidth: number,
  imageHeight: number,
  aspectRatio: CropAspectRatio,
  dragHandle: HandlePosition
): CropArea {
  let result = { ...area };

  // First pass: enforce bounds
  result = constrainToBounds(result, imageX, imageY, imageWidth, imageHeight);

  // If no aspect ratio constraint, we're done
  if (aspectRatio === 'free') return result;

  // Apply aspect ratio
  result = enforceAspectRatio(result, aspectRatio, dragHandle);

  // Second pass: check if aspect ratio adjustment broke bounds
  const targetRatio = RATIO_VALUES[aspectRatio];
  const maxWidth = imageX + imageWidth - result.x;
  const maxHeight = imageY + imageHeight - result.y;

  // If dimensions exceed bounds, scale down while preserving ratio
  if (result.width > maxWidth || result.height > maxHeight) {
    const scaleW = maxWidth / result.width;
    const scaleH = maxHeight / result.height;
    const scale = Math.min(scaleW, scaleH);

    result.width = Math.max(MIN_CROP_SIZE, result.width * scale);
    result.height = result.width / targetRatio;

    // Ensure minimum size while preserving ratio
    if (result.width < MIN_CROP_SIZE) {
      result.width = MIN_CROP_SIZE;
      result.height = result.width / targetRatio;
    }
    if (result.height < MIN_CROP_SIZE) {
      result.height = MIN_CROP_SIZE;
      result.width = result.height * targetRatio;
    }
  }

  // Final position adjustment
  if (result.x + result.width > imageX + imageWidth) {
    result.x = imageX + imageWidth - result.width;
  }
  if (result.y + result.height > imageY + imageHeight) {
    result.y = imageY + imageHeight - result.height;
  }
  result.x = Math.max(imageX, result.x);
  result.y = Math.max(imageY, result.y);

  return result;
}

// Sub-component: Darkened overlay (4 rects around crop area)
interface OverlayRectsProps {
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
  cropArea: CropArea;
}

function DarkenedOverlay({ imageX, imageY, imageWidth, imageHeight, cropArea }: OverlayRectsProps) {
  const { x, y, width, height } = cropArea;

  return (
    <>
      {/* Top */}
      <Rect
        x={imageX}
        y={imageY}
        width={imageWidth}
        height={Math.max(0, y - imageY)}
        fill="black"
        opacity={OVERLAY_OPACITY}
        listening={false}
      />
      {/* Bottom */}
      <Rect
        x={imageX}
        y={y + height}
        width={imageWidth}
        height={Math.max(0, imageY + imageHeight - (y + height))}
        fill="black"
        opacity={OVERLAY_OPACITY}
        listening={false}
      />
      {/* Left */}
      <Rect
        x={imageX}
        y={y}
        width={Math.max(0, x - imageX)}
        height={height}
        fill="black"
        opacity={OVERLAY_OPACITY}
        listening={false}
      />
      {/* Right */}
      <Rect
        x={x + width}
        y={y}
        width={Math.max(0, imageX + imageWidth - (x + width))}
        height={height}
        fill="black"
        opacity={OVERLAY_OPACITY}
        listening={false}
      />
    </>
  );
}

// Sub-component: Crop frame (draggable rectangle border)
interface CropFrameProps {
  cropArea: CropArea;
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
  onDragMove: (x: number, y: number) => void;
}

function CropFrame({
  cropArea,
  imageX,
  imageY,
  imageWidth,
  imageHeight,
  onDragMove,
}: CropFrameProps) {
  const handleDragBound = useCallback(
    (pos: { x: number; y: number }) => {
      const maxX = imageX + imageWidth - cropArea.width;
      const maxY = imageY + imageHeight - cropArea.height;

      return {
        x: Math.max(imageX, Math.min(pos.x, maxX)),
        y: Math.max(imageY, Math.min(pos.y, maxY)),
      };
    },
    [imageX, imageY, imageWidth, imageHeight, cropArea.width, cropArea.height]
  );

  return (
    <Rect
      x={cropArea.x}
      y={cropArea.y}
      width={cropArea.width}
      height={cropArea.height}
      stroke="white"
      strokeWidth={2}
      fill="transparent"
      draggable
      dragBoundFunc={handleDragBound}
      onDragMove={(e) => {
        const node = e.target;
        onDragMove(node.x(), node.y());
      }}
      onDragEnd={(e) => {
        // Reset position to match state after drag ends
        const node = e.target;
        node.x(cropArea.x);
        node.y(cropArea.y);
      }}
    />
  );
}

// Sub-component: Resize handles (8 handles at corners and edges)
interface ResizeHandlesProps {
  cropArea: CropArea;
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
  aspectRatio: CropAspectRatio;
  onResize: (newArea: CropArea) => void;
}

function ResizeHandles({
  cropArea,
  imageX,
  imageY,
  imageWidth,
  imageHeight,
  aspectRatio,
  onResize,
}: ResizeHandlesProps) {
  // Calculate handle positions based on current crop area
  const getHandlePositions = (area: CropArea): Record<HandlePosition, { cx: number; cy: number }> => ({
    tl: { cx: area.x, cy: area.y },
    tr: { cx: area.x + area.width, cy: area.y },
    bl: { cx: area.x, cy: area.y + area.height },
    br: { cx: area.x + area.width, cy: area.y + area.height },
    t: { cx: area.x + area.width / 2, cy: area.y },
    b: { cx: area.x + area.width / 2, cy: area.y + area.height },
    l: { cx: area.x, cy: area.y + area.height / 2 },
    r: { cx: area.x + area.width, cy: area.y + area.height / 2 },
  });

  const handlePositions = getHandlePositions(cropArea);

  // Handle resize drag - use cropArea directly in callback to avoid stale closure
  const handleDrag = useCallback(
    (pos: HandlePosition, newX: number, newY: number, currentArea: CropArea) => {
      const { x, y, width, height } = currentArea;
      let newArea = { ...currentArea };

      // Calculate new dimensions based on which handle is dragged
      switch (pos) {
        case 'br':
          newArea.width = Math.max(MIN_CROP_SIZE, newX - x);
          newArea.height = Math.max(MIN_CROP_SIZE, newY - y);
          break;
        case 'bl':
          newArea.x = Math.min(newX, x + width - MIN_CROP_SIZE);
          newArea.width = x + width - newArea.x;
          newArea.height = Math.max(MIN_CROP_SIZE, newY - y);
          break;
        case 'tr':
          newArea.y = Math.min(newY, y + height - MIN_CROP_SIZE);
          newArea.width = Math.max(MIN_CROP_SIZE, newX - x);
          newArea.height = y + height - newArea.y;
          break;
        case 'tl':
          newArea.x = Math.min(newX, x + width - MIN_CROP_SIZE);
          newArea.y = Math.min(newY, y + height - MIN_CROP_SIZE);
          newArea.width = x + width - newArea.x;
          newArea.height = y + height - newArea.y;
          break;
        case 't':
          newArea.y = Math.min(newY, y + height - MIN_CROP_SIZE);
          newArea.height = y + height - newArea.y;
          break;
        case 'b':
          newArea.height = Math.max(MIN_CROP_SIZE, newY - y);
          break;
        case 'l':
          newArea.x = Math.min(newX, x + width - MIN_CROP_SIZE);
          newArea.width = x + width - newArea.x;
          break;
        case 'r':
          newArea.width = Math.max(MIN_CROP_SIZE, newX - x);
          break;
      }

      // Apply all constraints (bounds + aspect ratio)
      newArea = applyConstraints(newArea, imageX, imageY, imageWidth, imageHeight, aspectRatio, pos);

      onResize(newArea);
    },
    [imageX, imageY, imageWidth, imageHeight, aspectRatio, onResize]
  );

  return (
    <>
      {Object.entries(handlePositions).map(([pos, { cx, cy }]) => (
        <Rect
          key={pos}
          x={cx - HANDLE_SIZE / 2}
          y={cy - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="white"
          stroke="#333"
          strokeWidth={1}
          cornerRadius={2}
          draggable
          onDragMove={(e) => {
            const node = e.target;
            handleDrag(
              pos as HandlePosition,
              node.x() + HANDLE_SIZE / 2,
              node.y() + HANDLE_SIZE / 2,
              cropArea
            );
          }}
          onDragEnd={(e) => {
            // Reset handle position to match crop area after drag
            const node = e.target;
            const positions = getHandlePositions(cropArea);
            const handlePos = positions[pos as HandlePosition];
            node.x(handlePos.cx - HANDLE_SIZE / 2);
            node.y(handlePos.cy - HANDLE_SIZE / 2);
          }}
        />
      ))}
    </>
  );
}

// Main component: CropOverlay
export function CropOverlay({
  imageX,
  imageY,
  imageWidth,
  imageHeight,
  cropArea,
  aspectRatio,
  isDrawing,
  onCropChange,
  onCropStart,
  onDrawingChange,
}: CropOverlayProps) {
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);

  // Handle mouse down to start drawing crop region
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (cropArea) return; // Already have crop area

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Check if click is within image bounds
      if (
        pos.x < imageX ||
        pos.x > imageX + imageWidth ||
        pos.y < imageY ||
        pos.y > imageY + imageHeight
      ) {
        return;
      }

      drawStartRef.current = pos;
      onDrawingChange(true);
    },
    [cropArea, imageX, imageY, imageWidth, imageHeight, onDrawingChange]
  );

  // Handle mouse move during drawing
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawing || !drawStartRef.current) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Calculate crop area from drag
      const startX = Math.min(drawStartRef.current.x, pos.x);
      const startY = Math.min(drawStartRef.current.y, pos.y);
      const width = Math.abs(pos.x - drawStartRef.current.x);
      const height = Math.abs(pos.y - drawStartRef.current.y);

      let newArea: CropArea = { x: startX, y: startY, width, height };
      newArea = constrainToBounds(newArea, imageX, imageY, imageWidth, imageHeight);

      onCropStart(newArea);
    },
    [isDrawing, imageX, imageY, imageWidth, imageHeight, onCropStart]
  );

  // Handle mouse up to finish drawing
  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      onDrawingChange(false);
      drawStartRef.current = null;
    }
  }, [isDrawing, onDrawingChange]);

  // No crop area yet - render invisible rect to capture mouse events
  if (!cropArea) {
    return (
      <Rect
        x={imageX}
        y={imageY}
        width={imageWidth}
        height={imageHeight}
        fill="transparent"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    );
  }

  // Render crop overlay with frame and handles
  return (
    <Group>
      <DarkenedOverlay
        imageX={imageX}
        imageY={imageY}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        cropArea={cropArea}
      />
      <CropFrame
        cropArea={cropArea}
        imageX={imageX}
        imageY={imageY}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        onDragMove={(x, y) => onCropChange({ ...cropArea, x, y })}
      />
      <ResizeHandles
        cropArea={cropArea}
        imageX={imageX}
        imageY={imageY}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        aspectRatio={aspectRatio}
        onResize={onCropChange}
      />
    </Group>
  );
}

export default CropOverlay;
