/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *  renku-ui
 *
 *  ImageInput.js
 *  Presentational components for presenting images.
 */

import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "reactstrap";
import { Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, FormGroup, Input } from "reactstrap";
import { InputGroup } from "reactstrap";

import { ImageFieldPropertyName as Prop } from "./stockimages";
import { formatBytes } from "../../../helpers/HelperFunctions";
import { ErrorLabel, InputHintLabel, InputLabel } from "../../formlabels/FormLabels";
import ImageEditor from "../../imageEditor/ImageEditor";

function userInputOption(options) {
  let userInput = options.find(o => o[Prop.STOCK] === false);
  if (userInput == null) {
    userInput = { [Prop.NAME]: "user", [Prop.URL]: "", [Prop.STOCK]: false };
    return [userInput, options.concat(userInput)];
  }
  return [userInput, options];
}

function ImagePreview(
  { name, value, selected, disabled, setInputs, maxSize, setSizeAlert, options, originalImageInput }) {
  const [imageEditionState, setImageEditionState] = useState({
    scale: 1,
    positions: { x: 0, y: 0 }
  });

  useEffect(() => {
    // reset imageEditionState if the image change
    setImageEditionState({
      scale: 1,
      positions: { x: 0, y: 0 }
    });
  }, [originalImageInput]);

  const selectedIndex = value.selected;
  const imageSize = { width: 133, height: 77, borderRadius: "8px" };
  const imageStyle = { ...imageSize, objectFit: "cover" };
  const imagePreviewStyle = { ...imageStyle, backgroundColor: "#C4C4C4", borderRadius: "8px" };
  // const displayValue = selected[Prop.NAME] ?? "Current Image";
  const isImageSelected = (selectedIndex > -1 && selected[Prop.URL]);
  const isNewFileUploaded = selected[Prop.URL] && selected[Prop.FILE];

  const onChangeImage = (fileModified) => {
    if (fileModified)
      reviewFile(fileModified, maxSize, setSizeAlert, options, setInputs, name);
  };

  // const image = isImageSelected ?
  //   <img src={selected[Prop.URL]} alt={displayValue} style={imageStyle} /> :
  //   (<div style={imagePreviewStyle}
  //     className="d-flex justify-content-center align-items-center text-white">
  //     <div>No Image Yet</div>
  //   </div>);

  const imageEditor = isImageSelected && !disabled ?
    <ImageEditor
      file={originalImageInput || selected[Prop.URL]}
      onSave={onChangeImage}
      imageEditionState={imageEditionState}
      setImageEditionState={setImageEditionState}
      disabledControls={!isNewFileUploaded}
    /> : null;
  const imageView = !isImageSelected ? (
    <div style={imageSize}>
      <div className="d-flex justify-content-around card">
        <div style={imageSize}>
          <div style={imagePreviewStyle} className="d-flex justify-content-center align-items-center text-white">
            <div>No Image Yet</div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (<div className="m-auto">
    {imageView}
    {imageEditor}
    {isImageSelected && !isNewFileUploaded ? <small>Upload a new image to edit</small> : null}
  </div>);
}

function urlInputValue(value) {
  return value[Prop.FILE] ? "" : value[Prop.STOCK] ? value[Prop.NAME] : value[Prop.URL];
}

function fileInputValue(value) {
  return (value[Prop.FILE] != null) ? value[Prop.FILE]["name"] : "";
}

function onUrlInputChange(name, options, setInputs, e) {
  const v = e.target.value || "";
  const [ui, o] = userInputOption(options);
  ui[Prop.NAME] = "URL";
  ui[Prop.URL] = v;
  ui[Prop.FILE] = null;
  const artificialEvent = {
    target: { name, value: { options: o, selected: o.length - 1 } },
    isPersistent: () => false
  };
  setInputs(artificialEvent);
}

function onFileInputChange(name, options, maxSize, setInputs, setSizeAlert, setOriginalImageInput, e) {
  e.preventDefault();
  e.persist();
  const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
  if (files == null) {
    setSizeAlert(`Please select a file.`);
    return;
  }
  const file = files[0];
  reviewFile(file, maxSize, setSizeAlert, options, setInputs, name, setOriginalImageInput);
}

function reviewFile(file, maxSize, setSizeAlert, options, setInputs, name, setOriginalImageInput) {
  if (file == null) return;
  if (file.size > maxSize) {
    setSizeAlert(`Please select an image that is at most ${formatBytes(maxSize)}`);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    // convert image file to base64 string
    const [ui, o] = userInputOption(options);
    ui[Prop.NAME] = `file:${file.name}`;
    ui[Prop.URL] = e.target.result;
    ui[Prop.FILE] = file;
    const artificialEvent = {
      target: { name, value: { options: o, selected: o.length - 1 } },
      isPersistent: () => false
    };
    setInputs(artificialEvent);
    if (setOriginalImageInput)
      setOriginalImageInput(file);
  };
  if (file)
    reader.readAsDataURL(file);
  setSizeAlert(null);
}


const ImageInputMode = {
  URL: "URL",
  FILE: "Choose File"
};

function ImageContentInputMode({ name, modes, mode, setMode, onClick, color }) {
  const [isOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!isOpen);
  const buttonId = `${name}-button`;

  if (modes.length < 2)
    return <Button className={`btn-outline-${color}`} onClick={onClick}>{mode}</Button>;
  return <ButtonDropdown isOpen={isOpen} toggle={toggle}>
    <Button id={buttonId} color="primary" onClick={onClick}>{mode}</Button>
    <DropdownToggle split color="primary" />
    <DropdownMenu>
      {
        modes.map((m, i) => {
          return <DropdownItem key={m}
            onClick={() => setMode(m)}>{m}</DropdownItem>;
        })
      }
    </DropdownMenu>
  </ButtonDropdown>;

}

function ImageContentInput({ name, value, placeholder, modes, setInputs,
  help, maxSize, format, disabled, options, readOnly, color, sizeAlert, setSizeAlert, setOriginalImageInput }) {
  const [mode, setMode] = useState(modes[0]);
  const fileInput = useRef(null);

  const widgetId = name;
  const inputGroupId = `${name}-input-group`;
  const hiddenInputId = `${name}-file-input-hidden`;

  const helpIsString = (typeof help) == "string" || help == null;

  let helpValue, inputValue, onInputChange, onModeButtonClick, onDrop;
  if (mode === ImageInputMode.URL) {
    helpValue = helpIsString ? help : help["url"];
    inputValue = urlInputValue(value);
    onInputChange = (e) => onUrlInputChange(name, options, setInputs, e);
    onModeButtonClick = () => { };
    onDrop = () => { };
  }
  else {
    helpValue = (helpIsString) ? help : help["file"];
    if (helpValue == null && maxSize != null)
      helpValue = `Select an image file (max size ${formatBytes(maxSize)})`;
    inputValue = fileInputValue(value);
    onModeButtonClick = () => fileInput.current.click();
    onInputChange = onModeButtonClick;
    onDrop = (e) => onFileInputChange(name, options, maxSize, setInputs, setSizeAlert, e);
  }
  if (disabled) return null;
  const sizeAlertLabel = sizeAlert ? <ErrorLabel text={sizeAlert} /> : null;
  return <FormGroup>
    <InputGroup id={inputGroupId} className="input-right">
      <ImageContentInputMode
        name={name} modes={modes} mode={mode} setMode={setMode} onClick={onModeButtonClick} color={color}/>
      <Input id={widgetId} name={widgetId} type="text" value={inputValue} data-cy={`file-input-${name}`}
        onDragOver={e => e.preventDefault()} onDragLeave={e => e.preventDefault()}
        onDrop={onDrop} onChange={onInputChange} disabled={disabled} readOnly={readOnly} placeholder={placeholder} />
    </InputGroup>
    <InputHintLabel text={helpValue} />
    <input id={hiddenInputId} name={hiddenInputId} style={{ display: "none" }}
      type="file" accept={format}
      onChange={(e) => onFileInputChange(name, options, maxSize, setInputs, setSizeAlert, setOriginalImageInput, e)}
      onDrop={(e) => onFileInputChange(name, options, maxSize, setInputs, setSizeAlert, setOriginalImageInput, e)}
      ref={fileInput} />
    {sizeAlertLabel}
  </FormGroup>;

}

/**
 *
 * @param {string} name The name of the component
 * @param {string} label The label text displayed for the component
 * @param {object} value The value has a complex structure (documentation coming)
 * @param {string} alert The alert text to display
 * @param {string} help The help text shown in the URL input field
 * @param {array} modes A list of allowed modes, null allows all
 * @param {function} setInputs The function invoked when the input changes
 * @param {string or object} help Either help text or an object with structure
 *  {preview: "preview help text", url: "url help text", file: "file help text" }
 * @param {integer} maxSize The max size for file uploads (or null)
 * @param {string} format The allowed formats. Defaults to "image/*"
 * @param {boolean} disabled True if the component is not editable
 * @param {boolean} required True if a value is required
 * @param {boolean} optional True if a value is optional
 * @param {boolean} submitting True if a a submit process is in progress
 */
function ImageInput(
  {
    name,
    label,
    value,
    alert,
    modes,
    setInputs,
    help,
    maxSize,
    format = "image/*",
    disabled = false,
    required = false,
    optional,
    submitting,
  }) {
  const [sizeAlert, setSizeAlert] = useState(null);
  const [originalImageInput, setOriginalImageInput] = useState(null);
  const options = value.options;
  const selectedIndex = value.selected;
  const selected = (selectedIndex > -1) ?
    options[selectedIndex] :
    { [Prop.NAME]: "[none]", [Prop.URL]: "", [Prop.STOCK]: false };
  const allowedModes = (modes) ? modes : [ImageInputMode.FILE, ImageInputMode.URL];
  const helpIsString = (typeof help) == "string" || help == null;
  const previewHelp = !helpIsString && help["preview"] ? help["preview"] : null;
  const contentImage = disabled ? null : (
    <div className="flex-grow-1">
      <ImageContentInput name={name} value={selected}
        setInputs={setInputs} help={help} maxSize={maxSize} readOnly={submitting}
        disabled={disabled} options={options} modes={allowedModes} format={format}
        sizeAlert={sizeAlert} setSizeAlert={setSizeAlert} setOriginalImageInput={setOriginalImageInput}
      />
      {alert && <ErrorLabel text={alert} />}
    </div>
  );

  return [
    <Row key="row-title">
      <InputLabel className="ps-3" text={label} isRequired={required} />
    </Row>,
    <Row key="row-content" className="field-group">
      <Col xs={12}>
        <div className="d-block d-md-flex d-lg-flex gap-5">
          {contentImage}
          <div className="pe-2">
            <ImagePreview
              name={name}
              value={value} selected={selected} maxSize={maxSize} originalImageInput={originalImageInput}
              disabled={disabled} setInputs={setInputs} setSizeAlert={setSizeAlert} options={options} />
            <InputHintLabel text={previewHelp} />
          </div>
        </div>
      </Col>
    </Row>
  ];
}

export default ImageInput;

export { Prop as ImageFieldPropertyName, ImageInputMode };
