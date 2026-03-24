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
 * limitations under the License
 */

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bullseye, // eslint-disable-line spellcheck/spell-checker
  Database,
  Globe,
  Link45deg,
  NodePlus,
  People,
  PlusLg,
  Search,
  XLg,
} from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  ButtonGroup,
  Col,
  Form,
  Input,
  InputGroup,
  Label,
  ListGroup,
  ListGroupItem,
  ModalBody,
  ModalFooter,
  Row,
} from "reactstrap";

import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import DataConnectorModal, {
  DataConnectorModalBodyAndFooter,
} from "~/features/dataConnectorsV2/components/DataConnectorModal";
import {
  SearchDataConnector,
  useGetSearchQueryQuery,
} from "~/features/searchV2/api/searchV2Api.api";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { NEW_DOCS_DATA_CONNECTORS_FROM_REPO } from "~/utils/constants/NewDocs";
import RtkOrDataServicesError from "../../../../components/errors/RtkOrDataServicesError";
import { ExternalLink } from "../../../../components/LegacyExternalLinks";
import { Loader } from "../../../../components/Loader";
import ModalHeader from "../../../../components/modal/ModalHeader";
import ScrollableModal from "../../../../components/modal/ScrollableModal";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import {
  dataConnectorsApi,
  usePostDataConnectorsByDataConnectorIdProjectLinksMutation,
  usePostDataConnectorsGlobalMutation,
} from "../../../dataConnectorsV2/api/data-connectors.enhanced-api";
import dataConnectorFormSlice from "../../../dataConnectorsV2/state/dataConnectors.slice";
import type { Project } from "../../../projectsV2/api/projectV2.api";
import { doiFromUrl } from "../../utils/dataConnectorUtils";

import styles from "~/features/dataConnectorsV2/components/DataConnectorModal/DataConnectorModal.module.scss";

interface ProjectConnectDataConnectorsModalProps
  extends Omit<
    Parameters<typeof DataConnectorModal>[0],
    "dataConnector" | "projectId"
  > {
  project: Project;
  switchMode?: () => void;
}

type ProjectConnectDataConnectorMode = "create" | "link" | "doi" | "search";

export default function ProjectConnectDataConnectorsModal({
  isOpen,
  namespace,
  project,
  toggle: originalToggle,
}: ProjectConnectDataConnectorsModalProps) {
  const [mode, setMode] = useState<ProjectConnectDataConnectorMode>("search");
  const dispatch = useAppDispatch();
  const toggle = useCallback(() => {
    dispatch(dataConnectorFormSlice.actions.resetTransientState());
    originalToggle();
  }, [dispatch, originalToggle]);
  const switchMode = useCallback(() => {
    if (mode === "create") setMode("search");
    else setMode("create");
  }, [mode]);

  return (
    <ScrollableModal
      backdrop="static"
      centered
      className={styles.modal}
      data-cy="project-data-connector-connect-modal"
      fullscreen="lg"
      id="connect-project-data-connector"
      isOpen={isOpen}
      size="lg"
      unmountOnClose={false}
      toggle={toggle}
    >
      <ModalHeader
        modalTitle={<ProjectConnectDataConnectorModalTitle />}
        toggle={toggle}
        data-cy="project-data-connector-connect-header"
      >
        <ProjectConnectDataConnectorModeSwitch mode={mode} setMode={setMode} />
      </ModalHeader>
      {mode === "create" ? (
        <ProjectCreateDataConnectorBodyAndFooter
          {...{
            isOpen,
            namespace,
            project,
            switchMode,
            toggle,
          }}
        />
      ) : mode === "link" ? (
        <ProjectLinkDataConnectorBodyAndFooter
          {...{
            isOpen,
            namespace,
            project,
            toggle,
          }}
        />
      ) : mode === "doi" ? (
        <ProjectDoiDataConnectorBodyAndFooter
          {...{
            isOpen,
            namespace,
            project,
            toggle,
          }}
        />
      ) : (
        <ProjectSearchDataConnectorBodyAndFooter
          {...{
            isOpen,
            namespace,
            project,
            switchMode,
            toggle,
          }}
        />
      )}
    </ScrollableModal>
  );
}

function ProjectConnectDataConnectorModalTitle() {
  const { flatDataConnector, cloudStorageState } = useAppSelector(
    (state) => state.dataConnectorFormSlice
  );

  const title =
    cloudStorageState?.step > 1
      ? `${flatDataConnector?.schema ?? ""} ${
          flatDataConnector?.provider ?? ""
        }`
      : "";
  return (
    <>
      <Database className={cx("bi", "me-1")} />
      Link or create data connector {title.trim()}
    </>
  );
}

