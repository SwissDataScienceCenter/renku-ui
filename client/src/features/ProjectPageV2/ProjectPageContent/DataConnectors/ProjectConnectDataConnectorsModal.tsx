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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bullseye, // eslint-disable-line spellcheck/spell-checker
  CheckLg,
  Database,
  Globe,
  Journals,
  Link45deg,
  NodePlus,
  People,
  PlusLg,
  XCircleFill,
} from "react-bootstrap-icons";
import { createSearchParams, Link } from "react-router";
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
  Row,
} from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import ExternalLink from "~/components/ExternalLink";
import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import {
  useGetProjectsByProjectIdDataConnectorLinksQuery,
  usePostDataConnectorsByDataConnectorIdProjectLinksMutation,
  usePostDataConnectorsGlobalMutation,
} from "~/features/dataConnectorsV2/api/data-connectors.enhanced-api";
import { normalizeAsDoi } from "~/features/dataConnectorsV2/components/dataConnector.utils";
import DataConnectorModal, {
  DataConnectorModalBodyAndFooter,
} from "~/features/dataConnectorsV2/components/DataConnectorModal";
import {
  SearchDataConnector,
  useGetSearchQueryQuery,
} from "~/features/searchV2/api/searchV2Api.api";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { NEW_DOCS_DATA_CONNECTORS } from "~/utils/constants/NewDocs";
import ModalHeader from "../../../../components/modal/ModalHeader";
import ScrollableModal from "../../../../components/modal/ScrollableModal";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import dataConnectorFormSlice from "../../../dataConnectorsV2/state/dataConnectors.slice";
import type { Project } from "../../../projectsV2/api/projectV2.api";
import { doiFromUrl } from "../../utils/dataConnectorUtils";
import {
  DC_LIKELY_DOI_ID,
  DC_SEARCH_DOI_PREFIX,
  DC_SEARCH_INHERITED_PREFIX,
  DC_SEARCH_MAX_RESULTS,
  DC_SEARCH_NAMESPACE_PREFIX,
  DC_SEARCH_QUERY_DEBOUNCE_MS,
  DC_SEARCH_SLUG_PREFIX,
  DC_SEARCH_TYPE,
  DC_SUCCESS_MESSAGE_TIMEOUT_MS,
} from "./projectDataConnectors.constants";

interface ProjectConnectDataConnectorsModalProps
  extends Omit<
    Parameters<typeof DataConnectorModal>[0],
    "dataConnector" | "projectId"
  > {
  project: Project;
  switchMode?: () => void;
}

type ProjectConnectDataConnectorMode = "create" | "search";

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
      ></ModalHeader>
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

export function ProjectConnectDataConnectorModeSwitch({
  mode,
  switchMode,
}: {
  mode: ProjectConnectDataConnectorMode;
  switchMode: () => void;
}) {
  return (
    <ButtonGroup>
      <Input
        type="radio"
        className="btn-check"
        id="project-data-controller-mode-search"
        value="search"
        checked={mode === "search"}
        onChange={switchMode}
      />
      <Label
        data-cy="project-data-controller-mode-search"
        for="project-data-controller-mode-search"
        className={cx(
          "align-items-center",
          "btn-outline-primary",
          "btn",
          "d-flex"
        )}
      >
        <NodePlus className={cx("fs-3", "me-1")} />
        Link a data connector
      </Label>

      <Input
        type="radio"
        className="btn-check"
        id="project-data-controller-mode-create"
        value="create"
        checked={mode === "create"}
        onChange={switchMode}
      />
      <Label
        data-cy="project-data-controller-mode-create"
        for="project-data-controller-mode-create"
        className={cx(
          "align-items-center",
          "btn-outline-primary",
          "btn",
          "d-flex"
        )}
      >
        <PlusLg className={cx("fs-3", "me-1")} />
        Create a data connector
      </Label>
    </ButtonGroup>
  );
}

