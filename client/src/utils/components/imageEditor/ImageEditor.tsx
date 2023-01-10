import React, { useEffect, useRef } from "react";
import AvatarEditor, { Position } from "react-avatar-editor";
import { ArrowClockwise, Button, ZoomIn, ZoomOut } from "../../ts-wrappers";
import picaFn from "pica";

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

let picaInstance: any;

// Resize images in browser
// select the best of available technologies: webworkers, webassembly, createImageBitmap, pure JS.
// ref: https://github.com/nodeca/pica
export function getPicaInstance() {
  if (picaInstance)
    return picaInstance;

  picaInstance = picaFn();

  return picaInstance;
}

function ImageEditor({ onSave, file, imageEditionState, setImageEditionState }: ImageEditorProps) {
  const editorRef = useRef<AvatarEditor | null>(null);

  // saving the image when the position changes can be launched multiple times in one second
  // that's why we use onMouseUp for that case and here for when the scale value changes
  useEffect(() => {
    if (imageEditionState.scale)
      saveImage();
  }, [imageEditionState.scale]); //eslint-disable-line

  const scaleImage = async (
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    scale = 1,
    positions: Position,
    imageType: string ) => {
    const offScreenCanvas = document.createElement("canvas");
    const newWidth = width * scale;
    const newHeight = height * scale;
    offScreenCanvas.width = newWidth;
    offScreenCanvas.height = newHeight;
    offScreenCanvas?.getContext("2d")?.drawImage(canvas, positions.x, positions.y, newWidth, newHeight);

    // Use pica to resize image
    const picaInstance = getPicaInstance();
    return picaInstance.resize(canvas, offScreenCanvas, { alpha: true })
      .then( (result: any) => picaInstance.toBlob(result, imageType, 0.90));
  };

  const generateImageFile = (blob: Blob, name: string, type: string) => {
    return new File([blob], name, { type });
  };

  const saveImage = async () => {
    if (editorRef && editorRef.current) {
      try {
        const canvas = editorRef.current.getImage();
        const blobScaledImage = await scaleImage(canvas,
          CARD_IMAGE_DIMENSIONS.width,
          CARD_IMAGE_DIMENSIONS.height,
          imageEditionState.scale,
          imageEditionState.positions,
          file.type);
        const imageFile = generateImageFile(blobScaledImage, file.name, file.type);
        if (onSave)
          onSave(imageFile);
      }
      catch (e) {
        if (onSave)
          onSave(file); // restore original file
      }
    }
  };

  const modifyImage = (e: any, action: "zoomIn" | "zoomOut" | "changePosition" | "restore", values?: unknown) => {
    if (e)
      e.preventDefault();
    switch (action) {
      case "zoomIn":
        setImageEditionState({ ...imageEditionState, scale: imageEditionState.scale + 0.1 });
        break;
      case "zoomOut":
        setImageEditionState({ ...imageEditionState, scale: imageEditionState.scale - 0.1 });
        break;
      case "changePosition":
        setImageEditionState({ ...imageEditionState, positions: values });
        break;
      case "restore":
        setImageEditionState({
          scale: 1,
          positions: { x: 0, y: 0 }
        });
        break;
    }
  };

  const controls = (
    <div className="d-flex gap-1 align-items-center">
      <Button className="editor-control-btn"
        onClick={(e: any) => modifyImage(e, "zoomIn")}><ZoomIn /></Button>
      <Button className="editor-control-btn" disabled={imageEditionState.scale <= 1}
        onClick={(e: any) => modifyImage(e, "zoomOut")}><ZoomOut /></Button>
      <Button className="editor-control-btn"
        onClick={(e: any) => modifyImage(e, "restore")}>
        <ArrowClockwise /></Button>
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
        onImageReady={saveImage}
        onMouseUp={saveImage}
        onPositionChange={(position) => modifyImage(undefined, "changePosition", position)}
      />
      {controls}
    </div>
  );
}

export default ImageEditor;