function ProjectConnectDataConnectorModeSwitch({
  mode,
  setMode,
}: {
  mode: ProjectConnectDataConnectorMode;
  setMode: (mode: ProjectConnectDataConnectorMode) => void;
}) {
  return (
    <ButtonGroup>
      <Input
        type="radio"
        className="btn-check"
        id="project-data-controller-mode-search"
        value="search"
        checked={mode === "search"}
        onChange={() => {
          setMode("search");
        }}
      />
      <Label
        data-cy="project-data-controller-mode-search"
        for="project-data-controller-mode-search"
        className={cx("btn", "btn-outline-primary", "mb-0")}
      >
        <NodePlus className={cx("bi", "me-1")} />
        NEW
      </Label>

      <Input
        type="radio"
        className="btn-check"
        id="project-data-controller-mode-link"
        value="link"
        checked={mode === "link"}
        onChange={() => {
          setMode("link");
        }}
      />
      <Label
        data-cy="project-data-controller-mode-link"
        for="project-data-controller-mode-link"
        className={cx("btn", "btn-outline-primary", "mb-0")}
      >
        <NodePlus className={cx("bi", "me-1")} />
        Link
      </Label>

      <Input
        type="radio"
        className="btn-check"
        id="project-data-controller-mode-doi"
        value="link"
        checked={mode === "doi"}
        onChange={() => {
          setMode("doi");
        }}
      />
      <Label
        data-cy="project-data-controller-mode-doi"
        for="project-data-controller-mode-doi"
        className={cx(
          "btn",
          "btn-outline-primary",
          "mb-0",
          "border-end-0",
          "border-start-0"
        )}
      >
        <Link45deg className={cx("bi", "me-1")} />
        DOI
      </Label>

      <Input
        type="radio"
        className="btn-check"
        id="project-data-controller-mode-create"
        value="create"
        checked={mode === "create"}
        onChange={() => {
          setMode("create");
        }}
      />
      <Label
        data-cy="project-data-controller-mode-create"
        for="project-data-controller-mode-create"
        className={cx("btn", "btn-outline-primary", "mb-0")}
      >
        <PlusLg className={cx("bi", "me-1")} />
        Create
      </Label>
    </ButtonGroup>
  );
}

function ProjectCreateDataConnectorBodyAndFooter({
  isOpen,
  namespace,
  project,
  switchMode,
  toggle,
}: ProjectConnectDataConnectorsModalProps) {
  return (
    <DataConnectorModalBodyAndFooter
      dataConnector={null}
      {...{
        isOpen,
        namespace,
        project,
        switchMode,
        toggle,
      }}
    />
  );
}

interface DataConnectorLinkFormFields {
  dataConnectorIdentifier: string;
}

