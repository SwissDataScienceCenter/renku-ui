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

import RenkuBadge from "~/components/renkuBadge/RenkuBadge";
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

  const SEARCH_QUERY_DEBOUNCE_MS = 300;
  const LIKELY_DOI_ID = ":likely-doi";
  const searchType = "type:DataConnector";
  const searchIdentifierPrefix = "path:";
  const membershipString = `inherited_member:@${
    currentUser?.isLoggedIn && currentUser?.username ? currentUser.username : ""
  }`;

  // Debounce logic to avoid sending search queries on every keystroke
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuerySearchInput(userSearchInput);
    }, SEARCH_QUERY_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [userSearchInput]);

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
    () => searchIdentifier.data?.items ?? [],
    [searchIdentifier.data?.items]
  ) as SearchDataConnector[];
  const searchIdentifierIds = useMemo(
    () => new Set((searchIdentifier.data?.items ?? []).map((dc) => dc.id)),
    [searchIdentifier.data?.items]
  );

  const searchMembershipResults = useMemo(
    () =>
      (searchMembership.data?.items ?? []).filter(
        (dc) => !searchIdentifierIds.has(dc.id)
      ),
    [searchMembership.data?.items, searchIdentifierIds]
  ) as SearchDataConnector[];
  const membershipIds = useMemo(
    () => new Set(searchMembershipResults.map((dc) => dc.id)),
    [searchMembershipResults]
  );

  const searchPublicResults = useMemo(
    () =>
      (searchPublic.data?.items ?? []).filter(
        (dc) => !membershipIds.has(dc.id)
      ),
    [searchPublic.data?.items, membershipIds]
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
        "py-2",
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
