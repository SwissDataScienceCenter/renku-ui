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
import { useCallback, useMemo, useState } from "react";
import { Archive, CupHot, Tags } from "react-bootstrap-icons";
import { Link } from "react-router";
import { Card, CardBody, CardHeader, Collapse } from "reactstrap";

import { InfoAlert } from "~/components/Alert";
import { Clipboard } from "~/components/clipboard/Clipboard";
import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import ChevronFlippedIcon from "~/components/icons/ChevronFlippedIcon";
import { Loader } from "~/components/Loader";
import LazyMarkdown from "~/components/markdown/LazyMarkdown";
// import {
//   useGetStorageConfigQuery,
//   type ProjectStorageAllow,
// } from "~/features/cloudStorage/api/projectCloudStorage.generated-api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import StorageQuotaResources from "../ProjectPageV2/ProjectPageContent/ProjectStorage/StorageQuotaResources";
import {
  computeResourcesApi,
  useGetResourcePoolsQuery,
  useGetStorageFlavorsQuery,
  useGetStorageQuotasQuery,
  type ResourcePoolWithId,
  type StorageFlavor,
  type StorageQuota,
} from "../sessionsV2/api/computeResources.api";
import AddStorageFlavorButton from "./AddStorageFlavorButton";
import AddStorageQuotaButton from "./AddStorageQuotaButton";
import AdminListFilter from "./AdminListFilter";
import AdminSectionHeader from "./AdminSectionHeader";
import DeleteStorageFlavorButton from "./DeleteStorageFlavorButton";
import DeleteStorageQuotaButton from "./DeleteStorageQuotaButton";
import StorageFlavorValues from "./StorageFlavorValues";
import StorageQuotaValues from "./StorageQuotaValues";
import UpdateStorageFlavorButton from "./UpdateStorageFlavorButton";
import UpdateStorageQuotaButton from "./UpdateStorageQuotaButton";

export default function StorageSections() {
  return (
    <>
      <StorageQuotasSection />
      <StorageFlavorsSection />
    </>
  );
}

function StorageQuotasSection() {
  const { data, error, isLoading } = useGetStorageQuotasQuery();

  return (
    <section>
      <AdminSectionHeader
        action={<AddStorageQuotaButton />}
        count={!isLoading && !error ? data?.length : undefined}
        icon={Archive}
        title="Storage quotas"
      />

      <p>
        Storage quotas allow you to manage and allocate storage resources for
        different groups and users. Storage quotas are attached to a parent
        resource pool.
      </p>

      <StorageQuotasList />
    </section>
  );
}

function StorageQuotasList() {
  const {
    data: storageQuotas,
    isLoading: isLoadingStorageQuotas,
    error: storageQuotasError,
  } = computeResourcesApi.endpoints.getStorageQuotas.useQueryState();
  const {
    data: resourcePools,
    isLoading: isLoadingResourcePools,
    error: resourcePoolsError,
  } = useGetResourcePoolsQuery({});

  const isLoading = isLoadingStorageQuotas || isLoadingResourcePools;
  const error = storageQuotasError ?? resourcePoolsError;

  const sortedStorageQuotas = useMemo(
    () =>
      storageQuotas
        ? [...storageQuotas].sort(
            (sqA, sqB) => sqA.resource_pool_id - sqB.resource_pool_id,
          )
        : undefined,
    [storageQuotas],
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <RtkOrDataServicesError dismissible={false} error={error} />;
  }

  if (!resourcePools || resourcePools.length == 0) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        No resource pool has been defined yet. Please check the{" "}
        <Link to={ABSOLUTE_ROUTES.v2.admin.computeResources}>
          compute section
        </Link>
        .
      </InfoAlert>
    );
  }

  if (!sortedStorageQuotas || sortedStorageQuotas.length == 0) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        No storage quota has been defined yet.
      </InfoAlert>
    );
  }

  return (
    <div className={cx("d-flex", "flex-column", "gap-2", "mb-3")}>
      {sortedStorageQuotas.map((storageQuota) => (
        <StorageQuotaItem
          key={storageQuota.id}
          storageQuota={storageQuota}
          resourcePools={resourcePools}
        />
      ))}
    </div>
  );
}

