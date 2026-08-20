/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cx from "classnames";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  PeopleFill,
  PersonFillAdd,
  XLg,
} from "react-bootstrap-icons";
import { useFieldArray, useForm } from "react-hook-form";
import {
  Button,
  ButtonGroup,
  Form,
  Input,
  InputGroup,
  Label,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import ScrollableModal from "~/components/modal/ScrollableModal";
import {
  usePostResourcePoolsByResourcePoolIdMembersMutation,
  type PoolMember,
  type ResourcePoolWithId,
} from "../sessionsV2/api/computeResources.api";
import type {
  AddMemberToResourcePoolForm,
  InputMode,
  MemberType,
  PickedMember,
} from "./addMemberToResourcePool.types";
import {
  buildPoolMember,
  MEMBER_TYPE_LABELS,
  parseBatchInput,
} from "./addMemberToResourcePool.utils";
import BatchInputSection from "./BatchInputSection";
import { GroupSelect, ProjectSelect, UserSelect } from "./MemberSelect";

const INPUT_MODE_OPTIONS = [
  {
    value: "search" as const,
    icon: PersonFillAdd,
    title: "Search",
    blurb: "Find and add a single member.",
  },
  {
    value: "batch" as const,
    icon: PeopleFill,
    title: "Batch",
    blurb: "Paste a list to add multiple members at once.",
  },
];

interface AddMemberToResourcePoolButtonProps {
  resourcePool: ResourcePoolWithId;
}

export default function AddMemberToResourcePoolButton({
  resourcePool,
}: AddMemberToResourcePoolButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <>
      <Button color="outline-primary" onClick={toggle}>
        <PersonFillAdd className={cx("bi", "me-1")} />
        Add Member
      </Button>
      <AddMemberToResourcePoolModal
        isOpen={isOpen}
        resourcePool={resourcePool}
        toggle={toggle}
      />
    </>
  );
}

interface AddMemberToResourcePoolModalProps {
  isOpen: boolean;
  resourcePool: ResourcePoolWithId;
  toggle: () => void;
}

