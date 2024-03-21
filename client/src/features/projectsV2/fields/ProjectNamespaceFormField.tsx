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

import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ThreeDots } from "react-bootstrap-icons";
import Select, {
  ClassNamesConfig,
  components,
  GroupBase,
  MenuListProps,
  OptionProps,
  SelectComponentsConfig,
  SingleValue,
  SingleValueProps,
} from "react-select";
import { Button, FormText, Label, UncontrolledTooltip } from "reactstrap";

import type { FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { ErrorAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import type { PaginatedState } from "../../session/components/options/fetchMore.types";
import type { GetNamespacesApiResponse } from "../api/projectV2.enhanced-api";
import {
  projectV2Api,
  useGetNamespacesQuery,
  useLazyGetNamespacesQuery,
} from "../api/projectV2.enhanced-api";

import type { GenericFormFieldProps } from "./formField.types";
import styles from "./ProjectNamespaceFormField.module.scss";
import { useDispatch } from "react-redux";

type ResponseNamespaces = GetNamespacesApiResponse["namespaces"];
type ResponseNamespace = ResponseNamespaces[number];

const selectComponents: SelectComponentsConfig<
  ResponseNamespace,
  false,
  GroupBase<ResponseNamespace>
> = {
  DropdownIndicator: (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown size="20" />
      </components.DropdownIndicator>
    );
  },
  Option: (
    props: OptionProps<ResponseNamespace, false, GroupBase<ResponseNamespace>>
  ) => {
    const { data: namespace } = props;
    return (
      <components.Option {...props}>
        <OptionOrSingleValueContent namespace={namespace} />
      </components.Option>
    );
  },
  SingleValue: (
    props: SingleValueProps<
      ResponseNamespace,
      false,
      GroupBase<ResponseNamespace>
    >
  ) => {
    const { data: namespace } = props;
    return (
      <components.SingleValue {...props}>
        <OptionOrSingleValueContent namespace={namespace} />
      </components.SingleValue>
    );
  },
};

interface CustomMenuListProps {
  hasMore: boolean | undefined;
  isFetchingMore: boolean | undefined;
  onFetchMore?: () => void;
}

function CustomMenuList({
  hasMore,
  isFetchingMore,
  onFetchMore,
}: CustomMenuListProps) {
  return function CustomMenuListInner(
    props: MenuListProps<ResponseNamespace, false>
  ) {
    return (
      <components.MenuList {...props}>
        {props.children}
        {hasMore && (
          <div className={cx("d-flex", "px-3", "pt-1")}>
            <Button
              className={cx("btn-outline-rk-green")}
              disabled={isFetchingMore}
              onClick={onFetchMore}
              size="sm"
            >
              {isFetchingMore ? (
                <Loader className="me-2" inline size={16} />
              ) : (
                <ThreeDots className={cx("bi", "me-2")} />
              )}
              Fetch more
            </Button>
          </div>
        )}
      </components.MenuList>
    );
  };
}

interface NamespaceSelectorProps {
  currentNamespace?: string;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  namespaces: ResponseNamespaces;
  onChange?: (newValue: SingleValue<ResponseNamespace>) => void;
  onFetchMore?: () => void;
}

function NamespaceSelector({
  currentNamespace,
  hasMore,
  isFetchingMore,
  namespaces,
  onChange,
  onFetchMore,
}: NamespaceSelectorProps) {
  const currentValue = useMemo(
    () => namespaces.find(({ slug }) => slug === currentNamespace),
    [namespaces, currentNamespace]
  );

  const components = useMemo(
    () => ({
      ...selectComponents,
      MenuList: CustomMenuList({ hasMore, isFetchingMore, onFetchMore }),
    }),
    [hasMore, isFetchingMore, onFetchMore]
  );

  return (
    <Select
      options={namespaces}
      value={currentValue}
      unstyled
      getOptionValue={(option) => option.id}
      getOptionLabel={(option) => option.slug}
      onChange={onChange}
      classNames={selectClassNames}
      // see https://stackoverflow.com/a/63844955/5804638
      classNamePrefix="namespace-select"
      components={components}
      isClearable={false}
      isSearchable={false}
      isLoading={isFetchingMore}
    />
  );
}

const selectClassNames: ClassNamesConfig<ResponseNamespace, false> = {
  control: ({ menuIsOpen }) =>
    cx(
      menuIsOpen ? "rounded-top" : "rounded",
      "border",
      "py-2",
      styles.control,
      menuIsOpen && styles.controlIsOpen
    ),
  dropdownIndicator: () => cx("pe-3"),
  menu: () =>
    cx("rounded-bottom", "border", "border-top-0", "px-0", "py-2", styles.menu),
  menuList: () => cx("d-grid"),
  option: ({ isFocused, isSelected }) =>
    cx(
      "d-flex",
      "flex-column",
      "flex-sm-row",
      "align-items-start",
      "align-items-sm-center",
      "column-gap-3",
      "px-3",
      "py-1",
      styles.option,
      isFocused && styles.optionIsFocused,
      !isFocused && isSelected && styles.optionIsSelected
    ),
  placeholder: () => cx("px-3"),
  singleValue: () =>
    cx(
      "d-flex",
      "flex-column",
      "flex-sm-row",
      "align-items-start",
      "align-items-sm-center",
      "column-gap-3",
      "px-3",
      styles.singleValue
    ),
};

export default function ProjectNamespaceFormField<T extends FieldValues>({
  control,
  entityName,
  errors,
  name,
}: GenericFormFieldProps<T>) {
  // Handle forced refresh
  const dispatch = useDispatch();
  const refetch = useCallback(() => {
    dispatch(projectV2Api.util.invalidateTags(["Namespace"]));
  }, [dispatch]);
  return (
    <div className="mb-3">
      <Label className="form-label" for={`${entityName}-namespace`}>
        Namespaces
        <RefreshNamespacesButton refresh={refetch} />
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const fields: Partial<typeof field> = { ...field };
          delete fields?.ref;
          return (
            <ProjectNamespaceControl
              {...fields}
              aria-describedby={`${entityName}NamespaceHelp`}
              className={cx(errors.namespace && "is-invalid")}
              data-cy={`${entityName}-namespace-input`}
              id={`${entityName}-namespace`}
              onChange={(newValue) => field.onChange(newValue?.slug)}
            />
          );
        }}
        rules={{ required: true, maxLength: 99, pattern: /^[a-z0-9-]+$/ }}
      />
      <div className="invalid-feedback">
        A project must belong to a namespace.
      </div>
      <FormText id={`${entityName}NamespaceHelp`} className="input-hint">
        The user or group namespace where this project should be located.
      </FormText>
    </div>
  );
}

