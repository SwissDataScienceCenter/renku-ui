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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
  Input,
  Label,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
  UncontrolledTooltip,
} from "reactstrap";

import { ErrorAlert, InfoAlert } from "../../../../components/Alert";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { Url } from "../../../../utils/helpers/url";
import type { GitLabRepositoryBranch } from "../../../project/GitLab.types";
import projectGitLabApi, {
  useGetRepositoryBranchQuery,
  useGetRepositoryBranchesQuery,
  useRefetchBranchesMutation,
} from "../../../project/projectGitLab.api";
import useDefaultBranchOption from "../../hooks/options/useDefaultBranchOption.hook";
import { setBranch } from "../../startSessionOptionsSlice";

import styles from "./SessionBranchOption.module.scss";
import { PaginatedState } from "./fetchMore.types";
import { ChevronDown, ThreeDots } from "react-bootstrap-icons";

export default function SessionBranchOption() {
  const defaultBranch = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useLegacySelector<number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const externalUrl = useLegacySelector<string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );

  const {
    data: defaultBranchData,
    isError: defaultBranchDataIsError,
    isFetching: defaultBranchDataIsFetching,
    requestId: defaultBranchRequestId,
  } = useGetRepositoryBranchQuery(
    {
      projectId: `${gitLabProjectId ?? 0}`,
      branch: defaultBranch,
    },
    { skip: !gitLabProjectId }
  );
  const {
    data: branchesFirstPage,
    isError: branchesFirstPageIsError,
    isFetching: branchesFirstPageIsFetching,
    requestId: branchesFirstPageRequestId,
  } = useGetRepositoryBranchesQuery(
    {
      projectId: `${gitLabProjectId ?? 0}`,
    },
    { skip: !gitLabProjectId }
  );

  const initialBranchList = useMemo(() => {
    if (defaultBranchData == null || branchesFirstPage == null) {
      return undefined;
    }
    return [
      defaultBranchData,
      ...branchesFirstPage.data.filter(({ default: isDefault }) => !isDefault),
    ];
  }, [branchesFirstPage, defaultBranchData]);
  const isError = defaultBranchDataIsError || branchesFirstPageIsError;
  const isFetching = defaultBranchDataIsFetching || branchesFirstPageIsFetching;

  const [
    { data: allBranches, fetchedPages, hasMore, currentRequestId },
    setState,
  ] = useState<PaginatedState<GitLabRepositoryBranch>>({
    data: undefined,
    fetchedPages: 0,
    hasMore: true,
    currentRequestId: "",
  });

  const [fetchBranchesPage, branchesPageResult] =
    projectGitLabApi.useLazyGetRepositoryBranchesQuery();
  const onFetchMore = useCallback(() => {
    const request = fetchBranchesPage({
      projectId: `${gitLabProjectId ?? 0}`,
      page: fetchedPages + 1,
      perPage: branchesFirstPage?.pagination.perPage,
    });
    setState((prevState) => ({
      ...prevState,
      currentRequestId: request.requestId,
    }));
  }, [
    branchesFirstPage?.pagination.perPage,
    fetchBranchesPage,
    fetchedPages,
    gitLabProjectId,
  ]);

  const currentBranch = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions.branch
  );

  // Handle forced refresh
  const [refetch] = useRefetchBranchesMutation();

  const dispatch = useAppDispatch();
  const onChange = useCallback(
    (newValue: SingleValue<GitLabRepositoryBranch>) => {
      if (newValue?.name) {
        dispatch(setBranch(newValue.name));
      }
    },
    [dispatch]
  );

  // Branch filter
  const [includeMergedBranches, setIncludeMergedBranches] =
    useState<boolean>(false);
  const toggleIncludeMergedBranches = useCallback(() => {
    setIncludeMergedBranches((value) => {
      return !value;
    });
  }, []);
  const filteredBranches = useMemo(
    () =>
      includeMergedBranches
        ? allBranches
        : allBranches?.filter(
            (branch) => !branch.merged || branch.name === currentBranch
          ),
    [allBranches, currentBranch, includeMergedBranches]
  );

  useDefaultBranchOption({
    branches: initialBranchList,
    defaultBranch,
  });

  useEffect(() => {
    if (initialBranchList == null || branchesFirstPage == null) {
      return;
    }
    setState({
      data: initialBranchList,
      fetchedPages: branchesFirstPage.pagination.currentPage ?? 0,
      hasMore: !!branchesFirstPage.pagination.nextPage,
      currentRequestId: "",
    });
  }, [
    branchesFirstPage,
    initialBranchList,
    defaultBranchRequestId,
    branchesFirstPageRequestId,
  ]);

  useEffect(() => {
    if (
      allBranches == null ||
      branchesPageResult.currentData == null ||
      currentRequestId !== branchesPageResult.requestId
    ) {
      return;
    }
    setState({
      data: [
        ...allBranches,
        ...branchesPageResult.currentData.data.filter(
          ({ default: isDefault }) => !isDefault
        ),
      ],
      fetchedPages: branchesPageResult.currentData.pagination.currentPage ?? 0,
      hasMore: !!branchesPageResult.currentData.pagination.nextPage,
      currentRequestId: "",
    });
  }, [
    allBranches,
    branchesPageResult.currentData,
    branchesPageResult.requestId,
    currentRequestId,
  ]);

  if (isFetching) {
    return (
      <div className="field-group">
        <div className="form-label">
          <Loader className="me-1" inline size={16} />
          Loading branches...
        </div>
      </div>
    );
  }

  if (!initialBranchList || !filteredBranches || isError) {
    return (
      <div className="field-group">
        <div className="form-label">
          Branches <RefreshBranchesButton refresh={refetch} />
        </div>
        <ErrorAlert>
          <p className="mb-0">Error: could not fetch project branches.</p>
        </ErrorAlert>
      </div>
    );
  }

  if (initialBranchList.length == 0) {
    return (
      <div className="field-group">
        <div className="form-label">
          A commit is necessary to start a session.
          <RefreshBranchesButton refresh={refetch} />
        </div>
        <InfoAlert timeout={0}>
          <p>You can still do one of the following:</p>
          <ul className="mb-0">
            <li>
              <ExternalLink
                size="sm"
                title="Clone the repository"
                url={externalUrl}
              />{" "}
              locally and add a first commit.
            </li>
            <li className="pt-1">
              <Link
                className={cx("btn", "btn-primary", "btn-sm")}
                role="button"
                to={Url.get(Url.pages.project.new)}
              >
                Create a new project
              </Link>{" "}
              from a non-empty template.
            </li>
          </ul>
        </InfoAlert>
      </div>
    );
  }

  if (initialBranchList.length == 1) {
    return (
      <div className="field-group">
        <Label for="session-branch-option">
          Branch (only 1 available)
          <RefreshBranchesButton refresh={refetch} />
          <BranchOptionsButton
            includeMergedBranches={includeMergedBranches}
            toggleIncludeMergedBranches={toggleIncludeMergedBranches}
          />
        </Label>
        <Input
          disabled
          id="session-branch-option"
          type="text"
          value={currentBranch}
        />
      </div>
    );
  }

  return (
    <div className="field-group">
      <Label for="session-branch-option">
        Branches
        <RefreshBranchesButton refresh={refetch} />
        <BranchOptionsButton
          includeMergedBranches={includeMergedBranches}
          toggleIncludeMergedBranches={toggleIncludeMergedBranches}
        />
      </Label>
      <BranchSelector
        branches={filteredBranches}
        currentBranch={currentBranch}
        hasMore={hasMore}
        isFetchingMore={branchesPageResult.isFetching}
        onChange={onChange}
        onFetchMore={onFetchMore}
      />
    </div>
  );
}

