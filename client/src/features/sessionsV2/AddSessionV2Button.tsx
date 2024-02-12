/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import { useCallback, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  Label,
  Input,
} from "reactstrap";
import cx from "classnames";
import { PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";

export default function AddSessionV2Button() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className="btn-outline-rk-green" onClick={toggle}>
        <PlusLg className={cx("bi", "me-1")} />
        Add Session
      </Button>
      <AddSessionV2Modal isOpen={isOpen} toggle={toggle} />
    </>
  );
}

interface AddSessionV2ModalProps {
  isOpen: boolean;
  toggle: () => void;
}

function AddSessionV2Modal({ isOpen, toggle }: AddSessionV2ModalProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AddSessionV2Form>({
    defaultValues: {
      name: "",
      description: "",
      environmentDefinition: "",
    },
  });
  const onSubmit = useCallback((data: AddSessionV2Form) => {}, []);

  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <ModalHeader toggle={toggle}>Add session</ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Label className="form-label" for="addSessionV2Name">
              Name
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  className={cx("form-control", errors.name && "is-invalid")}
                  id="addSessionV2Name"
                  placeholder="session name"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">Please provide a name</div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button className="btn-outline-rk-green" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Close
          </Button>
          <Button type="submit">
            <PlusLg className={cx("bi", "me-1")} />
            Add Session
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

interface AddSessionV2Form {
  name: string;
  description: string;
  environmentDefinition: string;
}
