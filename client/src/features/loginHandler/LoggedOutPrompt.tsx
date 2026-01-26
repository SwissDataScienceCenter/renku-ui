/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, XLg } from "react-bootstrap-icons";
import { Button, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { useLoginUrl } from "~/authentication/useLoginUrl.hook";
import ScrollableModal from "~/components/modal/ScrollableModal";
import { usersApi } from "../usersV2/api/users.api";

export default function LoggedOutPrompt() {
  const { currentData: user, error } =
    usersApi.endpoints.getUser.useQueryState(undefined);

  const [{ isLoggedIn, shouldBeLoggedIn }, setState] = useState<State>({
    isLoggedIn: false,
    shouldBeLoggedIn: false,
  });

  const loginUrl = useLoginUrl();

  useEffect(() => {
    if (error != null) {
      setState((prevState) => ({ ...prevState, isLoggedIn: false }));
    } else if (user != null) {
      setState((prevState) => ({ ...prevState, isLoggedIn: user.isLoggedIn }));
    }
  }, [error, user]);

  useEffect(() => {
    if (window.cookieStore == null) {
      return;
    }
    let ignore: boolean = false;
    window.cookieStore.get("renku_user_signed_in").then((cookie) => {
      if (!ignore && cookie?.value === "1") {
        setState((prevState) => ({ ...prevState, shouldBeLoggedIn: true }));
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (window.cookieStore == null) {
      return;
    }
    let ignore: boolean = false;
    function cookieListener() {
      window.cookieStore.get("renku_user_signed_in").then((cookie) => {
        if (!ignore) {
          setState((prevState) => ({
            ...prevState,
            shouldBeLoggedIn: cookie?.value === "1",
          }));
        }
      });
    }
    window.cookieStore.addEventListener("change", cookieListener);
    return () => {
      ignore = true;
      window.cookieStore.removeEventListener("change", cookieListener);
    };
  }, []);

  const onClickStayLoggedOut = useCallback(() => {
    if (window.cookieStore == null) {
      return;
    }
    window.cookieStore.delete("renku_user_signed_in");
  }, []);

  const isOpen = !isLoggedIn && shouldBeLoggedIn;

  return (
    <ScrollableModal
      backdrop="static"
      centered
      fullscreen="md"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">You are logged out!</ModalHeader>
      <ModalBody>
        It looks like you should log back into Renku before continuing.
      </ModalBody>
      <ModalFooter>
        <Button color="outline-secondary" onClick={onClickStayLoggedOut}>
          <XLg className={cx("bi", "me-1")} />
          Stay logged out
        </Button>
        <a
          className={cx(
            "btn",
            "btn-primary" /*"btn-outline-light", "text-decoration-none"*/
          )}
          data-cy="login-button"
          href={loginUrl.href}
        >
          Login
          <ArrowRight className={cx("bi", "ms-1")} />
        </a>
      </ModalFooter>

      {/* <ModalHeader tag="h2" toggle={toggle}>
          Update intergation
        </ModalHeader>
        <ModalBody>
          {result.error && <RtkOrNotebooksError error={result.error} />}

          <div className="mb-3">
            <Label className="form-label" for="addConnectedServiceId">
              Id
            </Label>
            <Input
              className={cx("form-control")}
              disabled={true}
              id="addConnectedServiceId"
              placeholder="Provider id"
              type="text"
              value={provider.id}
            />
          </div>

          <ConnectedServiceFormContent control={control} />
        </ModalBody>
        <ModalFooter>
          <Button color="outline-primary" onClick={toggle}>
            <XLg className={cx("bi", "me-1")} />
            Cancel
          </Button>
          <Button
            color="primary"
            disabled={result.isLoading || !isDirty}
            type="submit"
          >
            {result.isLoading ? (
              <Loader className="me-1" inline size={16} />
            ) : (
              <CheckLg className={cx("bi", "me-1")} />
            )}
            Update integration
          </Button>
        </ModalFooter> */}
    </ScrollableModal>
  );
}

interface State {
  isLoggedIn: boolean;
  shouldBeLoggedIn: boolean;
}
