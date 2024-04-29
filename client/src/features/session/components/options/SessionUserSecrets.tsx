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
    <div className="field-group" data-cy="secrets-session">
      <div className="form-label">User Secrets</div>
      {content}
    </div>
  );
}

function SessionUserSecretsSection() {
  // Handle the collapse
  const [isOpen, setIsOpen] = useState(true);
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
  if (secrets.data?.length === 0) return null;

  return (
    <Card className={cx("border", "border-dark-subtle")}>
      <CardBody className={cx("px-0", "py-1")}>
        <Button
          className={cx(
            "d-flex",
            "w-100",
            "px-3",
            "py-2",
            "bg-transparent",
            "border-0"
          )}
          color="none"
          onClick={toggleIsOpen}
          size="sm"
        >
          <span>
            Secrets to mount:{" "}
            {sessionOptions.secretsList.length > 0 ? (
              <span className="fw-bold">
                {[...sessionOptions.secretsList]
                  .map((s) => s.name)
                  .sort((a, b) => {
                    return a.localeCompare(b); // localCompare is used to ignore case
                  })
                  .join(", ")}
              </span>
            ) : (
              <span className="fw-bold">None</span>
            )}
          </span>
          <div className="ms-auto">
            <ChevronFlippedIcon flipped={isOpen} />
          </div>
        </Button>
      </CardBody>
      <Collapse isOpen={isOpen}>
        <CardBody
          className={cx("border-top", "border-dark-subtle", "small", "py-2")}
        >
          <div
            className="form-rk-green my-1"
            data-cy="secrets-session-selection"
          >
            <div className="mb-2">
              <Label className="form-label" for="secrets-session-path">
                Mount path
              </Label>
              <Input
                className="border-dark-subtle"
                id="secrets-session-path"
                name="secrets-session-path"
                placeholder="/path/to/secrets"
                value={sessionOptions.secretsPath}
                onChange={(e) => changeSecretsPath(e.target.value)}
              />
            </div>
            <div>
              <Label className="form-label">Secrets</Label>
              <div>
                {secrets.data &&
                  [...secrets.data]
                    .sort((a, b) => {
                      return a.name.localeCompare(b.name);
                    })
                    .map((secret) => (
                      <div
                        className={cx("form-check", "form-switch", "d-flex")}
                        key={secret.id}
                      >
                        <Input
                          checked={sessionOptions.secretsList
                            .map((s) => s.name)
                            .includes(secret.name)}
                          className={cx(
                            "form-check-input",
                            "rounded-pill",
                            "my-auto",
                            "me-2"
                          )}
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

              {/* <div className="d-flex gap-2 flex-wrap">
                {secrets.data?.map((secret) => (
                  <Badge
                    className="cursor-pointer rounded-pill fs-6 fw-normal text-primary border border-dark-subtle "
                    color="none"
                    key={secret.id}
                  >
                    {secret.name}
                  </Badge>
                  // <Button
                  //   className="btn-outline-rk-green"
                  //   key={secret.id}
                  //   size="sm"
                  //   onClick={() => {}}
                  // >
                  //   {secret.name}
                  // </Button>
                ))}
              </div> */}
            </div>
          </div>
        </CardBody>
      </Collapse>
    </Card>
  );
}