function ProjectSearchDataConnectorBodyAndFooter({
  isOpen,
  project,
  switchMode,
  toggle,
}: ProjectConnectDataConnectorsModalProps) {
  // ? The logic for the input string is the following:
  // ? 0. check if it's a doi
  // ? 1. search for a DC with same identifier with "slug:" and "namespace:"
  // ? 2. search for DCs shared with the user with "inherited_member:@<current-user>"
  // ? 3. search for public DCs

  const { data: currentUser } = useGetUserQueryState();

  const [userSearchInput, setUserSearchInput] = useState("");
  const [querySearchInput, setQuerySearchInput] = useState("");

  const membershipString = `${DC_SEARCH_INHERITED_PREFIX}${
    currentUser?.isLoggedIn && currentUser?.username ? currentUser.username : ""
  }`;

  // Keep track of the imported item to show a "success" feedback
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  useEffect(() => {
    if (selectedItemId == null) return;

    const timeout = setTimeout(() => {
      setSelectedItemId(null);
    }, DC_SUCCESS_MESSAGE_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [selectedItemId]);

  // Get the project data connectors to exclude from the search results, except from recently added
  const projectDataConnectorLinks =
    useGetProjectsByProjectIdDataConnectorLinksQuery({
      projectId: project.id,
    });
  const projectDataConnectorIds = useMemo(() => {
    if (projectDataConnectorLinks.data == null) return new Set<string>();
    return new Set(
      projectDataConnectorLinks.data
        .map((link) => link.data_connector_id)
        .filter((id) => id !== selectedItemId)
    );
  }, [projectDataConnectorLinks.data, selectedItemId]);

  // Debounce logic to avoid sending search queries on every keystroke
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuerySearchInput(userSearchInput);
    }, DC_SEARCH_QUERY_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [userSearchInput]);

  const normalizedDOI = normalizeAsDoi(querySearchInput);

  // Fetch the data. We match by 0) DOI 1) identifier, 2) membership, and 3) anything public
  const searchImportedDoi = useGetSearchQueryQuery(
    normalizedDOI
      ? {
          params: {
            q: `${DC_SEARCH_TYPE} ${DC_SEARCH_DOI_PREFIX}${normalizedDOI}`,
          },
        }
      : skipToken
  );

  const searchIdentifier = useGetSearchQueryQuery(
    querySearchInput
      ? {
          params: {
            q: querySearchInput.includes("/")
              ? `${DC_SEARCH_TYPE} ${DC_SEARCH_NAMESPACE_PREFIX}${querySearchInput.slice(
                  0,
                  querySearchInput.lastIndexOf("/")
                )} ${DC_SEARCH_SLUG_PREFIX}${querySearchInput.slice(
                  querySearchInput.lastIndexOf("/") + 1
                )}
                `
              : `${DC_SEARCH_TYPE} ${DC_SEARCH_SLUG_PREFIX}${querySearchInput}`,
          },
        }
      : skipToken
  );
  const searchMembership = useGetSearchQueryQuery({
    params: {
      per_page: DC_SEARCH_MAX_RESULTS,
      q: `${DC_SEARCH_TYPE} ${membershipString} ${querySearchInput}`,
    },
  });
  const searchPublic = useGetSearchQueryQuery({
    params: {
      per_page: DC_SEARCH_MAX_RESULTS * 2, // ? x2 because we might be unlucky and get all the membership results that we filter out
      q: `${DC_SEARCH_TYPE} ${querySearchInput}`,
    },
  });

  // Process results to exclude duplicates
  const searchImportedDoiResult = useMemo(
    () =>
      (searchImportedDoi.data?.items ?? []).find(
        (dc) => !projectDataConnectorIds.has(dc.id)
      ) as SearchDataConnector | undefined,
    [searchImportedDoi.data?.items, projectDataConnectorIds]
  );

  const searchIdentifierResult = useMemo(
    () =>
      (searchIdentifier.data?.items ?? []).find(
        (dc) => !projectDataConnectorIds.has(dc.id)
      ) as SearchDataConnector | undefined,
    [searchIdentifier.data?.items, projectDataConnectorIds]
  );
  const searchIdentifierId = useMemo(() => {
    return searchIdentifierResult?.id;
  }, [searchIdentifierResult]);

  const searchMembershipResults = useMemo(
    () =>
      (searchMembership.data?.items ?? []).filter(
        (dc) =>
          dc.id !== searchIdentifierId && !projectDataConnectorIds.has(dc.id)
      ) as SearchDataConnector[],
    [projectDataConnectorIds, searchIdentifierId, searchMembership.data?.items]
  );
  const membershipIds = useMemo(() => {
    const ids = new Set(searchIdentifierId ? [searchIdentifierId] : []);
    searchMembershipResults.forEach((dc) => ids.add(dc.id));
    return ids;
  }, [searchIdentifierId, searchMembershipResults]);

  const searchPublicResults = useMemo(() => {
    const results: SearchDataConnector[] = [];
    const maxLength = DC_SEARCH_MAX_RESULTS - searchMembershipResults.length;

    for (const dc of searchPublic.data?.items ?? []) {
      if (!membershipIds.has(dc.id) && !projectDataConnectorIds.has(dc.id)) {
        results.push(dc as SearchDataConnector);
        if (results.length === maxLength) break;
      }
    }

    return results;
  }, [
    membershipIds,
    projectDataConnectorIds,
    searchMembershipResults.length,
    searchPublic.data?.items,
  ]);

  // Link data connectors or doi
  const [postGlobalDataConnectorMutation, postGlobalDataConnectorStatus] =
    usePostDataConnectorsGlobalMutation();
  const [postLinkDataConnectorMutation, postLinkDataConnectorStatus] =
    usePostDataConnectorsByDataConnectorIdProjectLinksMutation();

  const onImportAndLinkGlobalDataConnector = useCallback(
    async (dataConnectorId: string) => {
      setSelectedItemId(
        dataConnectorId === selectedItemId ? null : dataConnectorId
      );

      const doiParsed = doiFromUrl(querySearchInput);
      const postResult = await postGlobalDataConnectorMutation({
        globalDataConnectorPost: {
          storage: {
            configuration: {
              type: "doi",
              doi: doiParsed,
            },
            source_path: "/",
            target_path: "/",
            readonly: true,
          },
        },
      });

      if (postResult.error || !postResult.data) return;

      postLinkDataConnectorMutation({
        dataConnectorId: postResult.data.id,
        dataConnectorToProjectLinkPost: {
          project_id: project.id,
        },
      });
    },
    [
      postGlobalDataConnectorMutation,
      postLinkDataConnectorMutation,
      project.id,
      selectedItemId,
      querySearchInput,
    ]
  );
  const onLinkDataConnector = useCallback(
    (dataConnectorId: string) => {
      setSelectedItemId(
        dataConnectorId === selectedItemId ? null : dataConnectorId
      );
      postLinkDataConnectorMutation({
        dataConnectorId,
        dataConnectorToProjectLinkPost: {
          project_id: project.id,
        },
      });
    },
    [selectedItemId, project.id, postLinkDataConnectorMutation]
  );

  // Variables to adjust the UI interactions
  const anythingMatched =
    normalizedDOI ||
    searchIdentifierResult ||
    searchMembershipResults.length > 0 ||
    searchPublicResults.length > 0;

  const isAnythingPosting =
    postGlobalDataConnectorStatus.isLoading ||
    postLinkDataConnectorStatus.isLoading;

  const alreadyImportedDataConnector = [
    searchIdentifier.currentData?.items?.at(0) as
      | SearchDataConnector
      | undefined,
    searchImportedDoi.currentData?.items?.at(0) as
      | SearchDataConnector
      | undefined,
  ].find((dc) => dc && projectDataConnectorIds.has(dc.id));

  // ? This shouldn't happen anymore since we check for existing DOIs/identifiers
  const isErrorPosting =
    postGlobalDataConnectorStatus.isError ||
    (postLinkDataConnectorStatus.isError &&
      "data" in postLinkDataConnectorStatus.error &&
      postLinkDataConnectorStatus.error.status !== 409);

  // Handle input auto-focus
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!isOpen) return;

    const id = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(id);
  }, [isOpen]);

  // Handle input reset
  const onReset = useCallback(() => {
    setUserSearchInput("");
    setQuerySearchInput("");
    searchInputRef.current?.focus();
  }, []);

  // Show components
  return (
    <Form noValidate>
      <ModalBody data-cy="data-connector-search-body" toggle={toggle}>
        {switchMode && (
          <div className="mb-3">
            <ProjectConnectDataConnectorModeSwitch
              mode="search"
              switchMode={switchMode}
            />
          </div>
        )}

        <div className="mb-4">
          <Label className="" for="data-connector-identifier">
            Search
          </Label>
          <InputGroup>
            <Input
              className="lg"
              data-cy="data-connector-search-input"
              id="search"
              innerRef={searchInputRef}
              placeholder="Search by name, DOI or identifier..."
              type="text"
              value={userSearchInput}
              onChange={(e) => setUserSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setQuerySearchInput(userSearchInput);
                }
              }}
            />
            <Button
              color="outline-secondary"
              className="border-secondary-subtle"
              data-cy="search-clear-button"
              onClick={onReset}
              id="search-button"
              type="button"
            >
              <XCircleFill className={cx("bi")} />
            </Button>
          </InputGroup>
          <p className="form-text">
            Search data connectors, import a DOI (e.g.{" "}
            <code>10.5281/zenodo.3831980</code>), or paste an identifier (e.g.{" "}
            <code>sdsc/deeplnafrica-data</code>). Learn more about{" "}
            <ExternalLink href={NEW_DOCS_DATA_CONNECTORS}>
              data connectors
            </ExternalLink>
            .
          </p>
        </div>

        {isErrorPosting && (
          <RtkOrDataServicesError
            error={
              postGlobalDataConnectorStatus.error ||
              postLinkDataConnectorStatus.error
            }
          />
        )}

        <ListGroup>
          {alreadyImportedDataConnector && (
            <SearchResultListItem
              dataConnector={alreadyImportedDataConnector}
              key={alreadyImportedDataConnector.id}
              source="existing"
            />
          )}

          {!alreadyImportedDataConnector && normalizedDOI && (
            <SearchResultListItem
              action={
                searchImportedDoiResult
                  ? onLinkDataConnector
                  : onImportAndLinkGlobalDataConnector
              }
              dataConnector={
                searchImportedDoiResult ??
                ({
                  id: DC_LIKELY_DOI_ID,
                  name: "This looks like a DOI! Import it?",
                  storageType: "doi",
                } as SearchDataConnector)
              }
              disabled={isAnythingPosting}
              justAdded={
                selectedItemId ===
                  (searchImportedDoiResult
                    ? searchImportedDoiResult.id
                    : DC_LIKELY_DOI_ID) &&
                !isErrorPosting &&
                !isAnythingPosting
              }
              highlight={true}
              key={
                searchImportedDoiResult
                  ? searchImportedDoiResult.id
                  : DC_LIKELY_DOI_ID
              }
              source="doi"
            />
          )}

          {!alreadyImportedDataConnector && searchIdentifierResult && (
            <SearchResultListItem
              action={onLinkDataConnector}
              dataConnector={searchIdentifierResult}
              disabled={isAnythingPosting}
              justAdded={
                selectedItemId === searchIdentifierResult.id &&
                !isErrorPosting &&
                !isAnythingPosting
              }
              highlight={true}
              key={searchIdentifierResult.id}
              source="identifier"
            />
          )}

          {!searchIdentifierResult &&
            searchMembershipResults.map((item) => {
              return (
                <SearchResultListItem
                  action={onLinkDataConnector}
                  dataConnector={item}
                  disabled={isAnythingPosting}
                  justAdded={
                    selectedItemId === item.id &&
                    !isErrorPosting &&
                    !isAnythingPosting
                  }
                  highlight={
                    selectedItemId === item.id &&
                    !isErrorPosting &&
                    !isAnythingPosting
                  }
                  key={item.id}
                  source="membership"
                />
              );
            })}

          {!searchIdentifierResult &&
            searchPublicResults.map((item) => {
              return (
                <SearchResultListItem
                  action={onLinkDataConnector}
                  dataConnector={item}
                  disabled={isAnythingPosting}
                  justAdded={
                    selectedItemId === item.id &&
                    !isErrorPosting &&
                    !isAnythingPosting
                  }
                  highlight={
                    selectedItemId === item.id &&
                    !isErrorPosting &&
                    !isAnythingPosting
                  }
                  key={item.id}
                  source={item.storageType === "doi" ? "doi" : "public"}
                />
              );
            })}
        </ListGroup>

        <p
          className={cx(
            "mb-0",
            (anythingMatched || alreadyImportedDataConnector) && "mt-2"
          )}
        >
          {anythingMatched || alreadyImportedDataConnector ? (
            <>
              <span>Explore more results in the</span>
            </>
          ) : (
            <>
              <span className="fw-semibold">Nothing found.</span> Try
            </>
          )}{" "}
          <Link
            to={{
              pathname: ABSOLUTE_ROUTES.v2.search,
              search: createSearchParams({
                type: "DataConnector",
                q: querySearchInput,
              }).toString(),
            }}
          >
            Search page
          </Link>
          .
        </p>
      </ModalBody>
    </Form>
  );
}

