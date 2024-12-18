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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ThreeDots } from "react-bootstrap-icons";
import type { FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import Select, {
  ClassNamesConfig,
  GroupBase,
  MenuListProps,
  OptionProps,
  SelectComponentsConfig,
  SingleValue,
  SingleValueProps,
  components,
} from "react-select";
import { Button, Label } from "reactstrap";

import { ErrorAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import type { PaginatedState } from "../../session/components/options/fetchMore.types";
import type { GetNamespacesApiResponse } from "../api/projectV2.enhanced-api";
import {
  useGetNamespacesByNamespaceSlugQuery,
  useGetNamespacesQuery,
  useLazyGetNamespacesQuery,
} from "../api/projectV2.enhanced-api";
import type { GenericFormFieldProps } from "./formField.types";

import styles from "./ProjectNamespaceFormField.module.scss";

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
        <ChevronDown className="bi" />
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
          <div className={cx("d-grid")}>
            {/* TODO: Make this button accessible. At the moment, it cannot be used from keyboard-only navigation. */}
            <Button
              className={cx("rounded-0", "rounded-bottom")}
              color="secondary"
              disabled={isFetchingMore}
              onClick={onFetchMore}
            >
              {isFetchingMore ? (
                <Loader inline size={16} />
              ) : (
                <ThreeDots className="bi" />
              )}
              <span className="ms-2">Fetch more</span>
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
  inputId: string;
  isFetchingMore?: boolean;
  namespaces: ResponseNamespaces;
  onChange?: (newValue: SingleValue<ResponseNamespace>) => void;
  onFetchMore?: () => void;
}

function NamespaceSelector({
  currentNamespace,
  hasMore,
  inputId,
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
      inputId={inputId}
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
  control: ({ menuIsOpen, isFocused }) =>
    cx(
      menuIsOpen ? "rounded-top" : "rounded",
      "border",
      isFocused && "border-primary-subtle",
      styles.control
    ),
  dropdownIndicator: () => cx("pe-3"),
  menu: () =>
    cx(
      "bg-white",
      "rounded-bottom",
      "border",
      "border-top-0",
      "z-2",
      styles.zDropdown
    ),
  menuList: () => cx("d-grid"),
  option: ({ isFocused, isSelected }) =>
    cx(
      "d-flex",
      "flex-column",
      "flex-sm-row",
      "column-gap-3",
      "px-3",
      "py-2",
      styles.option,
      isFocused && styles.optionIsFocused,
      !isFocused && isSelected && styles.optionIsSelected
    ),
  placeholder: () => cx("px-3"),
  singleValue: () =>
    cx("d-flex", "flex-column", "flex-sm-row", "column-gap-3", "px-3"),
};

interface ProjectNamespaceFormFieldProps<T extends FieldValues>
  extends GenericFormFieldProps<T> {
  ensureNamespace?: string;
}

export default function ProjectNamespaceFormField<T extends FieldValues>({
  control,
  entityName,
  ensureNamespace,
  errors,
  helpText,
  name,
}: ProjectNamespaceFormFieldProps<T>) {
  return (
    <div>
      <Label className="form-label" for={`${entityName}-namespace-input`}>
        Owner
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
              className={cx(errors.namespace && "is-invalid")}
              data-cy={`${entityName}-namespace-input`}
              ensureNamespace={ensureNamespace}
              id={`${entityName}-namespace`}
              inputId={`${entityName}-namespace-input`}
              onChange={(newValue) => field.onChange(newValue?.slug)}
            />
          );
        }}
        rules={{
          required: true,
          maxLength: 99,
          pattern:
            /^(?!.*\.git$|.*\.atom$|.*[-._][-._].*)[a-zA-Z0-9][a-zA-Z0-9\-_.]*$/,
        }}
      />
      <div className="invalid-feedback">A project must belong to an owner.</div>
      {helpText}
    </div>
  );
}

interface ProjectNamespaceControlProps {
  className: string;
  "data-cy": string;
  ensureNamespace?: string;
  id: string;
  inputId: string;
  onChange: (newValue: SingleValue<ResponseNamespace>) => void;
  value?: string;
}

export function ProjectNamespaceControl({
  className,
  ensureNamespace,
  id,
  inputId,
  onChange,
  value,
  "data-cy": dataCy,
}: ProjectNamespaceControlProps) {
  const {
    data: namespacesFirstPage,
    isError,
    isFetching,
    requestId,
  } = useGetNamespacesQuery({ params: { minimum_role: "editor" } });
  const {
    data: specificNamespace,
    isError: specificNamespaceIsError,
    requestId: specificNamespaceRequestId,
  } = useGetNamespacesByNamespaceSlugQuery(
    ensureNamespace ? { namespaceSlug: ensureNamespace } : skipToken
  );

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
      params: {
        page: fetchedPages + 1,
        per_page: namespacesFirstPage?.perPage,
        minimum_role: "editor",
      },
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
    const userNamespace = namespacesFirstPage.namespaces.find(
      (namespace) => namespace.namespace_kind === "user"
    );
    if (userNamespace != null && !value) {
      onChange(userNamespace);
    }
  }, [namespacesFirstPage, onChange, value]);

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
  }, [namespacesFirstPage, requestId]);

  useEffect(() => {
    if (
      allNamespaces == null ||
      namespacesPageResult.currentData == null ||
      currentRequestId !== namespacesPageResult.requestId
    ) {
      return;
    }
    const hasMore =
      namespacesPageResult.currentData.totalPages >
      namespacesPageResult.currentData.page;
    const namespacesAvailable = [
      ...allNamespaces,
      ...namespacesPageResult.currentData.namespaces,
    ];
    setState({
      data: namespacesAvailable,
      fetchedPages: namespacesPageResult.currentData.page ?? 0,
      hasMore,
      currentRequestId: "",
    });
  }, [
    allNamespaces,
    namespacesPageResult.currentData,
    namespacesPageResult.requestId,
    currentRequestId,
  ]);

  useEffect(() => {
    if (specificNamespace == null || allNamespaces == null) {
      return;
    }
    const hasNamespace = allNamespaces.find(
      ({ slug }) => slug === specificNamespace.slug
    );
    if (hasNamespace) {
      return;
    }
    setState((prevState) => {
      const namespaces = [specificNamespace, ...(prevState.data ?? [])];
      return { ...prevState, data: namespaces };
    });
  }, [allNamespaces, specificNamespace, specificNamespaceRequestId]);

  if (isFetching) {
    return (
      <div className={cx(className, "form-control")} id={id}>
        <Loader className="me-1" inline size={16} />
        Loading namespaces...
      </div>
    );
  }

  if (!allNamespaces || isError || specificNamespaceIsError) {
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
        inputId={inputId}
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