function ProjectLinkDataConnectorBodyAndFooter({
  project,
  toggle,
}: ProjectConnectDataConnectorsModalProps) {
  const dispatch = useAppDispatch();

  const toggleModal = useCallback(() => {
    dispatch(dataConnectorFormSlice.actions.resetTransientState());
    toggle();
  }, [dispatch, toggle]);
  const [fetchOnePartSlug, onePartSlugQuery] =
    dataConnectorsApi.endpoints.getDataConnectorsGlobalBySlug.useLazyQuery();
  const [fetchTwoPartsSlug, twoPartsSlugQuery] =
    dataConnectorsApi.endpoints.getNamespacesByNamespaceDataConnectorsAndSlug.useLazyQuery();
  const [fetchThreePartsSlug, threePartsSlugQuery] =
    dataConnectorsApi.endpoints.getNamespacesByNamespaceProjectsAndProjectDataConnectorsSlug.useLazyQuery();

  const [requestId, setRequestId] = useState<string>("");
  const currentQuery = useMemo(
    () =>
      onePartSlugQuery.requestId === requestId
        ? onePartSlugQuery
        : twoPartsSlugQuery.requestId === requestId
        ? twoPartsSlugQuery
        : threePartsSlugQuery.requestId === requestId
        ? threePartsSlugQuery
        : undefined,
    [requestId, onePartSlugQuery, twoPartsSlugQuery, threePartsSlugQuery]
  );

  const [
    linkDataConnector,
    { error: linkDataConnectorError, isLoading, isSuccess },
  ] = usePostDataConnectorsByDataConnectorIdProjectLinksMutation();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<DataConnectorLinkFormFields>({
    defaultValues: {
      dataConnectorIdentifier: "",
    },
  });

  const onSubmit = useCallback(
    (values: DataConnectorLinkFormFields) => {
      const [part1, part2, part3] = values.dataConnectorIdentifier.split(
        "/",
        3
      );
      const { requestId } =
        part2 == null
          ? fetchOnePartSlug({
              slug: part1,
            })
          : part3 == null
          ? fetchTwoPartsSlug({
              namespace: part1,
              slug: part2,
            })
          : fetchThreePartsSlug({
              namespace: part1,
              project: part2,
              slug: part3,
            });
      setRequestId(requestId);
    },
    [fetchOnePartSlug, fetchThreePartsSlug, fetchTwoPartsSlug]
  );

  useEffect(() => {
    const dataConnector = currentQuery?.currentData;
    if (dataConnector == null) {
      return;
    }
    linkDataConnector({
      dataConnectorId: dataConnector.id,
      dataConnectorToProjectLinkPost: {
        project_id: project.id,
      },
    });
  }, [currentQuery?.currentData, linkDataConnector, project.id]);

  useEffect(() => {
    if (isSuccess) {
      reset();
      toggle();
    }
  }, [isSuccess, reset, toggle]);

  const error = currentQuery?.error ?? linkDataConnectorError;

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <ModalBody data-cy="data-connector-edit-body">
        <p className="text-body-secondary">
          Link an existing data connector to this project. Permission
          restrictions might apply to users accessing the project.
        </p>
        <div className="mb-3">
          <Label className="form-label" for="data-connector-identifier">
            Data connector identifier
          </Label>
          <Controller
            control={control}
            name="dataConnectorIdentifier"
            render={({ field }) => (
              <Input
                className={cx(
                  "form-control",
                  errors.dataConnectorIdentifier && "is-invalid"
                )}
                id="data-connector-identifier"
                placeholder="namespace/slug"
                type="text"
                {...field}
              />
            )}
            rules={{
              required: true,
              pattern: /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+){0,2}$/,
            }}
          />
          <div className="invalid-feedback">
            {errors.dataConnectorIdentifier == null
              ? undefined
              : errors.dataConnectorIdentifier.message != null &&
                errors.dataConnectorIdentifier.message.length > 0
              ? errors.dataConnectorIdentifier.message
              : "Please provide an identifier for the data connector"}
          </div>
          <div className="form-text">
            Paste a data connector identifier. You can find it on the the data
            connector&apos;s side panel
          </div>
        </div>
        {error != null && <RtkOrDataServicesError error={error} />}
      </ModalBody>

      <ModalFooter className="border-top" data-cy="data-connector-edit-footer">
        <Button color="outline-primary" onClick={toggleModal}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          data-cy="link-data-connector-button"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <NodePlus className={cx("bi", "me-1")} />
          )}
          Link data connector
        </Button>
      </ModalFooter>
    </Form>
  );
}

interface DataConnectorDoiFormFields {
  doi: string;
}