type DataConnectorSearchSource =
  | "doi"
  | "identifier"
  | "membership"
  | "public"
  | "existing";
interface SearchResultListItemProps {
  action?: (dataConnectorId: string) => void;
  dataConnector: SearchDataConnector;
  disabled?: boolean;
  justAdded?: boolean;
  highlight?: boolean;
  source: DataConnectorSearchSource;
}
function SearchResultListItem({
  action,
  dataConnector,
  disabled,
  justAdded,
  highlight,
  source,
}: SearchResultListItemProps) {
  // TODO: We want to add an ExternalLink to let users check the data connector before linking it.
  // TODO: We can do that as soon as we have a page for data connectors.

  return (
    <ListGroupItem
      className={cx(
        "text-body",
        "list-group-item-action",
        "py-1",
        highlight && ["bg-opacity-10", "bg-primary", "border-primary-subtle"]
      )}
      data-cy="link-data-connector-list-item"
    >
      <Row className="g-3">
        <Col className={cx("align-items-center", "d-flex")}>
          {dataConnector.name}
        </Col>
        <Col className={cx("align-items-center", "d-flex")} xs="auto">
          <DataConnectorSearchSourceBadge source={source} />
        </Col>
        {action ? (
          <Col className={cx("align-items-center", "d-flex")} xs="auto">
            {justAdded ? (
              <RenkuBadge
                className="my-1 fade" // ? takes the same vertical space as a <Button size="sm" />
                color="success"
                data-cy="data-connector-link-successful-badge"
              >
                <CheckLg className={cx("bi", "me-1")} />
                Linked
              </RenkuBadge>
            ) : (
              <Button
                color="outline-primary"
                data-cy="data-connector-link-button"
                disabled={disabled}
                onClick={() => {
                  action(dataConnector.id);
                }}
                size="sm"
                type="button"
              >
                <Link45deg className={cx("bi", "me-1")} />
                Link
              </Button>
            )}
          </Col>
        ) : (
          <Col className="px-0" xs="auto">
            <div aria-hidden className={cx("my-1", "opacity-0")}>
              &#x200B;
            </div>
          </Col>
        )}
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
        <Journals className={cx("bi", "me-1")} />
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
    ) : source === "existing" ? (
      <div>
        <Database className={cx("bi", "me-1")} />
        Already linked to project
      </div>
    ) : (
      <div>
        <Globe className={cx("bi", "me-1")} />
        Public
      </div>
    );

  return <p className={cx("mb-0", "small", "text-muted")}>{badgeText}</p>;
}