interface StorageQuotaItemProps {
  storageQuota: StorageQuota;
  resourcePools: ResourcePoolWithId[];
}

function StorageQuotaItem({
  storageQuota,
  resourcePools,
}: StorageQuotaItemProps) {
  const { resource_pool_id } = storageQuota;

  const resourcePool = useMemo(
    () => resourcePools.find(({ id }) => id === resource_pool_id),
    [resourcePools, resource_pool_id],
  );

  const name = useMemo(
    () =>
      resourcePool
        ? `${resourcePool.name} · ${storageQuota.storage_flavor_display_name}`
        : storageQuota.id,
    [resourcePool, storageQuota.id, storageQuota.storage_flavor_display_name],
  );

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <Card>
      <CardHeader
        className={cx("bg-white", "border-0", "rounded", "fs-6", "p-0")}
        tag="h4"
      >
        <button
          className={cx(
            "d-flex",
            "gap-3",
            "align-items-center",
            "w-100",
            "p-3",
            "bg-transparent",
            "border-0",
            "fw-bold",
          )}
          onClick={toggle}
          type="button"
        >
          {name}
          <div
            className={cx("align-items-center", "d-flex", "gap-3", "ms-auto")}
          >
            <StorageQuotaValues
              className={cx(
                "d-none",
                "d-lg-inline-flex",
                "fw-normal",
                "small",
                "text-muted",
              )}
              compact
              storageQuota={storageQuota}
            />
            <ChevronFlippedIcon flipped={isOpen} />
          </div>
        </button>
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody className="pt-0">
          <div
            className={cx(
              "align-items-center",
              "border-bottom",
              "border-top",
              "d-flex",
              "gap-1",
              "py-2",
            )}
          >
            Internal ID: {storageQuota.id}
            <Clipboard
              className={cx("border-0", "btn", "ms-1", "p-0", "shadow-none")}
              clipboardText={storageQuota.id}
            />
          </div>

          <div className={cx("border-bottom", "py-2")}>
            {resourcePool ? (
              <>Resource pool: {resourcePool?.name}</>
            ) : (
              <>
                Error: could not load resource pool with ID{" "}
                {storageQuota.resource_pool_id}
              </>
            )}
          </div>

          <div className={cx("border-bottom", "py-2")}>
            Storage flavor: {storageQuota.storage_flavor_display_name}
          </div>

          <div className={cx("border-bottom", "py-2")}>
            <StorageQuotaValues storageQuota={storageQuota} />
            <StorageQuotaResources detailed storageQuota={storageQuota} />
          </div>
        </CardBody>
        <CardBody
          className={cx(
            "d-flex",
            "flex-row",
            "gap-2",
            "justify-content-end",
            "pt-0",
          )}
        >
          <UpdateStorageQuotaButton
            storageQuota={storageQuota}
            resourcePool={resourcePool}
          />
          <DeleteStorageQuotaButton storageQuota={storageQuota} />
        </CardBody>
      </Collapse>
    </Card>
  );
}

function StorageFlavorsSection() {
  const { data, error, isLoading } = useGetStorageFlavorsQuery();

  return (
    <section>
      <AdminSectionHeader
        action={<AddStorageFlavorButton />}
        count={!isLoading && !error ? data?.length : undefined}
        headerTag="h3"
        icon={CupHot}
        title="Storage flavors"
      />

      <p>Storage flavors are re-usable shapes used by storage quotas.</p>

      <StorageFlavorsList />
    </section>
  );
}

