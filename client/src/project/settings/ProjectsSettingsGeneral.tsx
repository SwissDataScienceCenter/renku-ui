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

import React, { useEffect } from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import { StateModelProject } from "../../features/project/Project";
import { ACCESS_LEVELS } from "../../api-client";
import LoginAlert from "../../components/loginAlert/LoginAlert";
import { InfoAlert } from "../../components/Alert";
import { Col, Row } from "reactstrap";

// interface ProjectSettingsGeneralProps {
//   [key: string]: unknown;
// }

export const ProjectSettingsGeneral = () => {
  // useEffect(() => {
  //   console.log({ props });
  // }, [props]);

  const logged = useSelector<RootStateOrAny, boolean>(
    (state) => state.stateModel.user.logged
  );

  const {
    // externalUrl: projectRepositoryUrl,
    // namespace,
    // path,
    accessLevel,
    ...rest
  } = useSelector<RootStateOrAny, StateModelProject["metadata"]>(
    (state) => state.stateModel.project.metadata
  );
  console.log({ rest });

  const settingsReadOnly = accessLevel < ACCESS_LEVELS.MAINTAINER;

  if (!logged) {
    const textIntro = "Only authenticated users can access project setting.";
    const textPost = "to visualize project settings.";
    return (
      <LoginAlert logged={false} textIntro={textIntro} textPost={textPost} />
    );
  }

  if (settingsReadOnly) {
    return (
      <InfoAlert dismissible={false} timeout={0}>
        <p className="mb-0">
          Project settings can be changed only by maintainers.
        </p>
      </InfoAlert>
    );
  }

  return (
    <div className="form-rk-green">
      <Row className="mt-2">
        <Col xs={12}>
          {/* <ProjectTags
            tagList={props.metadata.tagList}
            onProjectTagsChange={props.onProjectTagsChange}
            settingsReadOnly={props.settingsReadOnly}
          />
          <ProjectDescription {...props} /> */}
          <div>ProjectTags</div>
          <div>ProjectDescription</div>
          <ProjectDescription />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <div>ProjectAvatarEdit</div>
          {/* <ProjectAvatarEdit
            externalUrl={props.externalUrl}
            avatarUrl={props.metadata.avatarUrl}
            onAvatarChange={props.onAvatarChange}
            settingsReadOnly={props.settingsReadOnly}
          /> */}
        </Col>
      </Row>
    </div>
  );
};

const ProjectDescription = () => {
  // const

  return null;
};
