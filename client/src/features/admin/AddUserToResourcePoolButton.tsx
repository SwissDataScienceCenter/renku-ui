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

import cx from "classnames";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Autosuggest, {
  ChangeEvent,
  InputProps,
  SuggestionSelectedEventData,
  SuggestionsFetchRequestedParams,
} from "react-autosuggest";
import { PersonFillAdd, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { ResourcePool } from "../dataServices/dataServices";
import { useAdminComputeResourcesSelector } from "./adminComputeResources.slice";
import adminKeycloakApi from "./adminKeycloak.api";
import { KeycloakUser } from "./adminKeycloak.types";

interface AddUserToResourcePoolButtonProps {
  resourcePool: ResourcePool;
}

export default function AddUserToResourcePoolButton({
  resourcePool,
}: AddUserToResourcePoolButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className={cx("btn-outline-rk-green")} onClick={toggle}>
        <PersonFillAdd className={cx("bi", "me-1")} />
        Add User
      </Button>
      <AddUserToResourcePoolModal
        isOpen={isOpen}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface AddUserToResourcePoolModalProps {
  isOpen: boolean;
  resourcePool: ResourcePool;
  toggle: () => void;
}

function AddUserToResourcePoolModal({
  isOpen,
  resourcePool,
  toggle,
}: AddUserToResourcePoolModalProps) {
  const [pickedUser, setPickedUser] = useState<KeycloakUser | null>(null);

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<AddUserToResourcePoolForm>({
    defaultValues: {
      userId: "",
    },
  });
  const onSubmit = useCallback((data: AddUserToResourcePoolForm) => {
    console.log({ data });
  }, []);

  const onPickUser = useCallback((user: KeycloakUser | null | undefined) => {
    if (user != null) {
      setPickedUser(user);
    }
  }, []);

  useEffect(() => {
    if (pickedUser != null) {
      setValue("userId", pickedUser.id);
    }
  }, [pickedUser, setValue]);

  return (
    <Modal centered fullscreen="lg" isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader toggle={toggle}>
        Add User to Resource Pool: {resourcePool.name}
      </ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* {result.error && <RtkErrorAlert error={result.error} />} */}

          <div className="mb-3">
            <Label
              className="form-label"
              for="addUserToResourcePoolUserDisplay"
            >
              User
            </Label>
            <Input
              className={cx("form-control", errors.userId && "is-invalid")}
              disabled
              id="addUserToResourcePoolUserDisplay"
              type="text"
              value={
                pickedUser != null
                  ? `${pickedUser.firstName} ${pickedUser.lastName} <${pickedUser.email}>`
                  : ""
              }
            />
            <input {...register("userId", { required: true })} type="hidden" />
            <div className="invalid-feedback">Please pick a user</div>
          </div>

          <div>
            <div className="form-label">User search</div>
            <UserAutoSuggest onPickUser={onPickUser} />
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button
          // disabled={result.isLoading}
          onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          {/* {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <PersonFillAdd className={cx("bi", "me-1")} />
          )} */}
          Add User to Resource Pool
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface AddUserToResourcePoolForm {
  userId: string;
}

interface UserAutoSuggestProps {
  onPickUser: (user: KeycloakUser | null | undefined) => void;
}

function UserAutoSuggest({ onPickUser }: UserAutoSuggestProps) {
  const keycloakToken = useAdminComputeResourcesSelector(
    ({ keycloakToken }) => keycloakToken
  );

  const [suggestions, setSuggestions] = useState<KeycloakUser[]>([]);
  const [value, setValue] = useState("");

  const [getKeycloakUsers, { data: users }] =
    adminKeycloakApi.useLazyGetKeycloakUsersQuery();

  const onChange = useCallback(
    (_event: FormEvent<HTMLElement>, { newValue }: ChangeEvent) => {
      setValue(newValue);
    },
    []
  );

  const inputProps: InputProps<KeycloakUser> = {
    placeholder: "Search for a user's name or email",
    value,
    onChange,
  };

  const getSuggestionValue = useCallback(
    ({ firstName, lastName }: KeycloakUser) => `${firstName} ${lastName}`,
    []
  );

  const onSuggestionsClearRequested = useCallback(() => {
    setSuggestions([]);
  }, []);

  const onSuggestionsFetchRequested = useCallback(
    ({ value }: SuggestionsFetchRequestedParams) => {
      console.log({ value });
      getKeycloakUsers(
        { keycloakToken, search: value },
        /*preferCacheValue=*/ true
      );
    },
    [getKeycloakUsers, keycloakToken]
  );

  const onSuggestionSelected = useCallback(
    (
      _event: FormEvent<HTMLElement>,
      { suggestion }: SuggestionSelectedEventData<KeycloakUser>
    ) => {
      onPickUser(suggestion);
    },
    [onPickUser]
  );

  const renderSuggestion = ({ firstName, lastName, email }: KeycloakUser) => (
    <div>
      {firstName} {lastName} &lt;{email}&gt;
    </div>
  );

  useEffect(() => {
    console.log({ users });
    if (users) {
      setSuggestions(users);
    }
  }, [users]);

  return (
    <Autosuggest<KeycloakUser>
      suggestions={suggestions}
      inputProps={inputProps}
      getSuggestionValue={getSuggestionValue}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionSelected={onSuggestionSelected}
      renderSuggestion={renderSuggestion}
    />
  );
}