function StorageFlavorsList() {
  const {
    data: storageFlavors,
    error,
    isLoading,
  } = computeResourcesApi.endpoints.getStorageFlavors.useQueryState();

  const [filter, setFilter] = useState("");

  const filteredFlavors = useMemo(() => {
    if (!storageFlavors || !filter) {
      return storageFlavors;
    }
    const lowerCaseFilter = filter.toLowerCase();
    return storageFlavors.filter(({ display_name }) =>
      display_name.toLowerCase().includes(lowerCaseFilter),
    );
  }, [filter, storageFlavors]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <RtkOrDataServicesError dismissible={false} error={error} />;
  }

  if (!storageFlavors || !filteredFlavors || storageFlavors.length == 0) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        No storage flavor has been defined yet.
      </InfoAlert>
    );
  }

  return (
    <>
      <AdminListFilter filter={filter} onFilterChange={setFilter} />

      {filteredFlavors.length === 0 ? (
        <p className="fst-italic">
          No resource flavor matches the filter <code>{filter}</code>.
        </p>
      ) : (
        <div className={cx("d-flex", "flex-column", "gap-2", "mb-3")}>
          {filteredFlavors.map((storageFlavor) => (
            <StorageFlavorItem
              key={storageFlavor.id}
              storageFlavor={storageFlavor}
            />
          ))}
        </div>
      )}
    </>
  );
}

interface StorageFlavorItemProps {
  storageFlavor: StorageFlavor;
}

function StorageFlavorItem({ storageFlavor }: StorageFlavorItemProps) {
  const {
    display_name,
    k8s_storage_class_name,
    admin_documentation,
    documentation,
  } = storageFlavor;

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  return (
    <Card>
      <CardHeader
        className={cx("bg-white", "border-0", "rounded", "fs-6", "p-0")}
        tag="h4"
      >
        <button
          className={cx(
            "d-flex",
            "gap-3",
            "align-items-center",
            "w-100",
            "p-3",
            "bg-transparent",
            "border-0",
            "fw-bold",
          )}
          onClick={toggle}
          type="button"
        >
          <Tags className={cx("bi", "flex-shrink-0")} />
          {display_name}
          <div
            className={cx("align-items-center", "d-flex", "gap-3", "ms-auto")}
          >
            <StorageFlavorValues
              className={cx(
                "d-none",
                "d-lg-inline-flex",
                "fw-normal",
                "small",
                "text-muted",
              )}
              compact
              storageFlavor={storageFlavor}
            />
            <ChevronFlippedIcon flipped={isOpen} />
          </div>
        </button>
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody className="pt-0">
          <div
            className={cx(
              "align-items-center",
              "border-bottom",
              "border-top",
              "d-flex",
              "gap-1",
              "py-2",
            )}
          >
            Internal ID: {storageFlavor.id}
            <Clipboard
              className={cx("border-0", "btn", "ms-1", "p-0", "shadow-none")}
              clipboardText={storageFlavor.id}
            />
          </div>

          <div className={cx("border-bottom", "py-2")}>
            Kubernetes storage class name: <code>{k8s_storage_class_name}</code>
          </div>

          <div className={cx("border-bottom", "py-2")}>
            {documentation ? (
              <>
                <h4>User documentation</h4>
                <LazyMarkdown fallback={<>Loading documentation...</>}>
                  {documentation}
                </LazyMarkdown>
              </>
            ) : (
              <p className={cx("mb-0", "text-muted")}>No user documentation</p>
            )}
          </div>

          <div className={cx("border-bottom", "py-2")}>
            {admin_documentation ? (
              <>
                <h4>Admin documentation</h4>
                <LazyMarkdown fallback={<>Loading admin documentation...</>}>
                  {admin_documentation}
                </LazyMarkdown>
              </>
            ) : (
              <p className={cx("mb-0", "text-muted")}>No admin documentation</p>
            )}
          </div>

          <div className={cx("border-bottom", "py-2")}>
            <StorageFlavorValues storageFlavor={storageFlavor} />
          </div>
        </CardBody>
        <CardBody
          className={cx(
            "d-flex",
            "flex-row",
            "gap-2",
            "justify-content-end",
            "pt-0",
          )}
        >
          <UpdateStorageFlavorButton storageFlavor={storageFlavor} />
          <DeleteStorageFlavorButton storageFlavor={storageFlavor} />
        </CardBody>
      </Collapse>
    </Card>
  );
}