function ProjectDoiDataConnectorBodyAndFooter({
  project,
  toggle,
}: ProjectConnectDataConnectorsModalProps) {
  const [
    postDataConnector,
    {
      data: postDataConnectorData,
      error: postDataConnectorError,
      isLoading: postDataConnectorLoading,
      isSuccess: postDataConnectorSuccess,
    },
  ] = usePostDataConnectorsGlobalMutation();

  const [
    linkDataConnector,
    {
      error: linkDataConnectorError,
      isLoading: linkDataConnectorLoading,
      isSuccess: linkDataConnectorSuccess,
    },
  ] = usePostDataConnectorsByDataConnectorIdProjectLinksMutation();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<DataConnectorDoiFormFields>({
    defaultValues: {
      doi: "",
    },
  });

  const error = postDataConnectorError ?? linkDataConnectorError;
  const isLoading = postDataConnectorLoading || linkDataConnectorLoading;

  const onSubmit = useCallback(
    (values: DataConnectorDoiFormFields) => {
      const doi = doiFromUrl(values.doi);
      postDataConnector({
        globalDataConnectorPost: {
          storage: {
            configuration: {
              type: "doi",
              doi: doi,
            },
            source_path: "/",
            target_path: "/",
            readonly: true,
          },
        },
      });
    },
    [postDataConnector]
  );

  // Link the data connector to the project if creation was successful
  useEffect(() => {
    if (postDataConnectorSuccess && postDataConnectorData) {
      linkDataConnector({
        dataConnectorId: postDataConnectorData.id,
        dataConnectorToProjectLinkPost: {
          project_id: project.id,
        },
      });
    }
  }, [
    linkDataConnector,
    postDataConnectorData,
    postDataConnectorSuccess,
    project.id,
  ]);

  // Close the modal and reset the Form if linking was successful
  useEffect(() => {
    if (linkDataConnectorSuccess) {
      reset();
      toggle();
    }
  }, [linkDataConnectorSuccess, reset, toggle]);

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      <ModalBody data-cy="data-connector-edit-body">
        <p className="text-body-secondary">
          Connect to data on Zenodo, Dataverse, and similar data repositories.
          More information{" "}
          <ExternalLink
            iconAfter={true}
            role="link"
            title="in our documentation"
            url={NEW_DOCS_DATA_CONNECTORS_FROM_REPO}
          />
          .
        </p>
        <div className="mb-3">
          <Label className="form-label" for="data-connector-identifier">
            DOI
          </Label>
          <Controller
            control={control}
            name="doi"
            render={({ field }) => (
              <Input
                className={cx("form-control", errors.doi && "is-invalid")}
                id="doi"
                placeholder="DOI identifier"
                type="text"
                {...field}
              />
            )}
            rules={{
              required: true,
            }}
          />
          <div className="invalid-feedback">Please provide a valid DOI</div>
          <div className="form-text">
            Paste a DOI, e.g. <code>10.5281/zenodo.3831980</code>.
          </div>
        </div>
        {error !== null && <RtkOrDataServicesError error={error} />}
      </ModalBody>

      <ModalFooter className="border-top" data-cy="data-connector-edit-footer">
        <Button color="outline-primary" onClick={() => toggle()}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          data-cy="doi-data-connector-button"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <Link45deg className={cx("bi", "me-1")} />
          )}
          Import DOI as data connector
        </Button>
      </ModalFooter>
    </Form>
  );
}

