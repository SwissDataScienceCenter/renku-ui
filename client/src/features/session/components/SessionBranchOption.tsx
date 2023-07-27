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

import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { faCogs, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Button,
  FormGroup,
  Input,
  Label,
  PopoverBody,
  PopoverHeader,
  UncontrolledTooltip,
} from "reactstrap";
import { ErrorAlert, InfoAlert } from "../../../components/Alert";
import { ExternalLink } from "../../../components/ExternalLinks";
import { Loader } from "../../../components/Loader";
import { Url } from "../../../utils/helpers/url";
import { UncontrolledPopover } from "../../../utils/ts-wrappers";
import { useGetAllRepositoryBranchesQuery } from "../../repository/repository.api";
import {
  setBranch,
  useStartSessionOptionsSelector,
} from "../startSessionOptionsSlice";

export default function SessionBranchOption() {
  const defaultBranch = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );
  const externalUrl = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.externalUrl
  );

  const {
    data: branches,
    isError,
    isFetching,
    refetch,
  } = useGetAllRepositoryBranchesQuery(
    {
      projectId: `${gitLabProjectId ?? 0}`,
    },
    { skip: !gitLabProjectId }
  );

  const currentBranch = useStartSessionOptionsSelector((state) => state.branch);

  const dispatch = useDispatch();
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const branchName = event.target.value;
      const branch = branches?.find((branch) => branch.name === branchName);
      if (branch != null) {
        dispatch(setBranch(branch.name));
      }
    },
    [branches, dispatch]
  );

  // Select the default branch
  useEffect(() => {
    if (branches == null || branches.length == 0) {
      return;
    }
    const matchedDefaultBranch = branches.find(
      (branch) => branch.name === defaultBranch
    );
    const branch = matchedDefaultBranch ?? branches[0];
    dispatch(setBranch(branch.name));
  }, [branches, defaultBranch, dispatch]);

  // Branch filter
  const [includeMergedBranches, setIncludeMergedBranches] =
    useState<boolean>(false);
  const toggleIncludeMergedBranches = useCallback(() => {
    setIncludeMergedBranches((value) => {
      return !value;
    });
  }, []);
  const filteredBranches = includeMergedBranches
    ? branches
    : branches?.filter(
        (branch) => !branch.merged || branch.name === currentBranch
      );

  if (isFetching) {
    return (
      <div className="field-group">
        <div className="form-label">
          Loading branches... <Loader inline size={16} />
        </div>
      </div>
    );
  }

  if (!branches || !filteredBranches || isError) {
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

  if (branches.length == 0) {
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

  if (branches.length == 1) {
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
      <Input
        id="session-branch-option"
        onChange={onChange}
        type="select"
        value={currentBranch}
      >
        {filteredBranches.map(({ name }) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Input>
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
