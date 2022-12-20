import React, { useRef } from "react";
import AvatarEditor, { Position } from "react-avatar-editor";
import { Button, ZoomIn, ZoomOut } from "../../ts-wrappers";

interface ImageEditorProps {
  onSave?: Function;
  file: File;
  imageEditionState: ImageEditionState;
  setImageEditionState: Function;
}

const CARD_IMAGE_DIMENSIONS = {
  width: 350,
  height: 198,
};

export type ImageEditionState = {
  scale: number;
  positions: Position
};

function ImageEditor({ onSave, file, imageEditionState, setImageEditionState }: ImageEditorProps) {
  const editorRef = useRef<AvatarEditor | null>(null);
  const onPositionChange = (positions: Position) => {
    setImageEditionState({ ...imageEditionState, positions });
  };

  const handleResize = (
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    scale = 1,
    positions: Position,
    type: string ) => {
    const offScreenCanvas = document.createElement("canvas");
    const newWidth = width * scale;
    const newHeight = height * scale;
    offScreenCanvas.width = newWidth;
    offScreenCanvas.height = newHeight;
    offScreenCanvas?.getContext("2d")?.drawImage(canvas, positions.x, positions.y, newWidth, newHeight);
    return offScreenCanvas.toDataURL(type, 0.9);
  };

  const generateImageFile = (blob: Blob, name: string, type: string) => {
    if (!blob)
      return null;
    return new File([blob], name, { type });
  };

  const onClickSave = async () => {
    if (editorRef && editorRef.current) {
      // resize image to card size
      const canvas = editorRef.current.getImage();
      const scaledImage = handleResize(canvas,
        CARD_IMAGE_DIMENSIONS.width,
        CARD_IMAGE_DIMENSIONS.height,
        imageEditionState.scale,
        imageEditionState.positions,
        file.type);
      try {
        const blob = await (await fetch(scaledImage)).blob();
        const imageFile = generateImageFile(blob, file.name, file.type );
        if (onSave)
          onSave(imageFile);
      }
      catch (e) {
        if (onSave)
          onSave(file); // restore original file
      }
    }
  };

  const zoom = (direction: "up" | "down", e: any) => {
    e.preventDefault();
    switch (direction) {
      case "up":
        setImageEditionState({ ...imageEditionState, scale: imageEditionState.scale + 0.1 });
        break;
      case "down":
        setImageEditionState({ ...imageEditionState, scale: imageEditionState.scale - 0.1 });
        break;
    }
  };

  const controls = (
    <div className="d-flex gap-1 align-items-center">
      <small>Zoom</small>
      <Button className="editor-control-btn" onClick={(e: any) => zoom("up", e)}><ZoomIn /></Button>
      <Button className="editor-control-btn" onClick={(e: any) => zoom("down", e)}
        disabled={imageEditionState.scale <= 1}><ZoomOut /></Button>
      <Button className="btn-save-editor fs-small px-3 py-1" onClick={onClickSave}>Save</Button>
    </div>
  );

  if (!file)
    return <div> No image to edit </div>;

  return (
    <div className="d-flex flex-column gap-2">
      <AvatarEditor
        ref={editorRef}
        image={file}
        width={136}
        height={77}
        border={1}
        style={{ borderRadius: "8px" }}
        color={[255, 255, 255, 0.6]} // RGBA
        scale={imageEditionState.scale}
        position={imageEditionState.positions}
        rotate={0}
        onPositionChange={onPositionChange}
      />
      {controls}
    </div>
  );
}

export default ImageEditor;
