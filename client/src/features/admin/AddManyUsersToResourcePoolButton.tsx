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
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ExclamationCircleFill,
  PeopleFill,
  PersonFillAdd,
  XLg,
} from "react-bootstrap-icons";
import {
  Control,
  Controller,
  FieldArrayWithId,
  UseFormSetValue,
  UseFormWatch,
  useFieldArray,
  useForm,
} from "react-hook-form";
import {
  Button,
  Form,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { Loader } from "../../components/Loader";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import { useAddUsersToResourcePoolMutation } from "../dataServices/computeResources.api";
import { ResourcePool } from "../dataServices/dataServices.types";
import { useGetKeycloakUsersQuery } from "./adminKeycloak.api";
import useKeycloakRealm from "./useKeycloakRealm.hook";

import styles from "./AddManyUsersToResourcePoolButton.module.scss";

const USERS_EMAILS_PLACEHOLDER =
  "user_1@example.com\nuser_2@example.com\nuser_3@example.com";

interface AddManyUsersToResourcePoolButtonProps {
  resourcePool: ResourcePool;
}

export default function AddManyUsersToResourcePoolButton({
  resourcePool,
}: AddManyUsersToResourcePoolButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button className={cx("btn-outline-rk-green")} onClick={toggle}>
        <PeopleFill className={cx("bi", "me-1")} />
        Add a batch of users
      </Button>
      <AddManyUsersToResourcePoolModal
        isOpen={isOpen}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface AddManyUsersToResourcePoolModalProps {
  isOpen: boolean;
  resourcePool: ResourcePool;
  toggle: () => void;
}

function AddManyUsersToResourcePoolModal({
  isOpen,
  resourcePool,
  toggle,
}: AddManyUsersToResourcePoolModalProps) {
  const [step, setStep] =
    useState<AddManyUsersToResourcePoolStep>("input-emails");

  const onGoBack = useCallback(() => {
    setStep("input-emails");
  }, []);

  const [addUsersToResourcePool, result] = useAddUsersToResourcePoolMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<AddManyUsersToResourcePoolForm>({
    defaultValues: {
      userEmails: "",
      users: [],
    },
  });
  const { fields: userFields } = useFieldArray({ control, name: "users" });
  const onSubmit = useCallback(
    (data: AddManyUsersToResourcePoolForm) => {
      if (step === "input-emails") {
        const userEmailList = parseUserEmails(data.userEmails);
        if (userEmailList.length == 0) {
          setError("userEmails", { type: "required" });
          return;
        }

        setValue(
          "users",
          userEmailList.map((email) => ({
            email,
            isFetching: true,
            found: false,
            firstName: "",
            lastName: "",
            addToResourcePool: false,
            keycloakId: "",
          }))
        );
        setStep("validate-users");
        return;
      }

      const usersToAdd = data.users.filter(
        ({ addToResourcePool }) => addToResourcePool
      );
      const userIds = usersToAdd.map(({ keycloakId }) => keycloakId);
      addUsersToResourcePool({ resourcePoolId: resourcePool.id, userIds });
    },
    [addUsersToResourcePool, resourcePool.id, setError, setValue, step]
  );

  const watchUserEmails = watch("userEmails");
  const userEmailsCount = useMemo(() => {
    const userEmailList = parseUserEmails(watchUserEmails);
    return userEmailList.length;
  }, [watchUserEmails]);

  const watchUsers = watch("users");
  const isFetchingUsers = watchUsers.some(({ isFetching }) => isFetching);
  const usersToAdd = watchUsers.filter(
    ({ addToResourcePool }) => addToResourcePool
  ).length;

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      setStep("input-emails");
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  return (
    <Modal
      className={styles.modal}
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      scrollable
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>
        Add a batch of users to Resource Pool: {resourcePool.name}
      </ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkErrorAlert error={result.error} />}

          {step === "input-emails" && (
            <div>
              <Label
                className="form-label"
                for="addManyUsersToResourcePoolUsers"
              >
                Users
              </Label>
              <FormText id="addManyUsersToResourcePoolUsersHelp" tag="div">
                Paste here a list of user emails, one by line.
              </FormText>
              <Controller
                control={control}
                name="userEmails"
                render={({ field }) => (
                  <textarea
                    aria-describedby="addManyUsersToResourcePoolUsersHelp"
                    id="addManyUsersToResourcePoolUsers"
                    className={cx(
                      "form-control",
                      errors.userEmails && "is-invalid"
                    )}
                    placeholder={USERS_EMAILS_PLACEHOLDER}
                    rows={10}
                    {...field}
                  />
                )}
                rules={{ required: true }}
              />
              <div className="invalid-feedback">
                Please provide a list of emails
              </div>
            </div>
          )}

          {step === "validate-users" && (
            <div>
              <div className="form-label">Users</div>
              <ol className="list-group">
                {userFields.map((item, index) => (
                  <UserItem
                    key={index}
                    className={cx(
                      index == 0 && "rounded-top",
                      index + 1 == userFields.length && "rounded-bottom"
                    )}
                    control={control}
                    index={index}
                    item={item}
                    setValue={setValue}
                    watch={watch}
                  />
                ))}
              </ol>
            </div>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        {step === "validate-users" && (
          <Button
            className="btn-outline-rk-green"
            onClick={onGoBack}
            type="button"
          >
            <ArrowLeft className={cx("bi", "me-1")} />
            Back
          </Button>
        )}
        {step === "input-emails" && (
          <Button
            disabled={userEmailsCount == 0}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            Next: find ({userEmailsCount}) users
            <ArrowRight className={cx("bi", "ms-1")} />
          </Button>
        )}
        {step === "validate-users" && (
          <Button
            disabled={usersToAdd == 0 || result.isLoading || isFetchingUsers}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            {result.isLoading || isFetchingUsers ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <PersonFillAdd className={cx("bi", "me-1")} />
            )}
            Add ({usersToAdd}) users
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

type AddManyUsersToResourcePoolStep = "input-emails" | "validate-users";

interface AddManyUsersToResourcePoolForm {
  userEmails: string;
  users: UserInput[];
}

interface UserInput {
  email: string;
  isFetching: boolean;
  found: boolean;
  firstName: string;
  lastName: string;
  addToResourcePool: boolean;
  keycloakId: string;
}

function parseUserEmails(userEmails: string): string[] {
  return userEmails
    .split("\n")
    .map((email) => email.trim())
    .filter(Boolean);
}

interface UserItemProps {
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<AddManyUsersToResourcePoolForm, any>;
  index: number;
  item: FieldArrayWithId<AddManyUsersToResourcePoolForm, "users", "id">;
  setValue: UseFormSetValue<AddManyUsersToResourcePoolForm>;
  watch: UseFormWatch<AddManyUsersToResourcePoolForm>;
}

function UserItem({
  className,
  control,
  index,
  item,
  setValue,
  watch,
}: UserItemProps) {
  const realm = useKeycloakRealm();

  const userItem = watch(`users.${index}`);

  const {
    data: users,
    isFetching,
    isError,
  } = useGetKeycloakUsersQuery({ realm, search: item.email });

  const matchedUser = useMemo(() => {
    if (users == null) {
      return undefined;
    }
    const match = users.find(
      (keycloakUser) =>
        keycloakUser.email.toLowerCase() === item.email.toLowerCase()
    );
    return match;
  }, [item.email, users]);

  useEffect(() => {
    if (isFetching) {
      return;
    }
    if (isError || matchedUser == null) {
      setValue(`users.${index}.isFetching`, false);
      setValue(`users.${index}.found`, false);
      return;
    }

    setValue(`users.${index}.isFetching`, false);
    setValue(`users.${index}.found`, true);
    setValue(`users.${index}.email`, matchedUser.email);
    setValue(`users.${index}.firstName`, matchedUser.firstName);
    setValue(`users.${index}.lastName`, matchedUser.lastName);
    setValue(`users.${index}.addToResourcePool`, true);
    setValue(`users.${index}.keycloakId`, matchedUser.id);
  }, [index, isError, isFetching, matchedUser, setValue]);

  return (
    <li
      className={cx(
        className,
        "list-group-item",
        "d-flex",
        "flex-row",
        "flex-wrap",
        "justify-content-between",
        "align-items-center",
        "bg-rk-white",
        !userItem.isFetching && !userItem.found && "text-danger"
      )}
    >
      {userItem.isFetching ? (
        <span>
          <Loader className="me-1" inline size={16} />
          {userItem.email}
        </span>
      ) : !userItem.found ? (
        <span>
          <ExclamationCircleFill className={cx("bi", "me-1")} />
          {userItem.email}
        </span>
      ) : (
        <div className="form-check">
          <Controller
            control={control}
            name={`users.${index}.addToResourcePool`}
            render={({ field }) => (
              <Input
                className="form-check-input"
                id={`addManyUsersToResourcePoolUserItem-${item.id}`}
                type="checkbox"
                checked={field.value}
                innerRef={field.ref}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
          <Label
            className="form-check-label"
            for={`addManyUsersToResourcePoolUserItem-${item.id}`}
          >
            {userItem.email}
          </Label>
        </div>
      )}
      {userItem.isFetching ? (
        <span className="fst-italic">Fetching...</span>
      ) : userItem.found ? (
        <span>
          {userItem.firstName} {userItem.lastName}
        </span>
      ) : (
        <span className="fst-italic">User not found</span>
      )}
    </li>
  );
}
