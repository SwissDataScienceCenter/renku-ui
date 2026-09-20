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
 * limitations under the License.
 */

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  Bookmarks,
  CheckLg,
  ChevronCompactDown,
  Clock,
  Diagram3Fill,
  Globe2,
  Lock,
  ThreeDotsVertical,
} from "react-bootstrap-icons";
import { generatePath, Link, useLocation } from "react-router";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

import EntityIcon from "~/components/entityIcon/EntityIcon";
import KeywordBadge, {
  KeywordBadgeContent,
} from "~/components/keywords/KeywordBadge";
import KeywordContainer from "~/components/keywords/KeywordContainer";
import { Loader } from "~/components/Loader";
import { TimeCaption } from "~/components/TimeCaption";
import ProjectCopyModal from "~/features/ProjectPageV2/ProjectPageHeader/ProjectCopyModal";
import {
  useGetNamespacesByNamespaceSlugQuery,
  useGetProjectsByProjectIdMembersQuery,
  useGetProjectsByProjectIdQuery,
} from "~/features/projectsV2/api/projectV2.enhanced-api";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import { Project } from "../../projectsV2/api/projectV2.api";
import { ProjectInformationMembers } from "../ProjectPageContent/ProjectInformation/ProjectInformation";
import ProjectAutostartRedirectBanner from "./ProjectAutostartRedirectBanner";
import ProjectCopyBanner from "./ProjectCopyBanner";
import ProjectTemplateInfoBanner from "./ProjectTemplateInfoBanner";

import styles from "../../../components/Separator.module.scss";
import headerStyles from "./ProjectPageHeader.module.scss";

const KEYWORDS_DATA_CY = "project-header-keywords";

function useKeywordsInline({
  enabled,
  keywords,
  rowRef,
  metadataRef,
  measureRef,
}: {
  enabled: boolean;
  keywords: string[];
  rowRef: RefObject<HTMLDivElement | null>;
  metadataRef: RefObject<HTMLDivElement | null>;
  measureRef: RefObject<HTMLDivElement | null>;
}): boolean | null {
  const [inline, setInline] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    if (!enabled || keywords.length < 1) return;

    const row = rowRef.current;
    const metadata = metadataRef.current;
    const keywordsMeasure = measureRef.current;
    if (row == null || metadata == null || keywordsMeasure == null) return;

    const measure = () => {
      const available = row.clientWidth - metadata.offsetWidth;
      const fits = keywordsMeasure.offsetWidth <= available;
      setInline((current) => (current === fits ? current : fits));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    observer.observe(metadata);
    observer.observe(keywordsMeasure);
    return () => observer.disconnect();
  }, [enabled, keywords, measureRef, metadataRef, rowRef]);

  if (!enabled) return null;
  return inline;
}

const ELLIPSIS = "\u2060...";
const COLLAPSED_LINE_COUNT = 2;

function longestFittingPrefix(
  description: string,
  measure: HTMLElement,
  prefixNode: HTMLElement,
  suffixNode: HTMLElement,
  maxHeight: number,
  lineHeight: number,
): string | null {
  const fits = (text: string, withSuffix: boolean) => {
    prefixNode.textContent = text;
    suffixNode.style.display = withSuffix ? "inline" : "none";
    return measure.scrollHeight <= maxHeight;
  };

  if (fits(description, false)) return null;

  let low = 0;
  let high = description.length;
  let best = 0;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const candidate = `${description.slice(0, mid).trimEnd()}${ELLIPSIS}`;
    if (fits(candidate, true)) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  let text = description.slice(0, best).trimEnd();
  const space = Math.max(text.lastIndexOf(" "), text.lastIndexOf("\n"));
  if (space > 0) {
    const snapped = text.slice(0, space).trimEnd();
    const snappedFits =
      fits(`${snapped}${ELLIPSIS}`, true) &&
      measure.scrollHeight > lineHeight + 1;
    if (snappedFits) text = snapped;
  }
  return text;
}

function useCollapsedPrefix(description: string) {
  const blockRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLParagraphElement>(null);
  const prefixRef = useRef<HTMLSpanElement>(null);
  const suffixRef = useRef<HTMLSpanElement>(null);
  const [collapsedPrefix, setCollapsedPrefix] = useState<string | null>();

  useLayoutEffect(() => {
    const block = blockRef.current;
    const measure = measureRef.current;
    const prefixNode = prefixRef.current;
    const suffixNode = suffixRef.current;
    if (
      block == null ||
      measure == null ||
      prefixNode == null ||
      suffixNode == null
    ) {
      return;
    }

    const update = () => {
      const lineHeight = parseFloat(getComputedStyle(measure).lineHeight);
      if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
        setCollapsedPrefix((current) => (current === null ? current : null));
        return;
      }
      const next = longestFittingPrefix(
        description,
        measure,
        prefixNode,
        suffixNode,
        lineHeight * COLLAPSED_LINE_COUNT + 1,
        lineHeight,
      );
      setCollapsedPrefix((current) => (current === next ? current : next));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(block);
    return () => observer.disconnect();
  }, [description]);

  return { blockRef, measureRef, prefixRef, suffixRef, collapsedPrefix };
}

