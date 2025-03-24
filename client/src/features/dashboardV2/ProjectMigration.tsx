import cx from "classnames";
import { useCallback, useState } from "react";
import { Airplane } from "react-bootstrap-icons";
import { Button } from "reactstrap";
import style from "./DashboardV2.module.scss";
import { MigrationModal } from "../project/components/projectMigration/ProjectEntityMigration.tsx";

export function ProjectEntityMigration() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const toggle = useCallback(() => {
    setIsOpenModal((open) => !open);
  }, []);

  return (
    <>
      <div
        className={cx(
          "d-flex",
          "flex-row",
          "justify-content-between",
          style.DashboardCard,
          "p-3",
          "rounded-3"
        )}
      >
        <p className={cx("fw-bold", "text-primary", "mb-0")}>
          Looking for your Renku Legacy projects?
        </p>
        <Button size="sm" color="primary" onClick={toggle}>
          <Airplane /> Migrate from Renku Legacy
        </Button>
      </div>
      <MigrationModal isOpen={isOpenModal} toggle={toggle} />
    </>
  );
}
