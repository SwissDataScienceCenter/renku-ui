import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowClockwise, XLg } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { InfoAlert } from "~/components/Alert";
import ExternalLink from "~/components/ExternalLink";
import { Loader } from "~/components/Loader";
import { TimeCaption } from "~/components/TimeCaption";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import { DataConnectorRead } from "../api/data-connectors.api";
import {
  dataConnectorsApi,
  useGetDataConnectorsByDataConnectorIdQuery,
} from "../api/data-connectors.enhanced-api";
import { parseDoi } from "./dataConnector.utils";

interface DataConnectorRefreshExpiredModalProps {
  dataConnector: DataConnectorRead | null;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  toggleModal: () => void;
}
export default function DataConnectorRefreshExpiredModal({
  dataConnector,
  toggleModal,
  setOpen,
  isOpen,
}: DataConnectorRefreshExpiredModalProps) {
  const doiReference = useMemo(() => {
    if (!dataConnector) return null;
    const doi =
      dataConnector.storage.configuration["doi"] &&
      typeof dataConnector.storage.configuration["doi"] === "string"
        ? parseDoi(dataConnector.storage.configuration["doi"])
        : null;
    if (doi) {
      return doi;
    }
    if (dataConnector.doi) {
      return parseDoi(dataConnector.doi);
    }
    return null;
  }, [dataConnector]);
  const fullLink = `https://doi.org/${doiReference}`;

  const {
    data: refreshedDataConnector,
    isFetching,
    fulfilledTimeStamp,
  } = useGetDataConnectorsByDataConnectorIdQuery(
    dataConnector ? { dataConnectorId: dataConnector.id } : skipToken,
  );

  const [hasRequestedRefresh, setHasRequestedRefresh] = useState(false);

  const dispatch = useAppDispatch();
  const onRefresh = useCallback(() => {
    if (!dataConnector) return;

    setHasRequestedRefresh(true);
    dispatch(
      dataConnectorsApi.util.invalidateTags([
        { id: dataConnector.id, type: "DataConnectors" },
      ]),
    );
  }, [dataConnector, dispatch]);

  useEffect(() => {
    if (!hasRequestedRefresh || isFetching || !refreshedDataConnector) return;

    const stillExpired = refreshedDataConnector.expires_at
      ? new Date(refreshedDataConnector.expires_at) < new Date()
      : false;
    if (!stillExpired) {
      setOpen(false);
    }
  }, [hasRequestedRefresh, isFetching, refreshedDataConnector, setOpen]);

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader tag="h2" toggle={toggleModal}>
        <ArrowClockwise className={cx("bi", "me-1")} />
        Refresh expired data connector
      </ModalHeader>
      <ModalBody>
        {isFetching ? (
          <Loader />
        ) : (
          <>
            <p>
              The data connector <strong>{dataConnector?.name}</strong> has
              expired and needs to be refreshed.
            </p>
            <p>
              Please click on the Refresh button after following the instruction
              at this link:
              <br />
              <ExternalLink href={fullLink}>{fullLink}</ExternalLink>
            </p>
            <InfoAlert timeout={0}>
              <p className="mb-2">
                You might need permission on the{" "}
                {dataConnector?.publisher_url ? (
                  <ExternalLink href={dataConnector?.publisher_url}>
                    target platform
                  </ExternalLink>
                ) : (
                  <span>target platform</span>
                )}
                .
              </p>
              <p className="mb-0">
                After completing all the steps, it might take a while for the
                content to be available.
              </p>
            </InfoAlert>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        {hasRequestedRefresh && fulfilledTimeStamp && (
          <TimeCaption
            key={fulfilledTimeStamp}
            className={cx("text-muted")}
            datetime={new Date(fulfilledTimeStamp)}
            enableTooltip
            noCaption
            prefix="Last refreshed"
          />
        )}
        <Button color="primary" disabled={isFetching} onClick={onRefresh}>
          <ArrowClockwise className={cx("bi", "me-1")} />
          Refresh
        </Button>
        <Button color="outline-primary" onClick={toggleModal}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
