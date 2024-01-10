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
  useRef,
  useState,
  useMemo,
} from "react";
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
} from "../../../project/projectGitLab.api";
import useDefaultBranchOption from "../../hooks/options/useDefaultBranchOption.hook";
import { setBranch } from "../../startSessionOptionsSlice";

import styles from "./SessionBranchOption.module.scss";

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
    refetch: refetchDefaultBranchData,
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
    refetch: refetchBranchesFirstPage,
  } = useGetRepositoryBranchesQuery(
    {
      projectId: `${gitLabProjectId ?? 0}`,
      perPage: 2,
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
  const refetch = useCallback(() => {
    refetchDefaultBranchData();
    refetchBranchesFirstPage();
  }, [refetchBranchesFirstPage, refetchDefaultBranchData]);

  const [{ data: allBranches, fetchedPages, hasMore }, setState] = useState<
    PaginatedState<GitLabRepositoryBranch>
  >({ data: undefined, fetchedPages: 0, hasMore: true });

  const [fetchBranchesPage, branchesPageResult] =
    projectGitLabApi.useLazyGetRepositoryBranchesQuery();

  const currentBranch = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions.branch
  );

  const dispatch = useAppDispatch();
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const branchName = event.target.value;
      const branch = allBranches?.find((branch) => branch.name === branchName);
      if (branch != null) {
        dispatch(setBranch(branch.name));
      }
    },
    [allBranches, dispatch]
  );
  const onChange2 = useCallback(
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
      fetchedPages: branchesFirstPage.page,
      hasMore: branchesFirstPage.page < branchesFirstPage.totalPages,
    });
  }, [branchesFirstPage, initialBranchList]);

  useEffect(() => {
    if (
      allBranches == null ||
      branchesPageResult.data == null ||
      branchesPageResult.data.page <= fetchedPages
    ) {
      return;
    }
    setState({
      data: [
        ...allBranches,
        ...branchesPageResult.data.data.filter(
          ({ default: isDefault }) => !isDefault
        ),
      ],
      fetchedPages: branchesPageResult.data.page,
      hasMore:
        branchesPageResult.data.page < branchesPageResult.data.totalPages,
    });
  }, [allBranches, branchesPageResult.data, fetchedPages]);

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
        currentBranch={currentBranch}
        branches={filteredBranches}
        onChange={onChange2}
      />

      <Input
        id="session-branch-option"
        onChange={onChange}
        type="select"
        value={currentBranch}
        className={cx(styles.formSelect)}
      >
        {filteredBranches.map(({ name }) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Input>

      <div>
        {hasMore && (
          <button
            type="button"
            role="button"
            onClick={() =>
              fetchBranchesPage({
                projectId: `${gitLabProjectId}`,
                page: fetchedPages + 1,
                perPage: branchesFirstPage?.perPage,
              })
            }
          >
            Fetch more
          </button>
        )}
      </div>
    </div>
  );

  // const [{ data: allBranches, fetchedPages, hasMore }, setState] = useState<
  //   PaginatedState<GitLabRepositoryBranch>
  // >({ data: [], fetchedPages: 0, hasMore: true });

  // const {
  //   data: branchesList,
  //   isError,
  //   isFetching,
  //   refetch,
  // } = useGetRepositoryBranchesQuery(
  //   {
  //     projectId: `${gitLabProjectId ?? 0}`,
  //     page: fetchedPages + 1,
  //     perPage: 2,
  //   },
  //   { skip: !gitLabProjectId || !hasMore }
  // );

  // // const branches = branchesList?.data;
  // const branches = allBranches;

  // useEffect(() => {
  //   console.log({ branchesList });
  // }, [branchesList]);

  // useEffect(() => {
  //   console.log({ allBranches });
  // }, [allBranches]);

  // useEffect(() => {
  //   if (branchesList == null) {
  //     return;
  //   }
  //   if (branchesList.page > fetchedPages) {
  //     setState(({ data }) => ({
  //       data: [...data, ...branchesList.data],
  //       fetchedPages: branchesList.page,
  //       hasMore: branchesList.page !== branchesList.totalPages,
  //     }));
  //   }
  // }, [branchesList, fetchedPages]);

  // const currentBranch = useAppSelector(
  //   ({ startSessionOptions }) => startSessionOptions.branch
  // );

  // const dispatch = useAppDispatch();
  // const onChange = useCallback(
  //   (event: ChangeEvent<HTMLInputElement>) => {
  //     const branchName = event.target.value;
  //     const branch = branches?.find((branch) => branch.name === branchName);
  //     if (branch != null) {
  //       dispatch(setBranch(branch.name));
  //     }
  //   },
  //   [branches, dispatch]
  // );
  // // const onChange2 = useCallback(
  // //   (newValue: SingleValue<string>) => {
  // //     if (newValue) {
  // //       dispatch(setBranch(newValue));
  // //     }
  // //   },
  // //   [dispatch]
  // // );

  // // (inputValue: string, options: OptionsOrGroups<OptionType, Group>, additional?: Additional)
  // // const loadOptions = useCallback(
  // //   (
  // //     _search: string,
  // //     loadedOptions: OptionsOrGroups<string, GroupBase<string>>,
  // //     additional?: any
  // //   ) => {
  // //     console.log({ _search, loadedOptions, additional });
  // //     const result: Response<string, GroupBase<string>, any> = {
  // //       options: branchesList?.data.map((branch) => branch.name) ?? [],
  // //       hasMore:
  // //         branchesList == null || branchesList.page !== branchesList.totalPages,
  // //     };
  // //     if (branchesList != null && branchesList.page < branchesList.totalPages) {
  // //       setPage((page) => page + 1);
  // //     }
  // //     console.log({ result });
  // //     return result;
  // //   },
  // //   [branchesList]
  // // );

  // useDefaultBranchOption({ branches, defaultBranch });

  // // Branch filter
  // const [includeMergedBranches, setIncludeMergedBranches] =
  //   useState<boolean>(false);
  // const toggleIncludeMergedBranches = useCallback(() => {
  //   setIncludeMergedBranches((value) => {
  //     return !value;
  //   });
  // }, []);
  // const filteredBranches = includeMergedBranches
  //   ? branches
  //   : branches?.filter(
  //       (branch) => !branch.merged || branch.name === currentBranch
  //     );

  // if (isFetching) {
  //   return (
  //     <div className="field-group">
  //       <div className="form-label">
  //         <Loader className="me-1" inline size={16} />
  //         Loading branches...
  //       </div>
  //     </div>
  //   );
  // }

  // if (!branches || !filteredBranches || isError) {
  //   return (
  //     <div className="field-group">
  //       <div className="form-label">
  //         Branches <RefreshBranchesButton refresh={refetch} />
  //       </div>
  //       <ErrorAlert>
  //         <p className="mb-0">Error: could not fetch project branches.</p>
  //       </ErrorAlert>
  //     </div>
  //   );
  // }

  // if (branches.length == 0) {
  //   return (
  //     <div className="field-group">
  //       <div className="form-label">
  //         A commit is necessary to start a session.
  //         <RefreshBranchesButton refresh={refetch} />
  //       </div>
  //       <InfoAlert timeout={0}>
  //         <p>You can still do one of the following:</p>
  //         <ul className="mb-0">
  //           <li>
  //             <ExternalLink
  //               size="sm"
  //               title="Clone the repository"
  //               url={externalUrl}
  //             />{" "}
  //             locally and add a first commit.
  //           </li>
  //           <li className="pt-1">
  //             <Link
  //               className={cx("btn", "btn-primary", "btn-sm")}
  //               role="button"
  //               to={Url.get(Url.pages.project.new)}
  //             >
  //               Create a new project
  //             </Link>{" "}
  //             from a non-empty template.
  //           </li>
  //         </ul>
  //       </InfoAlert>
  //     </div>
  //   );
  // }

  // if (branches.length == 1) {
  //   return (
  //     <div className="field-group">
  //       <Label for="session-branch-option">
  //         Branch (only 1 available)
  //         <RefreshBranchesButton refresh={refetch} />
  //         <BranchOptionsButton
  //           includeMergedBranches={includeMergedBranches}
  //           toggleIncludeMergedBranches={toggleIncludeMergedBranches}
  //         />
  //       </Label>
  //       <Input
  //         disabled
  //         id="session-branch-option"
  //         type="text"
  //         value={currentBranch}
  //       />
  //     </div>
  //   );
  // }

  // return (
  //   <div className="field-group">
  //     <Label for="session-branch-option">
  //       Branches
  //       <RefreshBranchesButton refresh={refetch} />
  //       <BranchOptionsButton
  //         includeMergedBranches={includeMergedBranches}
  //         toggleIncludeMergedBranches={toggleIncludeMergedBranches}
  //       />
  //     </Label>
  //     <Input
  //       id="session-branch-option"
  //       onChange={onChange}
  //       type="select"
  //       value={currentBranch}
  //       className={cx(styles.formSelect)}
  //     >
  //       {filteredBranches.map(({ name }) => (
  //         <option key={name} value={name}>
  //           {name}
  //         </option>
  //       ))}
  //     </Input>

  //     <div>
  //       {/* <AsyncPaginate
  //         loadOptions={loadOptions}
  //         value={currentBranch}
  //         defaultValue={defaultBranch}
  //         onChange={onChange2}
  //         isClearable={false}
  //         isSearchable={false}
  //       /> */}
  //     </div>
  //   </div>
  // );
}

interface PaginatedState<T = unknown> {
  data: T[] | undefined;
  fetchedPages: number;
  hasMore: boolean;
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
  onChange?: (newValue: SingleValue<GitLabRepositoryBranch>) => void;
}

function BranchSelector({
  currentBranch,
  branches,
  onChange,
}: BranchSelectorProps) {
  const currentValue = useMemo(
    () => branches.find(({ name }) => name === currentBranch),
    [currentBranch]
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
      components={selectComponents}
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
  GitLabRepositoryBranch,
  false,
  GroupBase<GitLabRepositoryBranch>
> = {
  MenuList: (props: MenuListProps<GitLabRepositoryBranch, false>) => {
    return (
      <components.MenuList {...props}>
        {props.children}
        Fetch more
      </components.MenuList>
    );
  },
};