const COPY_TIMEOUT_MS = 3_000;

function useCopiedIndicator() {
  const [copied, setCopied] = useState(false);
  const currentTimeoutRef = useRef<number | null>(null);

  const markCopied = useCallback(() => {
    if (currentTimeoutRef.current != null) {
      window.clearTimeout(currentTimeoutRef.current);
    }
    currentTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, COPY_TIMEOUT_MS);
    setCopied(true);
  }, []);

  useEffect(() => {
    return () => {
      if (currentTimeoutRef.current != null) {
        window.clearTimeout(currentTimeoutRef.current);
      }
    };
  }, []);

  return { copied, markCopied };
}

function ProjectNamespaceLink({ namespace }: { namespace: string }) {
  const { data } = useGetNamespacesByNamespaceSlugQuery({
    namespaceSlug: namespace,
  });
  const namespaceName = data?.name ?? namespace;
  const namespaceUrl =
    data?.namespace_kind === "group"
      ? generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, { slug: namespace })
      : generatePath(ABSOLUTE_ROUTES.v2.users.show.root, {
          username: namespace,
        });

  return (
    <Link
      className={cx("min-w-0", "text-truncate")}
      data-cy="project-namespace-link"
      to={namespaceUrl}
    >
      {namespaceName}
    </Link>
  );
}

function ProjectCopiedFrom({ project }: { project: Project }) {
  const { data: templateProject, isLoading } = useGetProjectsByProjectIdQuery(
    project.template_id ? { projectId: project.template_id } : skipToken,
  );
  const { data: templateNamespace } = useGetNamespacesByNamespaceSlugQuery(
    templateProject ? { namespaceSlug: templateProject.namespace } : skipToken,
  );

  if (!project.template_id) return null;
  if (isLoading) return <Loader inline size={16} />;
  if (!templateProject || !templateNamespace) return null;

  const templateLabel = `${templateNamespace.name ?? templateNamespace.slug} / ${templateProject.name}`;
  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: templateProject.namespace,
    slug: templateProject.slug,
  });

  return (
    <Link
      className={cx(
        "align-items-center",
        "d-inline-flex",
        "min-w-0",
        "text-truncate",
      )}
      data-cy="copy-project-template-link"
      to={projectUrl}
    >
      <Diagram3Fill className={cx("bi", "flex-shrink-0", "me-1")} />
      <span className={cx("min-w-0", "text-truncate")}>
        Copied from {templateLabel}
      </span>
    </Link>
  );
}

function ProjectHeaderDetails({ project }: { project: Project }) {
  return (
    <div
      className={cx(
        "align-items-center",
        "d-flex",
        "flex-wrap",
        "gap-2",
        "gap-md-0",
        "min-w-0",
        "small",
        styles.dotSeparated,
      )}
    >
      <span
        className={cx("min-w-0", "text-truncate")}
        data-cy="project-identifier"
      >
        {`${project.namespace}/${project.slug}`}
      </span>
      <ProjectNamespaceLink namespace={project.namespace} />
      <ProjectCopiedFrom project={project} />
    </div>
  );
}

