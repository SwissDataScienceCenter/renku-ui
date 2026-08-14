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
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cx from "classnames";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Autosuggest, {
  ChangeEvent,
  InputProps,
  SuggestionSelectedEventData,
  SuggestionsFetchRequestedParams,
} from "react-autosuggest";
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
  useFieldArray,
  useForm,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  Button,
  ButtonGroup,
  Form,
  FormText,
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
  useGetGroupsByGroupSlugQuery,
  useGetNamespacesByFirstSlugAndSecondSlugQuery,
} from "~/features/projectsV2/api/namespace.api";
import {
  useGetSearchQueryQuery,
  type SearchGroup,
  type SearchProject,
} from "~/features/searchV2/api/searchV2Api.api";
import {
  usePostResourcePoolsByResourcePoolIdMembersMutation,
  type PoolMember,
  type ResourcePoolWithId,
} from "../sessionsV2/api/computeResources.api";
import adminKeycloakApi, {
  useGetKeycloakUsersQuery,
} from "./adminKeycloak.api";
import { KeycloakUser } from "./adminKeycloak.types";
import useKeycloakRealm from "./useKeycloakRealm.hook";

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

type MemberType = "user" | "group" | "project";
type InputMode = "search" | "batch";

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

const MEMBER_TYPE_OPTIONS: { value: MemberType; label: string }[] = [
  { value: "user", label: "User" },
  { value: "group", label: "Group" },
  { value: "project", label: "Project" },
];

const MEMBER_TYPE_LABELS: Record<
  MemberType,
  { singular: string; plural: string }
> = {
  user: { singular: "User", plural: "Users" },
  group: { singular: "Group", plural: "Groups" },
  project: { singular: "Project", plural: "Projects" },
};

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

interface MemberAutoSuggestProps<T> {
  placeholder: string;
  suggestions: T[];
  value: string;
  onValueChange: (value: string) => void;
  getSuggestionValue: (suggestion: T) => string;
  renderSuggestion: (suggestion: T) => ReactNode;
  onSuggestionSelected: (suggestion: T) => void;
  onSuggestionsFetchRequested?: (value: string) => void;
}

function MemberAutoSuggest<T>({
  placeholder,
  suggestions,
  value,
  onValueChange,
  getSuggestionValue,
  renderSuggestion,
  onSuggestionSelected,
  onSuggestionsFetchRequested,
}: MemberAutoSuggestProps<T>) {
  const onChange = useCallback(
    (_event: FormEvent<HTMLElement>, { newValue }: ChangeEvent) => {
      onValueChange(newValue);
    },
    [onValueChange],
  );

  const inputProps: InputProps<T> = { placeholder, value, onChange };

  const handleSuggestionsFetchRequested = useCallback(
    ({ value }: SuggestionsFetchRequestedParams) => {
      onSuggestionsFetchRequested?.(value);
    },
    [onSuggestionsFetchRequested],
  );

  const handleSuggestionSelected = useCallback(
    (
      _event: FormEvent<HTMLElement>,
      { suggestion }: SuggestionSelectedEventData<T>,
    ) => {
      onSuggestionSelected(suggestion);
    },
    [onSuggestionSelected],
  );

  return (
    <Autosuggest<T>
      suggestions={suggestions}
      inputProps={inputProps}
      getSuggestionValue={getSuggestionValue}
      onSuggestionsClearRequested={() => {}}
      onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
      onSuggestionSelected={handleSuggestionSelected}
      renderSuggestion={renderSuggestion}
    />
  );
}

