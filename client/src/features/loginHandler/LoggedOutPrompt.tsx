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
import { useCallback, useEffect } from "react";
import { ArrowRight, XLg } from "react-bootstrap-icons";
import { Button, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { useLoginUrl } from "~/authentication/useLoginUrl.hook";
import ScrollableModal from "~/components/modal/ScrollableModal";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import useAppSelector from "~/utils/customHooks/useAppSelector.hook";
import { usersApi } from "../usersV2/api/users.api";
import { setIsLoggedIn, setShouldBeLoggedIn } from "./loginState.slice";

export default function LoggedOutPrompt() {
  const loginUrl = useLoginUrl();

  const { isLoggedIn, shouldBeLoggedIn, onClickStayLoggedOut } =
    useLoggedOutPromptState();

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
          className={cx("btn", "btn-primary")}
          data-cy="login-button"
          href={loginUrl.href}
        >
          Login
          <ArrowRight className={cx("bi", "ms-1")} />
        </a>
      </ModalFooter>
    </ScrollableModal>
  );
}

function useLoggedOutPromptState() {
  const dispatch = useAppDispatch();
  const { isLoggedIn, shouldBeLoggedIn } = useAppSelector(
    ({ loginState }) => loginState
  );

  const { currentData: user, error } =
    usersApi.endpoints.getUser.useQueryState(undefined);

  useEffect(() => {
    if (error != null) {
      dispatch(setIsLoggedIn(false));
    } else if (user != null) {
      dispatch(setIsLoggedIn(user.isLoggedIn));
    }
  }, [dispatch, error, user]);

  useEffect(() => {
    if (window.cookieStore == null) {
      return;
    }
    let ignore: boolean = false;
    window.cookieStore.get("renku_user_signed_in").then((cookie) => {
      if (!ignore && cookie?.value === "1") {
        dispatch(setShouldBeLoggedIn(true));
      }
    });
    return () => {
      ignore = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (window.cookieStore == null) {
      return;
    }
    let ignore: boolean = false;
    function cookieListener() {
      window.cookieStore.get("renku_user_signed_in").then((cookie) => {
        if (!ignore) {
          dispatch(setShouldBeLoggedIn(cookie?.value === "1"));
        }
      });
    }
    window.cookieStore.addEventListener("change", cookieListener);
    return () => {
      ignore = true;
      window.cookieStore.removeEventListener("change", cookieListener);
    };
  }, [dispatch]);

  const onClickStayLoggedOut = useCallback(() => {
    if (window.cookieStore == null) {
      return;
    }
    window.cookieStore.delete("renku_user_signed_in");
  }, []);

  return {
    isLoggedIn,
    shouldBeLoggedIn,
    onClickStayLoggedOut,
  };
}
