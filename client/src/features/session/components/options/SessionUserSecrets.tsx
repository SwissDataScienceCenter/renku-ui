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

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, Collapse, Input, Label } from "reactstrap";

import { Loader } from "../../../../components/Loader";
import { User } from "../../../../model/renkuModels.types";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { Url } from "../../../../utils/helpers/url";
import ChevronFlippedIcon from "../../../../components/icons/ChevronFlippedIcon";
import { useGetSecretsQuery } from "../../../secrets/secrets.api";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { setSecretsList, setSecretsPath } from "../../startSessionOptionsSlice";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import { SessionSecrets } from "../../startSessionOptions.types";

export default function SessionUserSecrets() {
  const secretsUrl = Url.get(Url.pages.secrets);
  const user = useLegacySelector<User>((state) => state.stateModel.user);

  if (!user.fetched) return <Loader />;

  const content = user.logged ? (
    <>
      <div className={cx("form-text", "my-1")}>
        You can select secrets defined in the{" "}
        <Link to={secretsUrl}> User Secrets page</Link> and mount them as files
        in your session.
      </div>
      <SessionUserSecretsSection />
    </>
  ) : (
    <div className={cx("form-text", "my-1")}>
      This feature is only available to logged users.
    </div>
  );

  return (
    <div className="field-group" data-cy="session-secrets">
      <div className="form-label">User Secrets</div>
      {content}
    </div>
  );
}

function SessionUserSecretsSection() {
  // Handle the collapse
  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = useCallback(() => setIsOpen((isOpen) => !isOpen), []);

  // Fetch the secrets
  const secrets = useGetSecretsQuery();

  // Get current values from the store
  const sessionOptions = useAppSelector((state) => state.startSessionOptions);

  // Save data in the Redux store
  const dispatch = useAppDispatch();
  const changeSecretsPath = useCallback(
    (newValue: string) => {
      dispatch(setSecretsPath(newValue));
    },
    [dispatch]
  );
  const updateSecretsList = useCallback(
    (secret: SessionSecrets) => {
      if (sessionOptions.secretsList.map((s) => s.name).includes(secret.name)) {
        dispatch(
          setSecretsList(
            sessionOptions.secretsList.filter((s) => s.name !== secret.name)
          )
        );
      } else {
        dispatch(setSecretsList([...sessionOptions.secretsList, secret]));
      }
    },
    [dispatch, sessionOptions.secretsList]
  );

  // Set the default path on first load
  useEffect(() => {
    changeSecretsPath("/secrets");
  }, [changeSecretsPath]);

  // Do not show any code to select secrets unless we have some
  if (secrets.isLoading) return <Loader />;
  if (secrets.isError)
    return <RtkOrNotebooksError dismissible={false} error={secrets.error} />;
  if (secrets.data?.length === 0)
    return (
      <div className={cx("form-text", "my-1")}>No secrets defined yet.</div>
    );

  return (
    <Card className={cx("border", "border-rk-border-input")}>
      <CardBody className="p-0">
        <Button
          className={cx(
            "bg-transparent",
            "border-0",
            "d-flex",
            "px-3",
            "py-2",
            "w-100"
          )}
          data-cy="session-secrets-toggle"
          color="none"
          onClick={toggleIsOpen}
        >
          <MountedSecrets secretsList={sessionOptions.secretsList} />
          <div className="ms-auto">
            <ChevronFlippedIcon flipped={isOpen} />
          </div>
        </Button>
      </CardBody>
      <Collapse isOpen={isOpen}>
        <CardBody
          className={cx(
            "border-rk-border-input",
            "border-top",
            "py-2",
            "small"
          )}
        >
          <div
            className="form-rk-green my-1"
            data-cy="session-secrets-selection"
          >
            <div className="mb-2">
              <Label className="form-label" for="secrets-session-path">
                Mount path
              </Label>
              <Input
                data-cy="session-secrets-mount-path"
                id="secrets-session-path"
                name="secrets-session-path"
                onChange={(e) => changeSecretsPath(e.target.value)}
                placeholder="/path/to/secrets"
                value={sessionOptions.secretsPath}
              />
            </div>
            <div>
              <Label className="form-label">Secrets</Label>
              <SecretsCheckboxList
                secrets={secrets.data}
                selectedSecrets={sessionOptions.secretsList}
                updateSecretsList={updateSecretsList}
              />
            </div>
          </div>
        </CardBody>
      </Collapse>
    </Card>
  );
}

interface SecretsCheckboxListProps {
  secrets?: SessionSecrets[];
  selectedSecrets?: SessionSecrets[];
  updateSecretsList: (secret: SessionSecrets) => void;
}
function SecretsCheckboxList({
  secrets,
  selectedSecrets,
  updateSecretsList,
}: SecretsCheckboxListProps) {
  if (!secrets || !secrets.length) return null;
  const sortedSecrets = [...secrets].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  const selectedSecretsNames =
    selectedSecrets && selectedSecrets.length
      ? selectedSecrets.map((s) => s.name)
      : [];
  return (
    <div data-cy="session-secrets-checkbox-list">
      {sortedSecrets.map((secret) => (
        <div
          className={cx("d-flex", "form-check", "form-switch")}
          key={secret.id}
        >
          <Input
            checked={selectedSecretsNames.includes(secret.name)}
            className={cx(
              "form-check-input",
              "me-2",
              "my-auto",
              "rounded-pill"
            )}
            data-cy="session-secrets-checkbox"
            name={`secrets-session-${secret.name}`}
            onChange={() => updateSecretsList(secret)}
            role="switch"
            type="checkbox"
          />
          <Label
            className={cx("form-check-label", "my-auto")}
            for={`secrets-session-${secret.name}`}
          >
            {secret.name}
          </Label>
        </div>
      ))}
    </div>
  );
}

interface MountedSecretsProps {
  secretsList: SessionSecrets[];
}
function MountedSecrets({ secretsList }: MountedSecretsProps) {
  const content = !secretsList.length
    ? "None"
    : [...secretsList]
        .map((s) => s.name)
        .sort((a, b) => {
          return a.localeCompare(b); // localCompare is used to ignore case
        })
        .join(", ");
  return <span className="fw-bold">{content}</span>;
}