function UserAutoSuggest({
  onPick,
}: {
  onPick: (member: PickedMember | null | undefined) => void;
}) {
  const realm = useKeycloakRealm();
  const [value, setValue] = useState("");
  const [getKeycloakUsers, { data: users }] =
    adminKeycloakApi.useLazyGetKeycloakUsersQuery();

  const onSuggestionsFetchRequested = useCallback(
    (searchValue: string) =>
      getKeycloakUsers(
        { realm, search: searchValue },
        /*preferCacheValue=*/ true,
      ),
    [getKeycloakUsers, realm],
  );

  const onSuggestionSelected = useCallback(
    (suggestion: KeycloakUser) => {
      onPick({
        type: "user",
        id: suggestion.id,
        email: suggestion.email,
        firstName: suggestion.firstName,
        lastName: suggestion.lastName,
      });
    },
    [onPick],
  );

  const getSuggestionValue = useCallback(
    ({ firstName, lastName }: KeycloakUser) => `${firstName} ${lastName}`,
    [],
  );

  const renderSuggestion = ({ firstName, lastName, email }: KeycloakUser) => (
    <div>
      {firstName} {lastName} &lt;{email}&gt;
    </div>
  );

  return (
    <MemberAutoSuggest
      placeholder="Search for a user's name or email"
      suggestions={users ?? []}
      value={value}
      onValueChange={setValue}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={onSuggestionSelected}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
    />
  );
}

function GroupAutoSuggest({
  onPick,
}: {
  onPick: (member: PickedMember | null | undefined) => void;
}) {
  const [value, setValue] = useState("");
  const { data: searchResult } = useGetSearchQueryQuery(
    { params: { q: value, page: 1, per_page: 20 } },
    { skip: value.length < 2 },
  );

  const suggestions = useMemo(
    () =>
      (searchResult?.items ?? []).filter(
        (item): item is SearchGroup => item.type === "Group",
      ),
    [searchResult],
  );

  const onSuggestionSelected = useCallback(
    (suggestion: SearchGroup) => {
      onPick({
        type: "group",
        id: suggestion.id,
        name: suggestion.name,
        slug: suggestion.slug,
      });
    },
    [onPick],
  );

  const getSuggestionValue = useCallback(
    (group: SearchGroup) => `${group.name} (${group.slug})`,
    [],
  );

  const renderSuggestion = (group: SearchGroup) => (
    <div>{`${group.name} (${group.slug})`}</div>
  );

  return (
    <MemberAutoSuggest
      placeholder="Search for a group by name or slug"
      suggestions={suggestions}
      value={value}
      onValueChange={setValue}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={onSuggestionSelected}
    />
  );
}

function ProjectAutoSuggest({
  onPick,
}: {
  onPick: (member: PickedMember | null | undefined) => void;
}) {
  const [value, setValue] = useState("");
  const { data: searchResult } = useGetSearchQueryQuery(
    { params: { q: value, page: 1, per_page: 20 } },
    { skip: value.length < 2 },
  );

  const suggestions = useMemo(
    () =>
      (searchResult?.items ?? []).filter(
        (item): item is SearchProject => item.type === "Project",
      ),
    [searchResult],
  );

  const getNamespaceLabel = (project: SearchProject) =>
    project.namespace?.type === "Group"
      ? project.namespace.name
      : (project.namespace?.slug ?? project.path);

  const onSuggestionSelected = useCallback(
    (suggestion: SearchProject) => {
      onPick({
        type: "project",
        id: suggestion.id,
        name: suggestion.name,
        namespace: getNamespaceLabel(suggestion),
        slug: suggestion.slug,
      });
    },
    [onPick],
  );

  const getSuggestionValue = useCallback(
    (project: SearchProject) =>
      `${project.name} (${getNamespaceLabel(project)})`,
    [],
  );

  const renderSuggestion = (project: SearchProject) => (
    <div>{`${project.name} (${getNamespaceLabel(project)})`}</div>
  );

  return (
    <MemberAutoSuggest
      placeholder="Search for a project by name or namespace"
      suggestions={suggestions}
      value={value}
      onValueChange={setValue}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={onSuggestionSelected}
    />
  );
}

interface BatchInputSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<AddMemberToResourcePoolForm, any>;
  errors: { batchInput?: { type?: string } };
  fields: FieldArrayWithId<AddMemberToResourcePoolForm, "batchItems", "id">[];
  memberType: MemberType;
  onFind: () => void;
  setValue: UseFormSetValue<AddMemberToResourcePoolForm>;
  watch: UseFormWatch<AddMemberToResourcePoolForm>;
}