function AddMemberToResourcePoolModal({
  isOpen,
  resourcePool,
  toggle,
}: AddMemberToResourcePoolModalProps) {
  const [memberType, setMemberType] = useState<MemberType>("user");
  const [inputMode, setInputMode] = useState<InputMode>("search");

  const [addMembersToResourcePool, result] =
    usePostResourcePoolsByResourcePoolIdMembersMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<AddMemberToResourcePoolForm>({
    defaultValues: {
      batchInput: "",
      batchItems: [],
    },
  });

  const { fields: batchItemFields } = useFieldArray({
    control,
    name: "batchItems",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const pickedMember = watch("pickedMember");

  const onSubmit = useCallback(
    (data: AddMemberToResourcePoolForm) => {
      if (inputMode === "search") {
        if (pickedMember == null || pickedMember.type !== memberType) {
          return;
        }
        addMembersToResourcePool({
          resourcePoolId: resourcePool.id,
          poolMembers: [buildPoolMember(memberType, pickedMember.id)],
        });
        return;
      }

      const members = data.batchItems
        .filter((item) => item.addToResourcePool)
        .map((item) =>
          item.id ? buildPoolMember(memberType, item.id) : undefined,
        )
        .filter((member): member is PoolMember => member != null);

      if (members.length === 0) {
        setError("batchInput", { type: "required" });
        return;
      }

      addMembersToResourcePool({
        resourcePoolId: resourcePool.id,
        poolMembers: members,
      });
    },
    [
      addMembersToResourcePool,
      inputMode,
      memberType,
      pickedMember,
      resourcePool.id,
      setError,
    ],
  );

  const onPickMember = useCallback(
    (member: PickedMember | null | undefined) => {
      setValue("pickedMember", member ?? undefined);
    },
    [setValue],
  );

  const onResetMember = useCallback(() => {
    setValue("pickedMember", undefined);
  }, [setValue]);

  const resetInputState = useCallback(() => {
    onResetMember();
    setValue("batchInput", "");
    setValue("batchItems", []);
  }, [onResetMember, setValue]);

  const onGoToInput = useCallback(() => {
    setValue("batchItems", []);
  }, [setValue]);

  const watchBatchItems = watch("batchItems");
  const watchBatchInput = watch("batchInput");
  const parsedBatchInput = parseBatchInput(watchBatchInput, memberType);

  const onFindBatchItems = useCallback(() => {
    const inputs = parseBatchInput(watchBatchInput, memberType);
    if (inputs.length === 0) {
      setError("batchInput", { type: "required" });
      return;
    }

    setValue(
      "batchItems",
      inputs.map((input) => ({
        input,
        isFetching: true,
        found: false,
        addToResourcePool: false,
      })),
    );
  }, [memberType, setError, setValue, watchBatchInput]);

  const selectedCount = watchBatchItems.filter(
    (item) => item.addToResourcePool,
  ).length;
  const isFetchingBatchItems = watchBatchItems.some((item) => item.isFetching);

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
  }, [result.isSuccess, toggle]);

  useEffect(() => {
    if (!isOpen) {
      setMemberType("user");
      setInputMode("search");
      reset();
      result.reset();
    }
  }, [isOpen, reset, result]);

  return (
    <ScrollableModal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader tag="h2" toggle={toggle}>
        <PersonFillAdd className={cx("bi", "me-1")} />
        Add Member to Resource Pool: <b>{resourcePool.name}</b>
      </ModalHeader>
      <ModalBody>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          {result.error && <RtkOrDataServicesError error={result.error} />}

          <div className={cx("mb-3")}>
            <ButtonGroup className="w-100">
              {INPUT_MODE_OPTIONS.map(({ value, icon: Icon, title, blurb }) => (
                <Fragment key={value}>
                  <input
                    type="radio"
                    className="btn-check"
                    name="inputMode"
                    autoComplete="off"
                    checked={inputMode === value}
                    id={`add-member-input-mode-${value}-radio`}
                    onChange={() => {
                      setInputMode(value);
                      resetInputState();
                    }}
                  />
                  <label
                    className={cx(
                      "btn",
                      "btn-outline-primary",
                      "p-3",
                      "p-md-4",
                      "d-flex",
                      "w-50",
                    )}
                    data-cy={`add-member-input-mode-${value}`}
                    htmlFor={`add-member-input-mode-${value}-radio`}
                  >
                    <div
                      className={cx("d-flex", "flex-column", "gap-2", "w-100")}
                    >
                      <div className="fs-3">
                        <Icon className="me-1" />
                        <span className="fw-bold">{title}</span>
                      </div>
                      <p className="mb-0">{blurb}</p>
                    </div>
                  </label>
                </Fragment>
              ))}
            </ButtonGroup>
          </div>

          <div className={cx("mb-3")}>
            <Label className="form-label">Member type</Label>
            <div>
              <ButtonGroup>
                {(Object.keys(MEMBER_TYPE_LABELS) as MemberType[]).map(
                  (value) => (
                    <Button
                      key={value}
                      active={memberType === value}
                      color="outline-primary"
                      onClick={() => {
                        setMemberType(value);
                        resetInputState();
                      }}
                      type="button"
                    >
                      {MEMBER_TYPE_LABELS[value].singular}
                    </Button>
                  ),
                )}
              </ButtonGroup>
            </div>
          </div>

          {inputMode === "search" ? (
            <SearchInputSection
              memberType={memberType}
              onPickMember={onPickMember}
              onResetMember={onResetMember}
              pickedMember={pickedMember}
            />
          ) : (
            <BatchInputSection
              control={control}
              errors={errors}
              fields={batchItemFields}
              memberType={memberType}
              onFind={onFindBatchItems}
              setValue={setValue}
              watch={watch}
            />
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        {inputMode === "batch" && watchBatchItems.length > 0 && (
          <Button
            color="outline-primary"
            onClick={onGoToInput}
            type="button"
          >
            <ArrowLeft className={cx("bi", "me-1")} />
            Back
          </Button>
        )}
        {inputMode === "search" && (
          <Button
            color="primary"
            disabled={pickedMember == null || result.isLoading}
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <PersonFillAdd className={cx("bi", "me-1")} />
            )}
            Add {MEMBER_TYPE_LABELS[memberType].singular}
          </Button>
        )}
        {inputMode === "batch" && watchBatchItems.length === 0 && (
          <Button
            color="primary"
            disabled={parsedBatchInput.length === 0}
            onClick={onFindBatchItems}
            type="button"
          >
            Next: find ({parsedBatchInput.length})
            <ArrowRight className={cx("bi", "ms-1")} />
          </Button>
        )}
        {inputMode === "batch" && watchBatchItems.length > 0 && (
          <Button
            color="primary"
            disabled={
              selectedCount === 0 || result.isLoading || isFetchingBatchItems
            }
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            {result.isLoading || isFetchingBatchItems ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <PeopleFill className={cx("bi", "me-1")} />
            )}
            Add ({selectedCount}) {MEMBER_TYPE_LABELS[memberType].plural}
          </Button>
        )}
      </ModalFooter>
    </ScrollableModal>
  );
}

interface SearchInputSectionProps {
  memberType: MemberType;
  onPickMember: (member: PickedMember | null | undefined) => void;
  onResetMember: () => void;
  pickedMember?: PickedMember;
}

function SearchInputSection({
  memberType,
  onPickMember,
  onResetMember,
  pickedMember,
}: SearchInputSectionProps) {
  return (
    <div>
      {pickedMember != null ? (
        <div className="mb-3">
          <Label className="form-label">
            Selected {MEMBER_TYPE_LABELS[memberType].singular}
          </Label>
          <InputGroup>
            <Input
              className={cx("rounded-0", "rounded-start")}
              disabled
              type="text"
              value={renderPickedMemberLabel(pickedMember)}
            />
            <Button className="rounded-end" onClick={onResetMember}>
              <XLg className={cx("bi", "me-1")} />
              Clear
            </Button>
          </InputGroup>
        </div>
      ) : (
        <div className="mb-3">
          <Label className="form-label">
            {MEMBER_TYPE_LABELS[memberType].singular}
          </Label>
          {memberType === "user" && <UserSelect onPick={onPickMember} />}
          {memberType === "group" && <GroupSelect onPick={onPickMember} />}
          {memberType === "project" && <ProjectSelect onPick={onPickMember} />}
        </div>
      )}
    </div>
  );
}

function renderPickedMemberLabel(member: PickedMember): string {
  switch (member.type) {
    case "user":
      return `${member.firstName} ${member.lastName} <${member.email}>`;
    case "group":
      return `${member.name} (${member.slug})`;
    case "project":
      return `${member.name} (${member.namespace})`;
  }
}
