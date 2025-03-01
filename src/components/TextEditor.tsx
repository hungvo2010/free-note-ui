import React, { useRef, useCallback } from 'react';
import { Text } from 'types/shape/Text';
import { RoughCanvas } from 'roughjs/bin/canvas';

interface TextEditorProps {
  selectedShape: Text | null;
  roughCanvas: RoughCanvas | undefined;
  isEditing: boolean;
  onBlur: () => void;
  onTextChange: (newShape: Text) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  selectedShape,
  roughCanvas,
  isEditing,
  onBlur,
  onTextChange
}) => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  
  const textInputStyle = selectedShape ? {
    position: "absolute" as const,
    left: `${selectedShape.getPosition().x}px`,
    top: `${selectedShape.getPosition().y - 20}px`,
    border: "none",
    background: "transparent",
    outline: "none",
    font: "20px Excalifont",
    display: isEditing ? "block" : "none",
    caretColor: "black",
    caretShape: "bar",
  } : { display: "none" as const };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedShape) {
      const textPos = selectedShape.getPosition();
      onTextChange(new Text(roughCanvas, textPos.x, textPos.y, e.target.value));
    }
  }, [selectedShape, roughCanvas, onTextChange]);

  return (
    <textarea
      ref={textInputRef}
      style={textInputStyle as React.CSSProperties}
      autoFocus={isEditing}
      onBlur={onBlur}
      onChange={handleChange}
    />
  );
}; 