interface ProjectPageHeaderProps {
  project: Project;
}
export default function ProjectPageHeader({ project }: ProjectPageHeaderProps) {
  // ? We still use `autostartRedirect` for legacy projects registered for redirect
  const { search } = useLocation();
  const isAutostartRedirect =
    new URLSearchParams(search).get("autostartRedirect") === "true";

  // Members
  const { data: members } = useGetProjectsByProjectIdMembersQuery({
    projectId: project.id,
  });
  const settingsUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace ?? "",
    slug: project.slug ?? "",
  });
  const membersUrl = `${settingsUrl}#members`;

  // keywords
  const hasKeywords = !!project.keywords?.length && project.keywords.length > 0;
  const keywordsSorted = useMemo(() => {
    if (!project.keywords) return [];
    return project.keywords
      .map((keyword) => keyword.trim())
      .sort((a, b) => a.localeCompare(b));
  }, [project.keywords]);
  const rowRef = useRef<HTMLDivElement>(null);
  const metadataRef = useRef<HTMLDivElement>(null);
  const keywordsMeasureRef = useRef<HTMLDivElement>(null);
  const keywordsInline = useKeywordsInline({
    enabled: hasKeywords,
    keywords: keywordsSorted,
    rowRef,
    metadataRef,
    measureRef: keywordsMeasureRef,
  });

  return (
    <div className={cx("d-flex", "flex-column", "gap-2", "position-relative")}>
      <header
        className={cx(
          "d-flex",
          "flex-column",
          "flex-md-row",
          "flex-nowrap",
          "gap-3",
        )}
      >
        <EntityIcon type="project" />
        <div
          className={cx(
            "d-flex",
            "flex-column",
            "flex-grow-1",
            "justify-content-evenly",
            "min-w-0",
          )}
        >
          <div
            className={cx(
              "align-items-center",
              "d-flex",
              "flex-row",
              "justify-content-between",
              "min-w-0",
            )}
          >
            <h1
              className={cx("mb-0", "min-w-0", "text-break")}
              data-cy="project-name"
            >
              {project.name}
            </h1>
            <ProjectHeaderMenu project={project} />
          </div>
          <ProjectHeaderDetails project={project} />
          <div
            ref={rowRef}
            data-cy="project-info"
            className={cx(
              "align-items-center",
              "d-flex",
              "flex-md-nowrap",
              "flex-row",
              "flex-wrap",
              "min-w-0",
            )}
          >
            <div
              ref={metadataRef}
              className={cx(
                "align-items-center",
                "col-12",
                "col-md-auto",
                "d-flex",
                "flex-md-nowrap",
                "flex-row",
                "flex-shrink-0",
                "flex-wrap",
                "gap-2",
                "gap-md-0",
                "min-w-0",
                "mt-2",
                "mt-md-0",
                "mw-100",
                styles.dotSeparated,
              )}
            >
              <div
                className={cx(
                  "align-items-center",
                  "col-12",
                  "col-md-auto",
                  "d-flex",
                  "flex-row",
                  "flex-shrink-1",
                  "gap-2",
                  "min-w-0",
                  "small",
                )}
              >
                <ProjectInformationMembers
                  members={members}
                  membersUrl={membersUrl}
                />
              </div>
              {project.visibility === "private" ? (
                <div
                  className={cx(
                    "col-12",
                    "col-md-auto",
                    "flex-shrink-0",
                    "small",
                  )}
                >
                  <Lock className={cx("bi", "me-1")} />
                  Private
                </div>
              ) : (
                <div
                  className={cx(
                    "col-12",
                    "col-md-auto",
                    "flex-shrink-0",
                    "small",
                  )}
                >
                  <Globe2 className={cx("bi", "me-1")} />
                  Public
                </div>
              )}
              <div
                className={cx(
                  "col-12",
                  "col-md-auto",
                  "flex-shrink-0",
                  "small",
                )}
              >
                <Clock className={cx("bi", "me-1")} />
                Created
                <TimeCaption
                  datetime={project.creation_date}
                  prefix=""
                  className={cx(
                    "col-12",
                    "col-md-auto",
                    "flex-shrink-0",
                    "small",
                    "fw-bold",
                    "ms-1",
                  )}
                />
              </div>
            </div>
            {keywordsInline && (
              <HeaderKeywords
                keywordsSorted={keywordsSorted}
                leadingSeparator
              />
            )}
          </div>
        </div>
      </header>
      {keywordsInline === false && (
        <HeaderKeywords keywordsSorted={keywordsSorted} wrapBadges />
      )}
      {project.description && (
        <ProjectDescription
          key={project.description}
          description={project.description}
        />
      )}
      {project.is_template && (
        <>
          <ProjectTemplateInfoBanner project={project} />
          <ProjectCopyBanner project={project} />
        </>
      )}
      {isAutostartRedirect && (
        <ProjectAutostartRedirectBanner project={project} />
      )}
      {hasKeywords && (
        <HeaderKeywords
          keywordsSorted={keywordsSorted}
          leadingSeparator
          measureRef={keywordsMeasureRef}
        />
      )}
    </div>
  );
}

export function ProjectHeaderMenu({ project }: { project: Project }) {
  const { data: currentUser } = useGetUserQueryState();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopyModalOpen, setCopyModalOpen] = useState(false);
  const { copied, markCopied } = useCopiedIndicator();
  const toggleCopyModal = useCallback(() => {
    setCopyModalOpen((open) => !open);
  }, []);
  const clipboardText = `${project.namespace}/${project.slug}`;
  const onCopyToClipboard = useCallback(() => {
    window.navigator.clipboard.writeText(clipboardText).then(() => {
      markCopied();
    });
  }, [clipboardText, markCopied]);
  const isUserLoggedIn = currentUser?.isLoggedIn === true;

  return (
    <>
      <Dropdown isOpen={isOpen} toggle={() => setIsOpen((open) => !open)}>
        <DropdownToggle
          aria-label={copied ? "Copied project identifier" : "Project actions"}
          caret={false}
          color="outline-primary"
          data-cy="project-actions-menu"
        >
          {copied ? (
            <CheckLg className="bi" />
          ) : (
            <ThreeDotsVertical className="bi" />
          )}
        </DropdownToggle>

        <DropdownMenu container="body" end flip={false} strategy="fixed">
          {isUserLoggedIn && (
            <DropdownItem
              data-cy="project-copy-project-menu-item"
              onClick={toggleCopyModal}
            >
              Make a copy of this project
            </DropdownItem>
          )}
          <DropdownItem
            data-cy="project-copy-identifier-menu-item"
            onClick={onCopyToClipboard}
          >
            Copy project identifier to clipboard
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      {isUserLoggedIn && (
        <ProjectCopyModal
          currentUser={currentUser}
          isOpen={isCopyModalOpen}
          project={project}
          toggle={toggleCopyModal}
        />
      )}
    </>
  );
}