interface ProjectNamespaceControlProps {
  className: string;
  "data-cy": string;
  id: string;
  onChange: (newValue: SingleValue<ResponseNamespace>) => void;
  value?: string;
}

function ProjectNamespaceControl(props: ProjectNamespaceControlProps) {
  const { className, id, onChange, value } = props;
  const dataCy = props["data-cy"];
  const {
    data: namespacesFirstPage,
    isError,
    isFetching,
    requestId,
  } = useGetNamespacesQuery({});

  const [
    { data: allNamespaces, fetchedPages, hasMore, currentRequestId },
    setState,
  ] = useState<PaginatedState<ResponseNamespace>>({
    data: undefined,
    fetchedPages: 0,
    hasMore: true,
    currentRequestId: "",
  });

  const [fetchNamespacesPage, namespacesPageResult] =
    useLazyGetNamespacesQuery();
  const onFetchMore = useCallback(() => {
    const request = fetchNamespacesPage({
      page: fetchedPages + 1,
      perPage: namespacesFirstPage?.perPage,
    });
    setState((prevState: PaginatedState<ResponseNamespace>) => ({
      ...prevState,
      currentRequestId: request.requestId,
    }));
  }, [namespacesFirstPage?.perPage, fetchNamespacesPage, fetchedPages]);

  useEffect(() => {
    if (namespacesFirstPage == null) {
      return;
    }
    setState({
      data: namespacesFirstPage.namespaces,
      fetchedPages: namespacesFirstPage.page ?? 0,
      hasMore: namespacesFirstPage.totalPages > namespacesFirstPage.page,
      currentRequestId: "",
    });
    ``;
  }, [namespacesFirstPage, requestId]);

  useEffect(() => {
    if (
      allNamespaces == null ||
      namespacesPageResult.currentData == null ||
      currentRequestId !== namespacesPageResult.requestId
    ) {
      return;
    }
    setState({
      data: [...allNamespaces, ...namespacesPageResult.currentData.namespaces],
      fetchedPages: namespacesPageResult.currentData.page ?? 0,
      hasMore:
        namespacesPageResult.currentData.totalPages >
        namespacesPageResult.currentData.page,
      currentRequestId: "",
    });
  }, [
    allNamespaces,
    namespacesPageResult.currentData,
    namespacesPageResult.requestId,
    currentRequestId,
  ]);

  if (isFetching) {
    return (
      <div className={cx(className, "form-control")} id={id}>
        <Loader className="me-1" inline size={16} />
        Loading namespaces...
      </div>
    );
  }

  if (!allNamespaces || isError) {
    return (
      <div className={className} id={id}>
        <ErrorAlert>
          <p className="mb-0">Error: could not fetch namespaces.</p>
        </ErrorAlert>
      </div>
    );
  }

  return (
    <div className={className} data-cy={dataCy} id={id}>
      <NamespaceSelector
        currentNamespace={value}
        hasMore={hasMore}
        isFetchingMore={namespacesPageResult.isFetching}
        namespaces={allNamespaces}
        onChange={onChange}
        onFetchMore={onFetchMore}
      />
    </div>
  );
}

interface OptionOrSingleValueContentProps {
  namespace: ResponseNamespace;
}

function OptionOrSingleValueContent({
  namespace,
}: OptionOrSingleValueContentProps) {
  return (
    <>
      <span className={cx(styles.slug)}>{namespace.slug}</span>
      <span className={cx("fst-italic", "text-body-secondary", styles.kind)}>
        ({namespace.namespace_kind})
      </span>
    </>
  );
}

interface RefreshNamespacesButtonProps {
  refresh: () => void;
}

function RefreshNamespacesButton({ refresh }: RefreshNamespacesButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        className={cx("ms-2", "p-0")}
        color="link"
        innerRef={ref}
        onClick={refresh}
        size="sm"
      >
        <FontAwesomeIcon icon={faSyncAlt} />
      </Button>
      <UncontrolledTooltip placement="top" target={ref}>
        Refresh namespaces
      </UncontrolledTooltip>
    </>
  );
}
