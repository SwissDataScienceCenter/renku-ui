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

import { faCogs, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Select, {
  ClassNamesConfig,
  GroupBase,
  MenuListProps,
  SelectComponentsConfig,
  SingleValue,
  components,
} from "react-select";
import {
  Button,
  FormGroup,
  FormText,
  Input,
  Label,
  PopoverBody,
  PopoverHeader,
  UncontrolledTooltip,
} from "reactstrap";

import { ErrorAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { UncontrolledPopover } from "../../../../utils/ts-wrappers";
import { GitLabRepositoryCommit } from "../../../project/GitLab.types";
import projectGitLabApi, {
  useGetRepositoryCommits2Query,
} from "../../../project/projectGitLab.api";
import useDefaultCommitOption from "../../hooks/options/useDefaultCommitOption.hook";
import { setCommit } from "../../startSessionOptionsSlice";

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
    refetch,
    requestId,
  } = useGetRepositoryCommits2Query(
    {
      branch: currentBranch,
      projectId: `${gitLabProjectId ?? 0}`,
      perPage: 100,
    },
    { skip: !gitLabProjectId || !currentBranch }
  );

  const [{ data: allCommits, fetchedPages, hasMore }, setState] = useState<
    PaginatedState<GitLabRepositoryCommit>
  >({ data: undefined, fetchedPages: 0, hasMore: true });

  const [fetchCommitsPage, commitsPageResult] =
    projectGitLabApi.useLazyGetRepositoryCommits2Query();
  const onFetchMore = useCallback(() => {
    fetchCommitsPage({
      branch: currentBranch,
      projectId: `${gitLabProjectId ?? 0}`,
      page: fetchedPages + 1,
      perPage: commitsFirstPage?.pagination.perPage,
    });
  }, [
    commitsFirstPage?.pagination.perPage,
    currentBranch,
    fetchCommitsPage,
    fetchedPages,
    gitLabProjectId,
  ]);

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
      fetchedPages: commitsFirstPage.pagination.page,
      hasMore: commitsFirstPage.pagination.hasMore,
    });
  }, [commitsFirstPage, requestId]);

  useEffect(() => {
    if (
      allCommits == null ||
      commitsPageResult.data == null ||
      commitsPageResult.data.pagination.page <= fetchedPages
    ) {
      return;
    }
    setState({
      data: [...allCommits, ...commitsPageResult.data.data],
      fetchedPages: commitsPageResult.data.pagination.page,
      hasMore: commitsPageResult.data.pagination.hasMore,
    });
  }, [allCommits, commitsPageResult.data, fetchedPages]);

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
        onChange={onChange}
        onFetchMore={onFetchMore}
      />
    </div>
  );
}

interface PaginatedState<T = unknown> {
  data: T[] | undefined;
  fetchedPages: number;
  hasMore: boolean;
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

interface CommitOptionsButtonProps {
  limit: number;
  onChangeLimit: (newLimit: number) => void;
}

function CommitOptionsButton({
  limit,
  onChangeLimit,
}: CommitOptionsButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChangeLimit(event.target.valueAsNumber);
    },
    [onChangeLimit]
  );

  return (
    <>
      <Button
        className={cx("ms-2", "p-0")}
        color="link"
        innerRef={ref}
        onClick={(event) => {
          event.preventDefault();
        }}
        size="sm"
      >
        <FontAwesomeIcon icon={faCogs} />
      </Button>
      <UncontrolledTooltip placement="top" target={ref}>
        Commit options
      </UncontrolledTooltip>
      <UncontrolledPopover placement="top" trigger="legacy" target={ref}>
        <PopoverHeader>Commit options</PopoverHeader>
        <PopoverBody>
          <FormGroup>
            <Label for="session-commit-option-limit">
              Number of commits to display
            </Label>
            <Input
              id="session-commit-option-limit"
              min={0}
              max={100}
              onChange={onChange}
              step={1}
              type="number"
              value={limit}
            />
            <FormText>1-100, 0 for unlimited</FormText>
          </FormGroup>
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}

interface CommitSelectorProps {
  commits: GitLabRepositoryCommit[];
  currentCommit?: string;
  hasMore?: boolean;
  onChange?: (newValue: SingleValue<GitLabRepositoryCommit>) => void;
  onFetchMore?: () => void;
}

function CommitSelector({
  currentCommit,
  commits,
  hasMore,
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
      MenuList: CustomMenuList({ hasMore, onFetchMore }),
    }),
    [hasMore, onFetchMore]
  );

  console.log(commits.length);

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
      // menuIsOpen
      // options={options}
      // value={currentSessionClass}
      // defaultValue={defaultSessionClass}
      // getOptionValue={(option) => `${option.id}`}
      // getOptionLabel={(option) => option.name}
      // onChange={onChange}
      // isDisabled={disabled}
      isClearable={false}
      isSearchable={false}
      // unstyled
      // classNames={selectClassNames}
      // components={selectComponents}
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
  // groupHeading: () => cx("pt-1", "px-3", "text-uppercase", styles.groupHeading),
  menu: () =>
    cx("rounded-bottom", "border", "border-top-0", "px-0", "py-2", styles.menu),
  menuList: () =>
    cx(
      "d-grid"
      //  "gap-2"
    ),
  option: ({ isFocused, isSelected }) =>
    cx(
      "d-grid",
      "gap-1",
      "px-3",
      "py-1",
      styles.option,
      isFocused && styles.optionIsFocused,
      !isFocused && isSelected && styles.optionIsSelected
    ),
  placeholder: () => cx("px-3"),
  singleValue: () =>
    cx(
      "d-grid",
      "gap-1",
      "px-3"
      // styles.singleValue
    ),
};

const selectComponents: SelectComponentsConfig<
  GitLabRepositoryCommit,
  false,
  GroupBase<GitLabRepositoryCommit>
> = {};

interface CustomMenuListProps {
  hasMore?: boolean;
  onFetchMore?: () => void;
}

function CustomMenuList({ hasMore, onFetchMore }: CustomMenuListProps) {
  return function CustomMenuListInner(
    props: MenuListProps<GitLabRepositoryCommit, false>
  ) {
    return (
      <components.MenuList {...props}>
        {props.children}
        {hasMore && (
          <Button
            className={cx("ms-2", "p-0")}
            color="link"
            onClick={onFetchMore}
            size="sm"
          >
            Fetch more
          </Button>
        )}
      </components.MenuList>
    );
  };
}
