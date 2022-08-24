/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import React, { CSSProperties, useContext, useRef } from "react";
import { Globe, People, Lock } from "../../ts-wrappers";

import AppContext from "../../context/appContext";
import { ThrottledTooltip } from "../Tooltip";

/**
 *  renku-ui
 *
 *  Entity Visibility Icon.tsx
 *  Entity Visibility Icon component
 */

export interface VisibilityIconProps {
  visibility: "public" | "internal" | "private";
  className?: string;
}
const VisibilityIcon = ({ visibility, className }: VisibilityIconProps) => {
  const ref = useRef(null);
  // @ts-ignore
  const { client } = useContext(AppContext);
  if (!visibility) return null;
  const icon = {
    public: <Globe />,
    private: <Lock />,
    internal: <People />
  };
  const baseUrl = client.baseUrl;
  const { hostname } = baseUrl ? new URL(baseUrl) : { hostname: "renkulab.io" };

  const tooltip = {
    public: "Public: Anyone can access your project.",
    private: "Private: Only members explicitly added to this project can access it.",
    internal: `Internal: Anyone signed-in to ${hostname} can access your project.` //pending for other deployments
  };

  const style: CSSProperties = {
    position: "relative",
    top: "-3px",
  };

  return <>
    <span ref={ref} className={`card-visibility-icon ${className}`} style={style}>
      { icon[visibility] || "" }
    </span>
    <ThrottledTooltip
      target={ref}
      tooltip={tooltip[visibility]} />
  </>;
};

export default VisibilityIcon;