// interface DataConnectorSearchFormFields {
//   search: string;
// }
function ProjectSearchDataConnectorBodyAndFooter({
  project,
  switchMode,
  toggle,
}: ProjectConnectDataConnectorsModalProps) {
  // ? INFO HERE
  // ? 1. search for "slug:{search}" -- or perhaps "path:" then "slug:"?
  // ? 2. search for "inherited_member:@<current-user>"
  // ? 3. search for anything else -- if needed. Start with 1. and 2. and see if we need 3.
  // ? END INFO
  // ! Switch to the "lazy" version if we settle on querying only on click

  const { data: currentUser } = useGetUserQueryState();

  const [userSearchInput, setUserSearchInput] = useState("");
  const [querySearchInput, setQuerySearchInput] = useState("");

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const onSelectItem = useCallback(
    (dataConnectorId: string) => {
      setSelectedItemId(
        dataConnectorId === selectedItemId ? null : dataConnectorId
      );
    },
    [selectedItemId]
  );

  const LIKELY_DOI_ID = ":likely-doi";

  const searchType = "type:DataConnector";

  const searchIdentifierPrefix = "path:";
  const membershipString = `inherited_member:@${
    currentUser?.isLoggedIn && currentUser?.username ? currentUser.username : ""
  }`;

  const isLikelyDOI = isWellFormedDoi(querySearchInput);

  // Fetch the data. We match by 1) identifier, 2) membership, and 3) anything public
  const searchIdentifier = useGetSearchQueryQuery(
    querySearchInput
      ? {
          params: {
            q: `${searchType} ${searchIdentifierPrefix}${querySearchInput}`,
          },
        }
      : skipToken
  );
  const searchMembership = useGetSearchQueryQuery({
    params: { q: `${searchType} ${membershipString} ${querySearchInput}` },
  });
  const searchPublic = useGetSearchQueryQuery({
    params: { q: `${searchType} ${querySearchInput}` },
  });

  // Clean the results to avoid duplicates
  const searchIdentifierResults = useMemo(
    () => searchIdentifier.currentData?.items ?? [],
    [searchIdentifier.currentData?.items]
  ) as SearchDataConnector[];
  const searchIdentifierIds = useMemo(
    () =>
      new Set((searchIdentifier.currentData?.items ?? []).map((dc) => dc.id)),
    [searchIdentifier.currentData?.items]
  );

  const searchMembershipResults = useMemo(
    () =>
      (searchMembership.currentData?.items ?? []).filter(
        (dc) => !searchIdentifierIds.has(dc.id)
      ),
    [searchMembership.currentData?.items, searchIdentifierIds]
  ) as SearchDataConnector[];
  const membershipIds = useMemo(
    () => new Set(searchMembershipResults.map((dc) => dc.id)),
    [searchMembershipResults]
  );

  const searchPublicResults = useMemo(
    () =>
      (searchPublic.currentData?.items ?? []).filter(
        (dc) => !membershipIds.has(dc.id)
      ),
    [searchPublic.currentData?.items, membershipIds]
  ) as SearchDataConnector[];

  // Variables to adjust the UI interactions
  const allIds = useMemo(() => {
    const ids = new Set<string>();
    searchIdentifierResults.forEach((dc) => ids.add(dc.id));
    searchMembershipResults.forEach((dc) => ids.add(dc.id));
    searchPublicResults.forEach((dc) => ids.add(dc.id));
    return ids;
  }, [searchIdentifierResults, searchMembershipResults, searchPublicResults]);

  const anythingMatched =
    isLikelyDOI ||
    searchIdentifierResults.length > 0 ||
    searchMembershipResults.length > 0 ||
    searchPublicResults.length > 0;

  const isAnythingFetching =
    searchIdentifier.isFetching ||
    searchMembership.isFetching ||
    searchPublic.isFetching;

  // ? This prevents accidentally adding a previously selected item that is not listed anymore
  const selectedItemIdEffective =
    selectedItemId &&
    (selectedItemId === LIKELY_DOI_ID
      ? isLikelyDOI
      : allIds.has(selectedItemId))
      ? selectedItemId
      : null;

  // Show components
  return (
    <Form noValidate>
      <ModalBody data-cy="data-connector-search-body" toggle={toggle}>
        {/* <p>
          You can paste an identifier (e.g. <code>sdsc/deeplnafrica-data</code>
          ), a DOI (e.g. <code>10.5281/zenodo.3831980</code>), or type any text
          to search through our catalogue.
        </p> */}
        <p>
          Link an existing data connector to the{" "}
          <span className={cx("fst-italic", "fw-semibold")}>
            {project.name}
          </span>{" "}
          project.
        </p>

        {switchMode && (
          <p>
            If you need something specific, you can{" "}
            <Button
              className={cx("align-baseline", "p-0")}
              color="link"
              // color="outline-primary"
              // size="sm"
              type="button"
              onClick={switchMode}
            >
              create a new data connector
            </Button>
            .
          </p>
        )}

        <div className="mb-3">
          <Label className="d-none" for="data-connector-identifier">
            Search
          </Label>
          <InputGroup>
            <Input
              className="form-control"
              id="search"
              // placeholder="Paste an identifier, a DOI, or search..."
              placeholder="Type to search..."
              type="text"
              value={userSearchInput}
              onBlur={() => {
                setQuerySearchInput(userSearchInput);
              }}
              onChange={(e) => setUserSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setQuerySearchInput(userSearchInput);
                }
              }}
            />
            <Button
              color="primary"
              data-cy="search-data-connectors-button"
              id="search-button"
              type="button"
              onClick={() => setQuerySearchInput(userSearchInput)}
            >
              <Search className={cx("bi", "me-1")} /> Search
            </Button>
          </InputGroup>
          <p className="form-text">
            You can paste an identifier (e.g.{" "}
            <code>sdsc/deeplnafrica-data</code>
            ), a DOI (e.g. <code>10.5281/zenodo.3831980</code>), or type any
            text to search through our catalogue.
          </p>
        </div>

        <div>
          <h4>Existing data connectors</h4>
        </div>
        {!anythingMatched && (
          <div>
            No data connectors found. You can try the following: (same options
            shown for Other options, but no collapsible element)
          </div>
        )}

        <ListGroup>
          {isLikelyDOI && (
            <SearchResultListItem
              dataConnector={
                {
                  id: LIKELY_DOI_ID,
                  name: "This looks like a DOI! Import it?",
                  storageType: "doi",
                } as SearchDataConnector
              }
              highlight={selectedItemIdEffective === LIKELY_DOI_ID}
              key={LIKELY_DOI_ID}
              selectItem={onSelectItem}
              source="doi"
            />
          )}

          {searchIdentifierResults.map((item) => {
            return (
              <SearchResultListItem
                dataConnector={item}
                highlight={selectedItemIdEffective === item.id}
                key={item.id}
                selectItem={onSelectItem}
                source="identifier"
              />
            );
          })}

          {searchMembershipResults.map((item) => {
            return (
              <SearchResultListItem
                dataConnector={item}
                highlight={selectedItemIdEffective === item.id}
                key={item.id}
                selectItem={onSelectItem}
                source="membership"
              />
            );
          })}

          {searchPublicResults.map((item) => {
            return (
              <SearchResultListItem
                dataConnector={item}
                highlight={selectedItemIdEffective === item.id}
                key={item.id}
                selectItem={onSelectItem}
                source={item.storageType === "doi" ? "doi" : "public"}
              />
            );
          })}
        </ListGroup>

        {anythingMatched && (
          <p className="form-text">
            Button to load more? I would rely on the full search instead...
          </p>
        )}

        {anythingMatched && (
          <div className="mt-3">
            <h4 className="mb-0">&gt; Other options</h4>
            <div className="form-text">
              Todo -- collapsible element, include link to search and the
              possibility to force actions (E.G: try to link or import DOI even
              for unmatched strings)
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter
        className="border-top"
        data-cy="data-connector-search-footer"
      >
        <Button color="outline-primary" onClick={() => toggle()} type="button">
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          disabled={isAnythingFetching || !selectedItemIdEffective}
          type="button"
        >
          {selectedItemIdEffective === LIKELY_DOI_ID ? (
            <>
              <NodePlus className={cx("bi", "me-1")} />
              Import and link DOI
            </>
          ) : (
            <>
              <Link45deg className={cx("bi", "me-1")} />
              Link data connector
            </>
          )}
        </Button>
      </ModalFooter>
    </Form>
  );
}