function DescriptionToggleContent({ label }: { label: string }) {
  return (
    <>
      <span className={cx(headerStyles.descriptionToggleText, "ms-1")}>
        {label}
      </span>
      <ChevronCompactDown className={cx("bi", "ms-1")} aria-hidden="true" />
    </>
  );
}

function ProjectDescription({ description }: { description: string }) {
  const toggleId = useId();
  const [expanded, setExpanded] = useState(false);
  const { blockRef, measureRef, prefixRef, suffixRef, collapsedPrefix } =
    useCollapsedPrefix(description);
  const measured = collapsedPrefix !== undefined;
  const collapsed = typeof collapsedPrefix === "string" && !expanded;

  return (
    <div
      ref={blockRef}
      className={cx("min-w-0", headerStyles.descriptionBlock)}
    >
      {typeof collapsedPrefix === "string" && (
        <input
          id={toggleId}
          type="checkbox"
          className={headerStyles.descriptionToggleInput}
          checked={expanded}
          onChange={(event) => setExpanded(event.currentTarget.checked)}
        />
      )}
      <p
        className={cx(
          "mb-0",
          "min-w-0",
          headerStyles.description,
          !measured && headerStyles.descriptionPending,
        )}
        data-cy="project-description"
      >
        {collapsed ? `${collapsedPrefix}${ELLIPSIS}` : description}
        {typeof collapsedPrefix === "string" && (
          <label
            htmlFor={toggleId}
            className={headerStyles.descriptionToggle}
            data-cy="project-description-toggle"
          >
            <DescriptionToggleContent
              label={collapsed ? "Read more" : "Show less"}
            />
          </label>
        )}
      </p>
      <div className={headerStyles.descriptionMeasure} aria-hidden="true">
        <p ref={measureRef} className={cx("mb-0", headerStyles.description)}>
          <span ref={prefixRef} />
          <span ref={suffixRef} className={headerStyles.descriptionToggle}>
            <DescriptionToggleContent label="Read more" />
          </span>
        </p>
      </div>
    </div>
  );
}

const keywordMeasureProps = {
  "aria-hidden": true,
  inert: true,
} as React.HTMLAttributes<HTMLDivElement>;

function HeaderKeywords({
  keywordsSorted,
  leadingSeparator = false,
  measureRef,
  wrapBadges = false,
}: {
  keywordsSorted: string[];
  leadingSeparator?: boolean;
  measureRef?: RefObject<HTMLDivElement>;
  wrapBadges?: boolean;
}) {
  const measuring = measureRef != null;
  const row = (
    <div
      ref={measureRef}
      {...(measuring ? keywordMeasureProps : {})}
      className={cx(
        "align-items-center",
        "d-flex",
        "flex-row",
        "gap-1",
        measuring && "flex-nowrap",
        measuring && headerStyles.keywordMeasure,
        !measuring && "col-12",
        !measuring && (wrapBadges ? "min-w-0" : "col-md-auto"),
        !measuring && !wrapBadges && "flex-shrink-0",
        leadingSeparator && styles.leadingSeparator,
      )}
      data-cy={measuring ? undefined : KEYWORDS_DATA_CY}
    >
      {keywordsSorted.length > 0 && (
        <KeywordContainer
          className={cx("mt-1", !measuring && wrapBadges && "min-w-0")}
          nowrap={measuring}
        >
          <Bookmarks className={cx("bi", "flex-shrink-0")} />
          {keywordsSorted.map((keyword, index) =>
            measuring ? (
              <KeywordBadgeContent key={`keyword-${index}`}>
                {keyword}
              </KeywordBadgeContent>
            ) : (
              <KeywordBadge key={`keyword-${index}`} searchKeyword={keyword}>
                {keyword}
              </KeywordBadge>
            ),
          )}
        </KeywordContainer>
      )}
    </div>
  );

  if (!measuring) return row;
  return <div className={headerStyles.keywordMeasureHost}>{row}</div>;
}