interface RefreshBranchesButtonProps {
  refresh: () => void;
}

function RefreshBranchesButton({ refresh }: RefreshBranchesButtonProps) {
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
        Refresh branches
      </UncontrolledTooltip>
    </>
  );
}

interface BranchOptionsButtonProps {
  includeMergedBranches: boolean;
  toggleIncludeMergedBranches: () => void;
}

function BranchOptionsButton({
  includeMergedBranches,
  toggleIncludeMergedBranches,
}: BranchOptionsButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

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
        Branch options
      </UncontrolledTooltip>
      <UncontrolledPopover placement="top" trigger="legacy" target={ref}>
        <PopoverHeader>Branch options</PopoverHeader>
        <PopoverBody>
          <FormGroup check>
            <Label check>
              <Input
                checked={includeMergedBranches}
                onChange={toggleIncludeMergedBranches}
                type="checkbox"
              />
              Include merged branches
            </Label>
          </FormGroup>
        </PopoverBody>
      </UncontrolledPopover>
    </>
  );
}

interface BranchSelectorProps {
  branches: GitLabRepositoryBranch[];
  currentBranch?: string;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onChange?: (newValue: SingleValue<GitLabRepositoryBranch>) => void;
  onFetchMore?: () => void;
}

function BranchSelector({
  branches,
  currentBranch,
  hasMore,
  isFetchingMore,
  onChange,
  onFetchMore,
}: BranchSelectorProps) {
  const currentValue = useMemo(
    () => branches.find(({ name }) => name === currentBranch),
    [branches, currentBranch]
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
      options={branches}
      value={currentValue}
      unstyled
      getOptionValue={(option) => option.name}
      getOptionLabel={(option) => option.name}
      onChange={onChange}
      classNames={selectClassNames}
      components={components}
      isClearable={false}
      isSearchable={false}
      isLoading={isFetchingMore}
    />
  );
}

const selectClassNames: ClassNamesConfig<GitLabRepositoryBranch, false> = {
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
      "px-3",
      "py-1",
      styles.option,
      isFocused && styles.optionIsFocused,
      !isFocused && isSelected && styles.optionIsSelected
    ),
  placeholder: () => cx("px-3"),
  singleValue: () => cx("d-flex", "px-3"),
};

const selectComponents: SelectComponentsConfig<
  GitLabRepositoryBranch,
  false,
  GroupBase<GitLabRepositoryBranch>
> = {
  DropdownIndicator: (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown size="20" />
      </components.DropdownIndicator>
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
    props: MenuListProps<GitLabRepositoryBranch, false>
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