type DataConnectorSearchSource = "doi" | "identifier" | "membership" | "public";
interface SearchResultListItemProps {
  dataConnector: SearchDataConnector;
  highlight?: boolean;
  selectItem: (dataConnectorId: string) => void;
  source: DataConnectorSearchSource;
}
function SearchResultListItem({
  dataConnector,
  highlight,
  selectItem,
  source,
}: SearchResultListItemProps) {
  // TODO: We want to add an ExternalLink to let users check the data connector before linking it.
  // TODO: We can do that as soon as we have a page for data connectors.

  return (
    <ListGroupItem
      className={cx(
        "cursor-pointer",
        "link-primary",
        "text-body",
        "list-group-item",
        "list-group-item-action",
        highlight && ["bg-opacity-10", "bg-primary", "border-primary-subtle"]
      )}
      data-cy="link-data-connector-list-item"
      onClick={() => selectItem(dataConnector.id)}
    >
      <Row className="g-2">
        <Col className={cx()}>{dataConnector.name}</Col>
        <Col xs="auto">
          <DataConnectorSearchSourceBadge source={source} />
        </Col>
      </Row>
    </ListGroupItem>
  );
}

interface DataConnectorSearchSourceBadgeProps {
  source: DataConnectorSearchSource;
}
function DataConnectorSearchSourceBadge({
  source,
}: DataConnectorSearchSourceBadgeProps) {
  const badgeText =
    source === "doi" ? (
      <div>
        <Link45deg className={cx("bi", "me-1")} />
        DOI
      </div>
    ) : source === "identifier" ? (
      <div>
        <Bullseye className={cx("bi", "me-1")} />
        Match an identifier
      </div>
    ) : source === "membership" ? (
      <div>
        <People className={cx("bi", "me-1")} />
        Your groups or projects
      </div>
    ) : (
      <div>
        <Globe className={cx("bi", "me-1")} />
        Public
      </div>
    );

  return (
    <RenkuBadge color="light" data-cy={`search-result-source-${source}`}>
      {badgeText}
    </RenkuBadge>
  );
}

export function isWellFormedDoi(input: string): boolean {
  const s = input
    .trim()
    .replace(/^doi:\s*/iu, "")
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//iu, "");

  // Prefix: DOI requires 10.<something> (digits, optionally split by dots)
  const match = /^10\.\d+(?:\.\d+)*\/([\s\S]+)$/u.exec(s);
  if (!match) return false;

  const suffix = match[1];
  if (suffix.length === 0) return false;

  // Reject Unicode "Other" category (controls, format chars, surrogates,
  // private-use, unassigned) and line/paragraph separators.
  // Spaces inside the suffix are allowed by the DOI spec.
  if (/[\p{C}\p{Zl}\p{Zp}]/u.test(suffix)) return false;

  return true;
}
