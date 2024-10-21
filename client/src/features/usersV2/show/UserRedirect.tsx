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
import { useEffect } from "react";
import { ArrowLeft, BoxArrowInRight } from "react-bootstrap-icons";
import { Link, generatePath, useNavigate } from "react-router-dom-v5-compat";
import { Col, Row } from "reactstrap";

import { useLoginUrl } from "../../../authentication/useLoginUrl.hook";
import { Loader } from "../../../components/Loader";
import ContainerWrap from "../../../components/container/ContainerWrap";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import UserNotFound from "../../projectsV2/notFound/UserNotFound";
// import { useGetUserQuery } from "../../user/dataServicesUser.api";
import { useGetUserQuery } from "../../usersV2/api/users.api";

export default function UserRedirect() {
  const navigate = useNavigate();

  const isUserLoggedIn = useLegacySelector(
    (state) => state.stateModel.user.logged
  );

  const {
    data: user,
    isLoading,
    error,
  } = useGetUserQuery(isUserLoggedIn ? undefined : skipToken);

  useEffect(() => {
    if (user?.isLoggedIn && user.username) {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.users.show, {
          username: user.username,
        }),
        { replace: true }
      );
    }
  }, [navigate]);

  if (!isUserLoggedIn) {
    return <NotLoggedIn />;
  }

  if (isLoading) {
    return <Loader className="align-self-center" />;
  }

  return <UserNotFound error={error} />;
}

function NotLoggedIn() {
  const loginUrl = useLoginUrl();

  return (
    <ContainerWrap fullSize className="container-lg">
      <Row className="mt-3">
        <Col>
          <h1>You must be logged in to view this page.</h1>

          <p>You can only view your own user page if you are logged in.</p>
          <p>
            <a
              className={cx("btn", "btn-primary", "btn-sm")}
              href={loginUrl.href}
            >
              <BoxArrowInRight className={cx("bi", "me-1")} />
              Log in
            </a>
          </p>

          <div>
            <Link
              to={ABSOLUTE_ROUTES.v2.root}
              className={cx("btn", "btn-rk-green")}
            >
              <ArrowLeft className={cx("bi", "me-1")} />
              Return to the home page
            </Link>
          </div>
        </Col>
      </Row>
    </ContainerWrap>
  );
}
