import cx from "classnames";
import { useCallback, useEffect } from "react";
import { Check2, DatabaseLock, XLg } from "react-bootstrap-icons";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import ExternalLink from "~/components/ExternalLink";
import { Loader } from "~/components/Loader";
import { Deposit } from "../api/data-connectors.api";
import { usePatchDepositsByDepositIdMutation } from "../api/data-connectors.enhanced-api";

interface DepositFinalizationModalProps {
  deposit: Deposit;
  isOpen: boolean;
  toggleModal: () => void;
}
export default function DepositFinalizationModal({
  deposit,
  toggleModal,
  isOpen,
}: DepositFinalizationModalProps) {
  const [patchDeposit, result] = usePatchDepositsByDepositIdMutation();

  const finalizeDeposit = useCallback(() => {
    patchDeposit({
      depositId: deposit!.id ?? "",
      depositPatch: {
        status: "complete",
      },
    });
  }, [deposit, patchDeposit]);

  useEffect(() => {
    if (!result.isSuccess || !isOpen) {
      return;
    }
    toggleModal();
  }, [isOpen, result.isSuccess, toggleModal]);

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleModal} centered>
      <ModalHeader tag="h2" toggle={toggleModal}>
        <DatabaseLock className={cx("bi", "me-1")} />
        Finalize deposit
      </ModalHeader>
      <ModalBody>
        <p>
          The job to export data to <strong>{deposit.name}</strong> has been
          completed successfully. A final step on the target platform is usually
          required to make the deposit publicly available.
        </p>
        {deposit.external_url && (
          <p>
            Please follow the link{" "}
            <ExternalLink href={deposit.external_url}>
              {deposit.external_url}
            </ExternalLink>{" "}
            and check for pending actions required to finalize the export.
          </p>
        )}
        <p>
          Once the deposit is finalized on the target platform, you can come
          here and click on the button Finalize deposit. You can use the DOI to
          import it as a Data Connector here on Renku.
        </p>
        {result.error && <RtkOrDataServicesError error={result.error} />}
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          disabled={result.isLoading}
          onClick={finalizeDeposit}
        >
          {result.isLoading ? (
            <>
              <Loader className="me-1" inline size={16} />
              Finalizing deposit...
            </>
          ) : (
            <>
              <Check2 className={cx("bi", "me-1")} />
              Finalize deposit
            </>
          )}
        </Button>
        <Button color="outline-primary" onClick={toggleModal}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