function BatchInputSection({
  control,
  errors,
  fields,
  memberType,
  onFind,
  setValue,
  watch,
}: BatchInputSectionProps) {
  if (fields.length === 0) {
    return (
      <div>
        <Label className="form-label" for="addMembersBatchInput">
          {MEMBER_TYPE_LABELS[memberType].plural}
        </Label>
        <FormText id="addMembersBatchInputHelp" tag="div">
          {BATCH_INPUT_HELP[memberType]}
        </FormText>
        <Controller
          control={control}
          name="batchInput"
          render={({ field }) => (
            <textarea
              aria-describedby="addMembersBatchInputHelp"
              className={cx("form-control", errors.batchInput && "is-invalid")}
              id="addMembersBatchInput"
              placeholder={BATCH_INPUT_PLACEHOLDER[memberType]}
              rows={10}
              {...field}
            />
          )}
          rules={{ required: true }}
        />
        <div className="invalid-feedback">Please provide a list</div>
        <Button className="mt-2" onClick={onFind}>
          Find {MEMBER_TYPE_LABELS[memberType].plural}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="form-label">{MEMBER_TYPE_LABELS[memberType].plural}</div>
      <ol className="list-group">
        {fields.map((item, index) => (
          <BatchItemRow
            key={item.id}
            className={cx(
              index === 0 && "rounded-top",
              index + 1 === fields.length && "rounded-bottom",
            )}
            control={control}
            index={index}
            item={item}
            memberType={memberType}
            setValue={setValue}
            watch={watch}
          />
        ))}
      </ol>
    </div>
  );
}

const BATCH_INPUT_HELP: Record<MemberType, string> = {
  user: "Paste a list of user emails, one per line.",
  group: "Paste a list of group slugs, one per line.",
  project: "Paste a list of project paths (namespace/project), one per line.",
};

const BATCH_INPUT_PLACEHOLDER: Record<MemberType, string> = {
  user: "user_1@example.com\nuser_2@example.com",
  group: "my-group\nanother-group",
  project: "user/project-1\ngroup/project-2",
};

interface BatchItemRowProps {
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<AddMemberToResourcePoolForm, any>;
  index: number;
  item: FieldArrayWithId<AddMemberToResourcePoolForm, "batchItems", "id">;
  memberType: MemberType;
  setValue: UseFormSetValue<AddMemberToResourcePoolForm>;
  watch: UseFormWatch<AddMemberToResourcePoolForm>;
}

function BatchItemRow({
  className,
  control,
  index,
  item,
  memberType,
  setValue,
  watch,
}: BatchItemRowProps) {
  const batchItem = watch(`batchItems.${index}`) as BatchItemForm;
  const resolved = useResolveBatchItem(memberType, item.input);

  useEffect(() => {
    if (resolved.isFetching) {
      return;
    }

    setValue(`batchItems.${index}.isFetching`, false);
    setValue(`batchItems.${index}.found`, resolved.found);
    setValue(`batchItems.${index}.addToResourcePool`, resolved.found);
    setValue(`batchItems.${index}.id`, resolved.id ?? "");
    setValue(`batchItems.${index}.name`, resolved.name ?? "");
  }, [index, resolved, setValue]);

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
        !batchItem.isFetching && !batchItem.found && "text-danger",
      )}
    >
      {batchItem.isFetching ? (
        <span>
          <Loader className="me-1" inline size={16} />
          {batchItem.input}
        </span>
      ) : !batchItem.found ? (
        <span>
          <ExclamationCircleFill className={cx("bi", "me-1")} />
          {batchItem.input}
        </span>
      ) : (
        <div className="form-check">
          <Controller
            control={control}
            name={`batchItems.${index}.addToResourcePool`}
            render={({ field }) => (
              <Input
                className="form-check-input"
                id={`addMemberBatchItem-${item.id}`}
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
            for={`addMemberBatchItem-${item.id}`}
          >
            {batchItem.input}
          </Label>
        </div>
      )}
      {batchItem.isFetching ? (
        <span className="fst-italic">Fetching...</span>
      ) : batchItem.found ? (
        <span>{batchItem.name}</span>
      ) : (
        <span className="fst-italic">
          {MEMBER_TYPE_LABELS[memberType].singular} not found
        </span>
      )}
    </li>
  );
}

