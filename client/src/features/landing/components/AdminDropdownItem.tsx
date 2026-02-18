/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { Link } from "react-router";
import { DropdownItem } from "reactstrap";

import DropdownItemTag from "~/components/navbar/DropdownItemTag";
import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";

export default function AdminDropdownItem() {
  const { data: user } = useGetUserQueryState();

  if (!user?.isLoggedIn || !user.is_admin) {
    return null;
  }

  return (
    <>
      <DropdownItem divider />
      <DropdownItemTag tag={Link} to={ABSOLUTE_ROUTES.v2.admin}>
        Admin Panel
      </DropdownItemTag>
    </>
  );
}
