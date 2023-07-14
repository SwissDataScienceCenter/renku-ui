/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import React from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import FormGeneratorImageInput, {
  ImageInputMode,
} from "./FormGeneratorImageInput";

type ImageInputImage = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: { NAME: string; URL?: string; STOCK: boolean; FILE?: any }[];
  selected: number;
};

type ImageInputProps = {
  error?: FieldError;
  help?: string | React.ReactNode;
  label: string;
  name: string;
  register: UseFormRegisterReturn;
  required?: boolean;
  value: ImageInputImage;
};

function ImageInput(props: ImageInputProps) {
  // The FormGeneratorImageInput component expects to be re-rendered
  // when the value changes, so it is necessary to keep the value
  // as local state.
  const [image, setImage] = React.useState<ImageInputImage>(props.value);
  React.useEffect(() => {
    setImage(props.value);
  }, [props.value]);
  const setInputs = (value: React.ChangeEvent<HTMLInputElement>) => {
    setImage(value.target.value as unknown as ImageInputImage);
    props.register.onChange(value);
  };
  return (
    <FormGeneratorImageInput
      alert={props.error?.message}
      edit={true}
      format="image/png,image/jpeg,image/gif,image/tiff"
      help={props.help}
      label={props.label}
      maxSize={10 * 1024 * 1024}
      name={props.name}
      modes={[ImageInputMode.FILE]}
      setInputs={setInputs}
      value={image}
    />
  );
}

export default ImageInput;

export type { ImageInputImage };