function useResolveBatchItem(memberType: MemberType, input: string) {
  const realm = useKeycloakRealm();

  const {
    data: users,
    isFetching: isFetchingUser,
    isError: isUserError,
  } = useGetKeycloakUsersQuery(
    { realm, search: input },
    { skip: memberType !== "user" },
  );

  const matchedUser = useMemo(() => {
    if (memberType !== "user" || users == null) {
      return undefined;
    }
    return users.find(
      (keycloakUser) =>
        keycloakUser.email.toLowerCase() === input.toLowerCase(),
    );
  }, [input, memberType, users]);

  const {
    data: group,
    isFetching: isFetchingGroup,
    isError: isGroupError,
  } = useGetGroupsByGroupSlugQuery(
    { groupSlug: input },
    { skip: memberType !== "group" },
  );

  const [firstSlug, secondSlug] = useMemo(() => {
    const parts = input.split("/").map((part) => part.trim());
    return parts.length === 2 ? parts : ["", ""];
  }, [input]);
  const enabled = firstSlug.length > 0 && secondSlug.length > 0;

  const {
    data: namespace,
    isFetching: isFetchingProject,
    isError: isProjectError,
  } = useGetNamespacesByFirstSlugAndSecondSlugQuery(
    { firstSlug, secondSlug },
    { skip: memberType !== "project" || !enabled },
  );

  return useMemo(() => {
    switch (memberType) {
      case "user": {
        if (isFetchingUser) {
          return { isFetching: true, found: false };
        }
        if (isUserError || matchedUser == null) {
          return { isFetching: false, found: false };
        }
        return {
          isFetching: false,
          found: true,
          id: matchedUser.id,
          name: `${matchedUser.firstName} ${matchedUser.lastName}`,
        };
      }
      case "group": {
        if (isFetchingGroup) {
          return { isFetching: true, found: false };
        }
        if (isGroupError || group == null) {
          return { isFetching: false, found: false };
        }
        return {
          isFetching: false,
          found: true,
          id: group.id,
          name: group.name,
        };
      }
      case "project": {
        if (isFetchingProject) {
          return { isFetching: true, found: false };
        }
        if (
          isProjectError ||
          namespace == null ||
          namespace.namespace_kind !== "project"
        ) {
          return { isFetching: false, found: false };
        }
        return {
          isFetching: false,
          found: true,
          id: namespace.id,
          name: namespace.name ?? namespace.slug,
        };
      }
    }
  }, [
    group,
    isFetchingGroup,
    isFetchingProject,
    isFetchingUser,
    isGroupError,
    isProjectError,
    isUserError,
    matchedUser,
    memberType,
    namespace,
  ]);
}

type PickedMember = PickedUser | PickedGroup | PickedProject;

interface PickedUser {
  type: "user";
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface PickedGroup {
  type: "group";
  id: string;
  name: string;
  slug: string;
}

interface PickedProject {
  type: "project";
  id: string;
  name: string;
  namespace: string;
  slug: string;
}

interface BatchItemForm {
  input: string;
  isFetching: boolean;
  found: boolean;
  addToResourcePool: boolean;
  id?: string;
  name?: string;
}

interface AddMemberToResourcePoolForm {
  pickedMember?: PickedMember;
  batchInput: string;
  batchItems: BatchItemForm[];
}

function buildPoolMember(memberType: MemberType, id: string): PoolMember {
  switch (memberType) {
    case "user":
      return { member_type: "user", id, role: "viewer" };
    case "group":
      return { member_type: "group", id, role: "group_viewer" };
    case "project":
      return { member_type: "project", id, role: "project_viewer" };
  }
}

function parseBatchInput(input: string, memberType: MemberType): string[] {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (memberType === "project") {
    return lines.filter((line) => line.includes("/"));
  }
  return lines;
}
