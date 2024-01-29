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

import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ThreeDots } from "react-bootstrap-icons";
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
import { Button, UncontrolledTooltip } from "reactstrap";

import { ErrorAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { TimeCaption } from "../../../../components/TimeCaption";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { GitLabRepositoryCommit } from "../../../project/GitLab.types";
import projectGitLabApi, {
  useGetRepositoryCommitsQuery,
  useRefetchCommitsMutation,
} from "../../../project/projectGitLab.api";
import useDefaultCommitOption from "../../hooks/options/useDefaultCommitOption.hook";
import { setCommit } from "../../startSessionOptionsSlice";
import { PaginatedState } from "./fetchMore.types";

import styles from "./SessionCommitOption.module.scss";

export default function SessionCommitOption() {
  const gitLabProjectId = useLegacySelector<number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );

  const { branch: currentBranch, commit: currentCommit } = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions
  );

  const {
    data: commitsFirstPage,
    isError,
    isFetching,
    requestId,
  } = useGetRepositoryCommitsQuery(
    gitLabProjectId && currentBranch
      ? {
          branch: currentBranch,
          projectId: `${gitLabProjectId}`,
        }
      : skipToken
  );

  const [
    { data: allCommits, fetchedPages, hasMore, currentRequestId },
    setState,
  ] = useState<PaginatedState<GitLabRepositoryCommit>>({
    data: undefined,
    fetchedPages: 0,
    hasMore: true,
    currentRequestId: "",
  });

  const [fetchCommitsPage, commitsPageResult] =
    projectGitLabApi.useLazyGetRepositoryCommitsQuery();
  const onFetchMore = useCallback(() => {
    if (!gitLabProjectId) {
      return;
    }
    const request = fetchCommitsPage({
      branch: currentBranch,
      projectId: `${gitLabProjectId}`,
      page: fetchedPages + 1,
      perPage: commitsFirstPage?.pagination.perPage,
    });
    setState((prevState) => ({
      ...prevState,
      currentRequestId: request.requestId,
    }));
  }, [
    commitsFirstPage?.pagination.perPage,
    currentBranch,
    fetchCommitsPage,
    fetchedPages,
    gitLabProjectId,
  ]);

  // Handle forced refresh
  const [refetch] = useRefetchCommitsMutation();

  const dispatch = useAppDispatch();
  const onChange = useCallback(
    (newValue: SingleValue<GitLabRepositoryCommit>) => {
      if (newValue?.id) {
        dispatch(setCommit(newValue.id));
      }
    },
    [dispatch]
  );

  useDefaultCommitOption({ commits: commitsFirstPage?.data });

  useEffect(() => {
    if (commitsFirstPage == null) {
      return;
    }
    setState({
      data: commitsFirstPage.data,
      fetchedPages: commitsFirstPage.pagination.currentPage ?? 0,
      hasMore: !!commitsFirstPage.pagination.nextPage,
      currentRequestId: "",
    });
  }, [commitsFirstPage, requestId]);

  useEffect(() => {
    if (
      allCommits == null ||
      commitsPageResult.currentData == null ||
      currentRequestId !== commitsPageResult.requestId
    ) {
      return;
    }
    setState({
      data: [...allCommits, ...commitsPageResult.currentData.data],
      fetchedPages: commitsPageResult.currentData.pagination.currentPage ?? 0,
      hasMore: !!commitsPageResult.currentData.pagination.nextPage,
      currentRequestId: "",
    });
  }, [
    allCommits,
    commitsPageResult.currentData,
    commitsPageResult.requestId,
    currentRequestId,
  ]);

  if (isFetching || !gitLabProjectId || !currentBranch) {
    return (
      <div className="field-group">
        <div className="form-label">
          <Loader className="me-1" inline size={16} />
          Loading commits...
        </div>
      </div>
    );
  }

  if (!allCommits || isError) {
    return (
      <div className="field-group">
        <div className="form-label">
          Commits <RefreshCommitsButton refresh={refetch} />
        </div>
        <ErrorAlert>
          <p className="mb-0">Error: could not fetch project commits.</p>
        </ErrorAlert>
      </div>
    );
  }

  return (
    <div className="field-group">
      <div className="form-label">
        Commits
        <RefreshCommitsButton refresh={refetch} />
      </div>
      <CommitSelector
        commits={allCommits}
        currentCommit={currentCommit}
        hasMore={hasMore}
        isFetchingMore={commitsPageResult.isFetching}
        onChange={onChange}
        onFetchMore={onFetchMore}
      />
    </div>
  );
}

interface RefreshCommitsButtonProps {
  refresh: () => void;
}

function RefreshCommitsButton({ refresh }: RefreshCommitsButtonProps) {
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
        Refresh commits
      </UncontrolledTooltip>
    </>
  );
}

interface CommitSelectorProps {
  commits: GitLabRepositoryCommit[];
  currentCommit?: string;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onChange?: (newValue: SingleValue<GitLabRepositoryCommit>) => void;
  onFetchMore?: () => void;
}

function CommitSelector({
  currentCommit,
  commits,
  hasMore,
  isFetchingMore,
  onChange,
  onFetchMore,
}: CommitSelectorProps) {
  const currentValue = useMemo(
    () => commits.find(({ id }) => id === currentCommit),
    [commits, currentCommit]
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
      options={commits}
      value={currentValue}
      unstyled
      getOptionValue={(option) => option.id}
      getOptionLabel={(option) => option.short_id}
      onChange={onChange}
      classNames={selectClassNames}
      components={components}
      isClearable={false}
      isSearchable={false}
      isLoading={isFetchingMore}
    />
  );
}

const selectClassNames: ClassNamesConfig<GitLabRepositoryCommit, false> = {
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

const selectComponents: SelectComponentsConfig<
  GitLabRepositoryCommit,
  false,
  GroupBase<GitLabRepositoryCommit>
> = {
  DropdownIndicator: (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown size="20" />
      </components.DropdownIndicator>
    );
  },
  Option: (
    props: OptionProps<
      GitLabRepositoryCommit,
      false,
      GroupBase<GitLabRepositoryCommit>
    >
  ) => {
    const { data: commit } = props;
    return (
      <components.Option {...props}>
        <OptionOrSingleValueContent commit={commit} />
      </components.Option>
    );
  },
  SingleValue: (
    props: SingleValueProps<
      GitLabRepositoryCommit,
      false,
      GroupBase<GitLabRepositoryCommit>
    >
  ) => {
    const { data: commit } = props;
    return (
      <components.SingleValue {...props}>
        <OptionOrSingleValueContent commit={commit} />
      </components.SingleValue>
    );
  },
};

interface CustomMenuListProps {
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onFetchMore?: () => void;
}

function CustomMenuList({
  hasMore,
  isFetchingMore,
  onFetchMore,
}: CustomMenuListProps) {
  return function CustomMenuListInner(
    props: MenuListProps<GitLabRepositoryCommit, false>
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

interface OptionOrSingleValueContentProps {
  commit: GitLabRepositoryCommit;
}

function OptionOrSingleValueContent({
  commit,
}: OptionOrSingleValueContentProps) {
  return (
    <>
      <span className={cx("fw-bold", styles.id)}>{commit.short_id}</span>
      <span className={cx("text-truncate", styles.author)}>
        {commit.author_name}
      </span>
      <span className={cx("text-truncate", styles.datetime)}>
        <TimeCaption datetime={commit.committed_date} prefix="authored" />
      </span>
      <span className={cx("text-truncate", styles.message)}>
        {commit.message}
      </span>
    </>
  );
}
