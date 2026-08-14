/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { useCallback, useEffect, useMemo, useState } from "react";
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
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
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
  MEMBER_TYPE_OPTIONS,
  parseBatchInput,
} from "./addMemberToResourcePool.utils";
import BatchInputSection from "./BatchInputSection";
import {
  GroupAutoSuggest,
  ProjectAutoSuggest,
  UserAutoSuggest,
} from "./MemberAutoSuggest";

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

  const onGoToInput = useCallback(() => {
    setValue("batchItems", []);
  }, [setValue]);

  const watchBatchItems = watch("batchItems");
  const watchBatchInput = watch("batchInput");

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

  const selectedCount = useMemo(
    () => watchBatchItems.filter((item) => item.addToResourcePool).length,
    [watchBatchItems],
  );
  const isFetchingBatchItems = useMemo(
    () => watchBatchItems.some((item) => item.isFetching),
    [watchBatchItems],
  );

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
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader tag="h2" toggle={toggle}>
        Add Member to Resource Pool: {resourcePool.name}
      </ModalHeader>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkOrDataServicesError error={result.error} />}

          <div className={"mb-3"}>
            <Label className="form-label">Member type</Label>
            <ButtonGroup>
              {MEMBER_TYPE_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  active={memberType === value}
                  color="outline-primary"
                  onClick={() => {
                    setMemberType(value);
                    onResetMember();
                    setValue("batchInput", "");
                    setValue("batchItems", []);
                  }}
                  type="button"
                >
                  {label}
                </Button>
              ))}
            </ButtonGroup>
          </div>

          <div className={"mb-3"}>
            <Label className="form-label">Input mode</Label>
            <ButtonGroup>
              {INPUT_MODE_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  active={inputMode === value}
                  color="outline-primary"
                  onClick={() => {
                    setInputMode(value);
                    onResetMember();
                    setValue("batchInput", "");
                    setValue("batchItems", []);
                  }}
                  type="button"
                >
                  {label}
                </Button>
              ))}
            </ButtonGroup>
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
        <Button className="btn-outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        {inputMode === "batch" && watchBatchItems.length > 0 && (
          <Button
            className="btn-outline-rk-green"
            onClick={onGoToInput}
            type="button"
          >
            <ArrowLeft className={cx("bi", "me-1")} />
            Back
          </Button>
        )}
        {inputMode === "search" && (
          <Button
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
            disabled={parseBatchInput(watchBatchInput, memberType).length === 0}
            onClick={onFindBatchItems}
            type="button"
          >
            Next: find ({parseBatchInput(watchBatchInput, memberType).length})
            <ArrowRight className={cx("bi", "ms-1")} />
          </Button>
        )}
        {inputMode === "batch" && watchBatchItems.length > 0 && (
          <Button
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
    </Modal>
  );
}

const INPUT_MODE_OPTIONS: { value: InputMode; label: string }[] = [
  { value: "search", label: "Search" },
  { value: "batch", label: "Batch" },
];

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
        <div className={"mb-3"}>
          <Label className="form-label">
            Selected {MEMBER_TYPE_LABELS[memberType].singular}
          </Label>
          <InputGroup>
            <Input
              className="rounded-0 rounded-start"
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
          {memberType === "user" && <UserAutoSuggest onPick={onPickMember} />}
          {memberType === "group" && <GroupAutoSuggest onPick={onPickMember} />}
          {memberType === "project" && (
            <ProjectAutoSuggest onPick={onPickMember} />
          )}
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
