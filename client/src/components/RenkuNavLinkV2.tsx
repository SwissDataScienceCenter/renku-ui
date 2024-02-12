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

import { RefAttributes } from "react";
import {
  NavLink as RRNavLink,
  NavLinkProps as RRNavLinkProps,
} from "react-router-dom-v5-compat";
import { NavLink } from "reactstrap";

type RenkuNavLinkV2Props = RRNavLinkProps & RefAttributes<HTMLAnchorElement>;

/** Updated RenkuNavLink which works with react-router@v6 */
export default function RenkuNavLinkV2(props: RenkuNavLinkV2Props) {
  return (
    <NavLink
      tag={RRNavLink}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    />
  );
}
