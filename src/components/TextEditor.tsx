import React, { useRef, useEffect } from 'react';
import { Text } from 'types/shape/Text';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { Shape } from 'types/shape/Shape';

interface TextEditorProps {
  selectedShape: Shape | undefined;
  roughCanvas: RoughCanvas | undefined;
  isEditingText: boolean;
  setIsEditingText: (isEditing: boolean) => void;
  setSelectedShape: (shape: Shape | undefined) => void;
  isLocked: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  selectedShape,
  roughCanvas,
  isEditingText,
  setIsEditingText,
  setSelectedShape,
  isLocked
}) => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  
  const textInputStyle = React.useMemo(() => {
    if (!selectedShape || !(selectedShape instanceof Text))
      return { display: "none" };
    const pos = (selectedShape as Text).getPosition();
    return {
      position: "absolute" as const,
      left: `${pos.x}px`,
      top: `${pos.y - 20}px`,
      border: "none",
      background: "transparent",
      outline: "none",
      font: "20px Excalifont",
      display: isLocked ? "none" : (isEditingText ? "block" : "none"),
      caretColor: "black",
      caretShape: "bar",
    };
  }, [selectedShape, isEditingText, isLocked]);
  
  return (
    <textarea
      ref={textInputRef}
      style={textInputStyle as React.CSSProperties}
      autoFocus={isEditingText && !isLocked}
      onBlur={() => setIsEditingText(false)}
      onChange={(e) => {
        if (isLocked) return;
        if (selectedShape instanceof Text) {
          const textPos = (selectedShape as Text).getPosition();
          setSelectedShape(
            new Text(roughCanvas, textPos.x, textPos.y, e.target.value)
          );
        }
      }}
      readOnly={isLocked}
    />
  );
}; 