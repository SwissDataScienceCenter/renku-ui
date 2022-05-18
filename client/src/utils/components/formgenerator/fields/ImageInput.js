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

import React, { useRef, useState } from "react";
import { Col, Row } from "reactstrap";
import { Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, FormGroup, Input } from "reactstrap";
import { InputGroup } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";

import { ImageFieldPropertyName as Prop } from "./stockimages";
import { formatBytes } from "../../../helpers/HelperFunctions";
import { ErrorLabel, InputHintLabel, InputLabel } from "../../formlabels/FormLabels";
/**
 * Update the value of the function
 * @param {integer} current The current value
 * @param {+1/-1} direction The direction to rotate towards
 * @param {array} options The full list of options
 * @param {function} setValue The setValue function
 */
function rotateValue(name, current, direction, options, setInputs) {
  const length = options.length;
  let newValue = current + direction;
  if (newValue >= length) newValue = -1;
  if (newValue < -1) newValue = length - 1;
  const artificialEvent = {
    target: { name, value: { options, selected: newValue } },
    isPersistent: () => false
  };
  setInputs(artificialEvent);
}

function userInputOption(options) {
  let userInput = options.find(o => o[Prop.STOCK] === false);
  if (userInput == null) {
    userInput = { [Prop.NAME]: "user", [Prop.URL]: "", [Prop.STOCK]: false };
    return [userInput, options.concat(userInput)];
  }
  return [userInput, options];
}


function ImagePreviewControls({ value, options, rotate, disabled }) {
  if ((options.length < 1) || disabled)
    return <div className="d-flex justify-content-around p-0"></div>;
  return <div className="d-flex justify-content-around p-0">
    <div>
      <Button color="link" onClick={() => { rotate(-1); }}>
        <FontAwesomeIcon icon={faCaretLeft} />
      </Button>
    </div>
    <div className="pt-2" style={{ fontSize: "smaller" }}>{value}</div>
    <div>
      <Button color="link" onClick={() => { rotate(1); }}>
        <FontAwesomeIcon icon={faCaretRight} />
      </Button>
    </div>
  </div>;
}

function ImagePreview({ name, value, selected, displayValue, disabled, setInputs, imageControlsDisabled = false }) {
  const options = value.options;
  const selectedIndex = value.selected;
  const imageSize = { width: 160, height: 135 };
  const imageStyle = { ...imageSize, objectFit: "cover" };
  const imagePreviewStyle = { ...imageStyle, backgroundColor: "#C4C4C4" };

  const image = (selectedIndex > -1 && selected[Prop.URL]) ?
    <img src={selected[Prop.URL]} alt={displayValue} style={imageStyle} /> :
    (<div style={imagePreviewStyle}
      className="d-flex justify-content-center align-items-center text-white">
      <div>No Image Yet</div>
    </div>);

  const rotate = (direction) => rotateValue(name, value.selected, direction, options, setInputs);
  const imageControls = options.length > 1 && !imageControlsDisabled ?
    <ImagePreviewControls value={displayValue} options={options} rotate={rotate} disabled={disabled} /> : null;
  return (<div className="m-auto" style={imageSize}>
    <div className="d-flex justify-content-around border">
      <div style={imageSize}>{image}</div>
    </div>
    {imageControls}
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

function onFileInputChange(name, options, maxSize, setInputs, setSizeAlert, e) {
  e.preventDefault();
  e.persist();
  const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
  if (files == null) {
    setSizeAlert(`Please select a file.`);
    return;
  }
  const file = files[0];
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
  };
  if (file)
    reader.readAsDataURL(file);
  setSizeAlert(null);

}


const ImageInputMode = {
  URL: "URL",
  FILE: "Choose File"
};

function ImageContentInputMode({ name, modes, mode, setMode, onClick }) {
  const [isOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!isOpen);
  const buttonId = `${name}-button`;

  if (modes.length < 2)
    return <Button color="primary" onClick={onClick}>{mode}</Button>;
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
  help, maxSize, format, disabled, options }) {
  const [mode, setMode] = useState(modes[0]);
  const [sizeAlert, setSizeAlert] = useState(null);
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
    <InputGroup id={inputGroupId}>
      <ImageContentInputMode name={name} modes={modes} mode={mode} setMode={setMode} onClick={onModeButtonClick}/>
      <Input id={widgetId} name={widgetId} type="text" value={inputValue}
        onDragOver={e => e.preventDefault()} onDragLeave={e => e.preventDefault()}
        onDrop={onDrop} onChange={onInputChange} disabled={disabled} placeholder={placeholder} />
    </InputGroup>
    <InputHintLabel text={helpValue} />
    <input id={hiddenInputId} name={hiddenInputId} style={{ display: "none" }}
      type="file" accept={format}
      onChange={(e) => onFileInputChange(name, options, maxSize, setInputs, setSizeAlert, e)}
      onDrop={(e) => onFileInputChange(name, options, maxSize, setInputs, setSizeAlert, e)}
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
 * @param {boolean} imageControlsDisabled To so not show image controls
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
    imageControlsDisabled }) {
  const options = value.options;
  const selectedIndex = value.selected;
  const selected = (selectedIndex > -1) ?
    options[selectedIndex] :
    { [Prop.NAME]: "[none]", [Prop.URL]: "", [Prop.STOCK]: false };
  const displayValue = selected[Prop.NAME];
  const allowedModes = (modes) ? modes : [ImageInputMode.FILE, ImageInputMode.URL];
  const helpIsString = (typeof help) == "string" || help == null;
  const previewHelp = !helpIsString && help["preview"] ? help["preview"] : null;

  return [
    <Row key="row-title">
      <InputLabel className="ps-3" text={label} isRequired={required} isOptional={optional} />
    </Row>,
    !disabled ? (<Row key="row-content" className="field-group">
      <Col xs={12}>
        <div className="d-block d-md-flex d-lg-flex gap-5">
          <div className="flex-grow-1">
            <ImageContentInput name={name} value={selected}
              setInputs={setInputs} help={help} maxSize={maxSize}
              disabled={disabled} options={options} modes={allowedModes} format={format} />
            {alert && <ErrorLabel text={alert} />}
          </div>
          <div className="pe-2">
            <ImagePreview
              value={value} selected={selected} displayValue={displayValue}
              disabled={disabled} setInputs={setInputs} disableImageControls={imageControlsDisabled} />
            <InputHintLabel text={previewHelp} />
          </div>
        </div>
      </Col>
    </Row>) : (
      <div key="row-content" className="pe-2">
        <ImagePreview
          value={value} selected={selected} displayValue={displayValue}
          disabled={disabled} setInputs={setInputs} />
        <InputHintLabel text={previewHelp} />
      </div>
    )
  ];
}

export default ImageInput;

export { Prop as ImageFieldPropertyName, ImageInputMode };
