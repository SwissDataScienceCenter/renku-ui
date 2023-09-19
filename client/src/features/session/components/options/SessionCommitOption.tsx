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

import { ChangeEvent, useCallback, useRef, useState } from "react";
import { faCogs, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { clamp } from "lodash";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
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
import CommitSelector from "../../../../components/commitSelector/CommitSelector";
import { UncontrolledPopover } from "../../../../utils/ts-wrappers";
import { useGetRepositoryCommitsQuery } from "../../../project/projectGitLab.api";
import useDefaultCommitOption from "../../hooks/options/useDefaultCommitOption.hook";
import {
  setCommit,
  useStartSessionOptionsSelector,
} from "../../startSessionOptionsSlice";

export default function SessionCommitOption() {
  const defaultBranch = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.defaultBranch
  );
  const gitLabProjectId = useSelector<RootStateOrAny, number | null>(
    (state) => state.stateModel.project.metadata.id ?? null
  );

  const currentBranch = useStartSessionOptionsSelector(({ branch }) => branch);

  const {
    data: commits,
    isError,
    isFetching,
    refetch,
  } = useGetRepositoryCommitsQuery(
    {
      branch: currentBranch,
      projectId: `${gitLabProjectId ?? 0}`,
    },
    { skip: !gitLabProjectId || !currentBranch }
  );

  const dispatch = useDispatch();
  const onChange = useCallback(
    (commitSha: string) => {
      if (commitSha) {
        dispatch(setCommit(commitSha));
      }
    },
    [dispatch]
  );

  useDefaultCommitOption({ commits });

  // Commit limit
  const [limit, setLimit] = useState<number>(25);
  const onChangeLimit = useCallback((limit: number) => {
    const newLimit = clamp(limit, 0, 100);
    setLimit(newLimit);
  }, []);
  const filteredCommits = limit > 0 ? commits?.slice(0, limit) : commits;

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

  if (!filteredCommits || isError) {
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
        <CommitOptionsButton limit={limit} onChangeLimit={onChangeLimit} />
      </div>
      {filteredCommits.length > 0 && (
        <CommitSelector
          commits={filteredCommits}
          disabled={false}
          key={`branch-${currentBranch || defaultBranch}`}
          onChange={onChange}
        />
      )}
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
