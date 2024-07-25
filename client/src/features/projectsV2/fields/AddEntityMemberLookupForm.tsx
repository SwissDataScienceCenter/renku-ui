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

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Input, Label, ModalBody, ModalFooter } from "reactstrap";

import {
  useGetUsersQuery,
  type UserWithId,
} from "../../user/dataServicesUser.api/dataServicesUser.api";

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

interface AddEntityMemberModalProps {
  isOpen: boolean;
  projectId: string;
  toggle: () => void;
}

type NewProjectMember = Pick<UserWithId, "email">;

interface AddEntityMemberEmailLookupFormProps
  extends Pick<AddEntityMemberModalProps, "toggle"> {
  setNewMember: (user: UserWithId) => void;
}
export default function AddEntityMemberEmailLookupForm({
  setNewMember,
  toggle,
}: AddEntityMemberEmailLookupFormProps) {
  const [lookupEmail, setLookupEmail] = useState<string | undefined>(undefined);
  const [isUserNotFound, setIsUserNotFound] = useState(false);
  const { data, isLoading } = useGetUsersQuery(
    { exactEmail: lookupEmail },
    { skip: lookupEmail == null }
  );

  useEffect(() => {
    if (data == null) return;
    if (data.length < 1) {
      setIsUserNotFound(true);
      return;
    }
    setNewMember(data[0]);
  }, [data, setNewMember, setIsUserNotFound]);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<NewProjectMember>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = useCallback(
    (data: NewProjectMember) => {
      setIsUserNotFound(false);
      setLookupEmail(data.email);
    },
    [setLookupEmail]
  );

  return (
    <>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <Label className="form-label" for="addProjectMemberEmail">
              Email
            </Label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  className={cx("form-control", errors.email && "is-invalid")}
                  data-cy="add-project-member-email"
                  disabled={isLoading}
                  id="addProjectMemberEmail"
                  placeholder="email"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true, pattern: emailRegex }}
            />
            <div className="invalid-feedback">
              Please provide the email address for the member to add.
            </div>
            {isUserNotFound && <div>No user found for {lookupEmail}.</div>}
          </div>
          <div className={cx("d-flex", "flex-row-reverse")}>
            <Button
              className="btn-outline-rk-green"
              disabled={isLoading}
              type="submit"
            >
              Lookup
            </Button>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          className="btn-outline-rk-green"
          onClick={toggle}
          data-cy="user-lookup-close-button"
        >
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button disabled={true} onClick={handleSubmit(onSubmit)} type="submit">
          <PlusLg className={cx("bi", "me-1")} />
          Add Member
        </Button>
      </ModalFooter>
    </>
  );
}
