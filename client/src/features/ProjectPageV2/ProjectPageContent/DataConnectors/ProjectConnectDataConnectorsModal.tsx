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
  Link45deg,
  People,
  XLg,
} from "react-bootstrap-icons";
import { createSearchParams, Link } from "react-router";
import {
  Button,
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

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
import {
  useGetProjectsByProjectIdDataConnectorLinksQuery,
  usePostDataConnectorsByDataConnectorIdProjectLinksMutation,
  usePostDataConnectorsGlobalMutation,
} from "~/features/dataConnectorsV2/api/data-connectors.enhanced-api";
import DataConnectorModal, {
  DataConnectorModalBodyAndFooter,
} from "~/features/dataConnectorsV2/components/DataConnectorModal";
import {
  SearchDataConnector,
  useGetSearchQueryQuery,
} from "~/features/searchV2/api/searchV2Api.api";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import ModalHeader from "../../../../components/modal/ModalHeader";
import ScrollableModal from "../../../../components/modal/ScrollableModal";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
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

// interface DataConnectorSearchFormFields {
//   search: string;
// }
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

  const DC_SEARCH_QUERY_DEBOUNCE_MS = 300;
  const LIKELY_DOI_ID = ":likely-doi";
  const DC_SEARCH_SLUG_PREFIX = "slug:";
  const DC_SEARCH_NAMESPACE_PREFIX = "namespace:";
  const DC_SEARCH_DOI_PREFIX = "doi:";
  const SUCCESS_MESSAGE_TIMEOUT_MS = 10_000;
  const DC_SEARCH_MAX_RESULTS = 10;

  const DC_SEARCH_TYPE = "type:DataConnector";
  const membershipString = `inherited_member:@${
    currentUser?.isLoggedIn && currentUser?.username ? currentUser.username : ""
  }`;

  // Keep track of the imported item to show a "success" feedback
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  useEffect(() => {
    if (selectedItemId == null) return;

    const timeout = setTimeout(() => {
      setSelectedItemId(null);
    }, SUCCESS_MESSAGE_TIMEOUT_MS);

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
    searchIdentifier.data?.items?.at(0) as SearchDataConnector | undefined,
    searchImportedDoi.data?.items?.at(0) as SearchDataConnector | undefined,
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

  // Show components
  return (
    <Form noValidate>
      <ModalBody data-cy="data-connector-search-body" toggle={toggle}>
        <p>
          Link an existing data connector
          {switchMode && (
            <span>
              {" "}
              or{" "}
              <Button
                className="align-baseline"
                color="primary"
                size="sm"
                type="button"
                onClick={switchMode}
              >
                create a new data connector
              </Button>
            </span>
          )}
        </p>

        <div className="mb-3">
          <Label className="" for="data-connector-identifier">
            Find a data connector
          </Label>
          <InputGroup>
            <Input
              className="lg"
              id="search"
              innerRef={searchInputRef}
              placeholder="Paste an identifier, a DOI, or search..."
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
          </InputGroup>
          <p className="form-text">
            You can paste an identifier (e.g.{" "}
            <code>sdsc/deeplnafrica-data</code>
            ), a DOI (e.g. <code>10.5281/zenodo.3831980</code>), or type any
            text to search through our catalogue.
          </p>
        </div>

        <p className="mb-1">
          {anythingMatched ? (
            <>
              <span className="fw-semibold">Pick from the list</span> or
            </>
          ) : (
            <>
              <span className="fw-semibold">Nothing relevant found.</span>{" "}
              Adjust the input or
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
            go to the search page
          </Link>{" "}
          to find more.
        </p>

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
                  id: LIKELY_DOI_ID,
                  name: "This looks like a DOI! Import it?",
                  storageType: "doi",
                } as SearchDataConnector)
              }
              disabled={isAnythingPosting}
              justAdded={
                selectedItemId ===
                  (searchImportedDoiResult
                    ? searchImportedDoiResult.id
                    : LIKELY_DOI_ID) &&
                !isErrorPosting &&
                !isAnythingPosting
              }
              highlight={true}
              key={
                searchImportedDoiResult
                  ? searchImportedDoiResult.id
                  : LIKELY_DOI_ID
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
      </ModalBody>
      <ModalFooter
        className="border-top"
        data-cy="data-connector-search-footer"
      >
        <Button color="outline-primary" onClick={() => toggle()} type="button">
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
      </ModalFooter>
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
      <Row className="g-2">
        <Col className={cx("align-items-center", "d-flex")}>
          {dataConnector.name}
        </Col>
        <Col className={cx("align-items-center", "d-flex")} xs="auto">
          <DataConnectorSearchSourceBadge source={source} />
        </Col>
        {action && (
          <Col className={cx("align-items-center", "d-flex")} xs="auto">
            {justAdded ? (
              <RenkuBadge
                className="my-1" // ? takes the same vertical space as a <Button size="sm" />
                color="success"
                data-cy="data-connector-link-successful-badge"
              >
                <CheckLg className={cx("bi", "me-1")} />
                Linked
              </RenkuBadge>
            ) : (
              <Button
                color="primary"
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

  return (
    <RenkuBadge color="light" data-cy={`search-result-source-${source}`}>
      {badgeText}
    </RenkuBadge>
  );
}

export function normalizeAsDoi(input: string): string {
  const doiConverted = doiFromUrl(input);
  const doiString = doiConverted
    .trim()
    .replace(/^doi:\s*/iu, "")
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//iu, "");

  // Prefix: DOI requires 10.<something> (digits, optionally split by dots)
  const match = /^10\.\d+(?:\.\d+)*\/([\s\S]+)$/u.exec(doiString);
  if (!match) return "";

  const suffix = match[1];
  if (suffix.length === 0) return "";

  // Reject Unicode "Other" category (controls, format chars, surrogates,
  // private-use, unassigned) and line/paragraph separators.
  // Spaces inside the suffix are allowed by the DOI spec.
  if (/[\p{C}\p{Zl}\p{Zp}]/u.test(suffix)) return "";

  return doiString;
}
