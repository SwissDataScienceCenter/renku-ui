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
import ValidationAlert from "./ValidationAlert";
import HelpText from "./HelpText";
import FormLabel from "./FormLabel";
import { formatBytes } from "../../HelperFunctions";

// eslint-disable-next-line
const emptyPNG = "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";

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

function ImagePreview({ name, value, selected, displayValue, disabled, setInputs }) {
  const options = value.options;
  const selectedIndex = value.selected;
  const imageStyle = { width: 128, height: 128, objectFit: "cover" };
  const imageSrc = (selectedIndex > -1) ?
    selected[Prop.URL] :
    `data:image/png;base64, ${emptyPNG}`;
  const image = <img src={imageSrc} alt={displayValue} style={imageStyle} />;

  const rotate = (direction) => rotateValue(name, value.selected, direction, options, setInputs);
  return <div style={{ maxWidth: 164, minWidth: 164 }}>
    <div className="d-flex justify-content-around border">
      <div style={{ maxWidth: 128, minWidth: 128, }}>{image}</div>
    </div>
    <ImagePreviewControls value={displayValue} options={options} rotate={rotate} disabled={disabled} />
  </div>;
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

  const helpIsString = ((typeof help) == "string") || (help == null);


  let helpValue, inputValue, onInputChange, onModeButtonClick, onDrop;
  if (mode === ImageInputMode.URL) {
    helpValue = (helpIsString) ? help : help["url"];
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
  return <FormGroup>
    <InputGroup id={inputGroupId}>
      <ImageContentInputMode name={name} modes={modes} mode={mode} setMode={setMode} onClick={onModeButtonClick}/>
      <Input id={widgetId} name={widgetId} type="text" value={inputValue}
        onDragOver={e => e.preventDefault()} onDragLeave={e => e.preventDefault()}
        onDrop={onDrop} onChange={onInputChange} disabled={disabled} placeholder={placeholder} />
    </InputGroup>
    <input id={hiddenInputId} name={hiddenInputId} style={{ display: "none" }}
      type="file" accept={format}
      onChange={(e) => onFileInputChange(name, options, maxSize, setInputs, setSizeAlert, e)}
      onDrop={(e) => onFileInputChange(name, options, maxSize, setInputs, setSizeAlert, e)}
      ref={fileInput} />
    <HelpText content={help} />
    <ValidationAlert content={sizeAlert} />
  </FormGroup>;

}

/**
 *
 * @param {string} name The name of the component
 * @param {string} label The label text displayed for the component
 * @param {object} value The value has a complex structure (documentation coming)
 * @param {string} alert The alert text to display
 * @param {string} placeholder The placeholder text shown in the URL input field
 * @param {array} modes A list of allowed modes, null allows all
 * @param {function} setInputs The function invoked when the input changes
 * @param {string or object} help Either help text or an object with structure
 *  {preview: "preview help text", url: "url help text", file: "file help text" }
 * @param {integer} maxSize The max size for file uploads (or null)
 * @param {string} format The allowed formats. Defaults to "image/*"
 * @param {boolean} disabled True if the component is not editable
 * @param {boolean} required True if a value is required
 */
function ImageInput({ name, label, value, alert, placeholder, modes,
  setInputs, help, maxSize, format = "image/*", disabled = false, required = false }) {

  const options = value.options;
  const selectedIndex = value.selected;
  const selected = (selectedIndex > -1) ?
    options[selectedIndex] :
    { [Prop.NAME]: "[none]", [Prop.URL]: "", [Prop.STOCK]: false };
  const displayValue = selected[Prop.NAME];
  const allowedModes = (modes) ? modes : [ImageInputMode.FILE, ImageInputMode.URL];

  const helpIsString = ((typeof help) == "string") || (help == null);
  const previewHelp = (helpIsString) ? help : help["preview"];
  const inputHelp = (helpIsString) ? null : help;


  return [
    <Row key="row-title">
      <FormLabel className="ps-3" label={label} required={required} />
    </Row>,
    <Row key="row-content" className="mb-3">
      <Col xs={12}>
        <div className="d-flex">
          <div className="pe-2">
            <ImagePreview value={value} selected={selected} displayValue={displayValue}
              disabled={disabled} setInputs={setInputs} />
            <HelpText content={previewHelp} />
          </div>
          <div className="flex-grow-1">
            <ImageContentInput name={name} value={selected} placeholder={placeholder}
              setInputs={setInputs} help={inputHelp} maxSize={maxSize}
              disabled={disabled} options={options} modes={allowedModes} format={format} />
            <ValidationAlert content={alert} />
          </div>
        </div>
      </Col>
    </Row>
  ];
}

export default ImageInput;

export { Prop as ImageFieldPropertyName, ImageInputMode };
