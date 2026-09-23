/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { useCallback, useState } from "react";
import { NodeMinus, XLg } from "react-bootstrap-icons";
import { Button } from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import {
  useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdResourceFlavourMutation,
  useGetResourceFlavoursByResourceFlavourIdResourceClassesQuery,
  type LinkedResourceClass,
} from "../sessionsV2/api/computeResources.api";

export function useLinkedResourceClasses(
  resourceFlavourId: string,
  skip?: boolean,
) {
  return useGetResourceFlavoursByResourceFlavourIdResourceClassesQuery(
    { resourceFlavourId },
    { skip },
  );
}

interface LinkedResourceClassesProps {
  classes: LinkedResourceClass[];
}

export default function LinkedResourceClasses({
  classes,
}: LinkedResourceClassesProps) {
  const [unlinkResourceFlavour, result] =
    useDeleteResourcePoolsByResourcePoolIdClassesAndClassIdResourceFlavourMutation();

  const onUnlink = useCallback(
    (resourceClass: LinkedResourceClass) => {
      if (resourceClass.resource_pool_id == null) {
        return;
      }
      unlinkResourceFlavour({
        resourcePoolId: resourceClass.resource_pool_id,
        classId: `${resourceClass.id}`,
      });
    },
    [unlinkResourceFlavour],
  );

  const pendingClassId = result.isLoading
    ? result.originalArgs?.classId
    : undefined;

  return (
    <>
      {result.error && <RtkOrDataServicesError error={result.error} />}
      <ul className="mb-0">
        {classes.map((resourceClass) => (
          <LinkedResourceClassItem
            key={resourceClass.id}
            onUnlink={onUnlink}
            pendingClassId={pendingClassId}
            resourceClass={resourceClass}
          />
        ))}
      </ul>
      <div className="form-text">
        Unlinking copies the flavour&apos;s current values onto the resource
        class and leaves them there.
      </div>
    </>
  );
}

interface LinkedResourceClassItemProps {
  onUnlink: (resourceClass: LinkedResourceClass) => void;
  pendingClassId: string | undefined;
  resourceClass: LinkedResourceClass;
}

function LinkedResourceClassItem({
  onUnlink,
  pendingClassId,
  resourceClass,
}: LinkedResourceClassItemProps) {
  const { id, name, resource_pool_id, resource_pool_name } = resourceClass;

  const [isConfirming, setIsConfirming] = useState(false);
  const onConfirm = useCallback(() => {
    setIsConfirming(true);
  }, []);
  const onCancel = useCallback(() => {
    setIsConfirming(false);
  }, []);
  const onClick = useCallback(() => {
    onUnlink(resourceClass);
  }, [onUnlink, resourceClass]);

  const isPending = pendingClassId === `${id}`;

  return (
    <li
      className={cx(
        "align-items-center",
        "d-flex",
        "flex-wrap",
        "gap-2",
        "my-1",
      )}
    >
      <span>
        <strong>{name}</strong>
        {resource_pool_name && <> {`(in ${resource_pool_name})`}</>}
      </span>
      {resource_pool_id == null ? null : isConfirming ? (
        <>
          <Button
            color="danger"
            disabled={isPending}
            onClick={onClick}
            size="sm"
          >
            {isPending ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <NodeMinus className={cx("bi", "me-1")} />
            )}
            Confirm unlink
          </Button>
          <Button
            color="outline-primary"
            disabled={isPending}
            onClick={onCancel}
            size="sm"
          >
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
        </>
      ) : (
        <Button
          color="outline-danger"
          disabled={isPending}
          onClick={onConfirm}
          size="sm"
        >
          <NodeMinus className={cx("bi", "me-1")} />
          Unlink
        </Button>
      )}
    </li>
  );
}

interface LinkedResourceClassesSummaryProps {
  emptyMessage: string;
  intro: string;
  resourceFlavourId: string;
  skip?: boolean;
}

export function LinkedResourceClassesSummary({
  emptyMessage,
  intro,
  resourceFlavourId,
  skip,
}: LinkedResourceClassesSummaryProps) {
  const { data: classes, isLoading } = useLinkedResourceClasses(
    resourceFlavourId,
    skip,
  );

  if (isLoading) {
    return <Loader className="me-1" inline size={16} />;
  }

  if (!classes || classes.length === 0) {
    return <p className={cx("mb-0", "text-muted")}>{emptyMessage}</p>;
  }

  return (
    <>
      <p className="mb-1">{intro}</p>
      <LinkedResourceClasses classes={classes} />
    </>
  );
}
