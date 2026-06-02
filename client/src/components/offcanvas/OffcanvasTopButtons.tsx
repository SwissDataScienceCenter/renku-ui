import cx from "classnames";
import { useRef } from "react";
import { ArrowsFullscreen, XLg } from "react-bootstrap-icons";
import { Link } from "react-router";
import { UncontrolledTooltip } from "reactstrap";

import { EntityTypes } from "../entities/entities.types";

interface OffcanvasTopButtonsProps {
  entityType?: EntityTypes;
  fullPageLink?: string;
  toggleView: () => void;
}
export default function OffcanvasTopButtons({
  entityType,
  fullPageLink,
  toggleView,
}: OffcanvasTopButtonsProps) {
  const refClose = useRef(null);
  const refExpand = useRef(null);

  return (
    <div className={cx("align-items-center", "d-flex", "gap-2", "mb-3")}>
      <button
        aria-label="Close"
        className={cx(
          "border-0",
          "btn",
          "d-flex",
          "fs-2",
          "link-secondary",
          "p-0",
          "shadow-none"
        )}
        data-cy={
          entityType
            ? `${entityType}-close-offcanvas-button`
            : "close-offcanvas-button"
        }
        data-bs-dismiss="offcanvas"
        ref={refClose}
        onClick={toggleView}
      >
        <XLg />
        <span className="visually-hidden">Close side panel</span>
      </button>
      <UncontrolledTooltip target={refClose}>
        Close side panel
      </UncontrolledTooltip>

      {fullPageLink && (
        <>
          <Link
            className={cx("d-flex", "fs-3", "link-secondary")}
            data-cy={
              entityType
                ? `${entityType}-standalone-page-link`
                : "standalone-page-link"
            }
            ref={refExpand}
            to={fullPageLink}
          >
            <ArrowsFullscreen />
            <span className="visually-hidden">Open full page</span>
          </Link>
          <UncontrolledTooltip target={refExpand}>
            Open full page
          </UncontrolledTooltip>
        </>
      )}
    </div>
  );
}
