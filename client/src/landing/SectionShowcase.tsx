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

/**
 *  incubator-renku-ui
 *
 *  Landing.present.js
 *  Presentational components.
 */

import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import cx from "classnames";

import type { EntityDescriptionContainerProps } from "../components/entities/Description";
import { RenkuMarkdown } from "../components/markdown/RenkuMarkdown";
import { useProjectMetadataQuery } from "../features/projects/projectsKgApi";
import { Loader } from "../components/Loader";

import type { AnonymousHomeConfig } from "./anonymousHome.types";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import styles from "./sectionShowcase.module.scss";

type ShowcaseCardDisplayProps = {
  description: string;
  identifier: string;
  imageUrl?: string;
  title: string;
};

function defaultedShowcaseCardProps(
  props: Partial<ShowcaseCardDisplayProps>
): ShowcaseCardDisplayProps {
  return {
    description: props.description ?? "Missing description",
    identifier: props.identifier ?? "/",
    imageUrl: props.imageUrl,
    title: props.title ?? "Missing title",
  };
}

type FixedLineHeightContainerProps = EntityDescriptionContainerProps & {
  lineHeightRem?: number;
};

export function FixedLineHeightContainer({
  children,
  className,
  isHeightFixed,
  lineHeightRem,
  numberLines,
}: FixedLineHeightContainerProps) {
  const heightRem = (lineHeightRem ?? 1.5) * numberLines;
  const style: CSSProperties = {
    display: "-webkit-box",
    height: isHeightFixed ? `${heightRem}rem` : undefined,
    lineClamp: isHeightFixed ? numberLines : undefined,
    margin: "12px 0 0 0",
    minHeight: isHeightFixed ? `${heightRem}rem` : undefined,
    overflow: "hidden",
    textOverflow: "ellipsis",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: isHeightFixed ? numberLines : undefined,
  };

  return (
    <div className={cx(className)} style={style}>
      {children}
    </div>
  );
}

function ShowcaseCardDisplay({
  description,
  identifier,
  imageUrl,
  title,
}: ShowcaseCardDisplayProps) {
  const hasImage = imageUrl != null;
  const imageStyles = hasImage
    ? {
        backgroundImage: `url("${imageUrl}")`,
        backgroundPositionX: "center",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
      }
    : {};
  return (
    <div
      data-cy="showcase-card"
      className={cx(
        "col text-decoration-none mb-5 border",
        styles.sectionShowcaseCard
      )}
    >
      <div className="card">
        <div
          style={imageStyles}
          className={cx(
            styles.cardHeaderEntity,
            !hasImage && styles.cardHeaderEntity__missing
          )}
        >
          {!hasImage && (
            <div className="card-bg-title user-select-none">Missing Image</div>
          )}
        </div>
        <div className={styles.cardBody}>
          <FixedLineHeightContainer
            isHeightFixed={true}
            lineHeightRem={1.9}
            numberLines={3}
          >
            <h4 className="lh-sm">{title}</h4>
          </FixedLineHeightContainer>
          <FixedLineHeightContainer isHeightFixed={true} numberLines={5}>
            <RenkuMarkdown markdownText={description} />
          </FixedLineHeightContainer>
          <div className="mt-4 mb-4">
            <Link
              to={`/projects/${identifier}`}
              className="btn btn-sm btn-secondary"
            >
              Open
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

type ShowcaseCardProps = {
  identifier: string;
  overrideDescription?: string;
  overrideImageUrl?: string;
  overrideTitle?: string;
};
function ShowcaseCard({
  identifier,
  overrideDescription,
  overrideImageUrl,
  overrideTitle,
}: ShowcaseCardProps) {
  const { data: projectMetadata, isLoading } = useProjectMetadataQuery({
    projectPath: identifier,
  });
  if (isLoading) return <Loader />;
  const images = projectMetadata?.images;
  const details: Partial<ShowcaseCardDisplayProps> = {
    description: overrideDescription ?? projectMetadata?.description,
    identifier,
    imageUrl: overrideImageUrl ?? images?.at(0)?.location,
    title: overrideTitle ?? projectMetadata?.name,
  };

  return <ShowcaseCardDisplay {...defaultedShowcaseCardProps(details)} />;
}

export default function SectionShowcase({
  enabled,
  title,
  description,
  projects,
}: AnonymousHomeConfig["homeCustomized"]["showcase"]) {
  if (!enabled) return null;

  return (
    <div id="rk-anon-home-section-showcase" data-cy="section-showcase">
      <div
        className={cx("rk-anon-home-section-content", styles.sectionShowcase)}
      >
        <Row className="rk-pt-m">
          <Col md={10}>
            <h3 className="text-rk-green">{title}</h3>
            <RenkuMarkdown markdownText={description} />
          </Col>
        </Row>
        <Swiper
          breakpoints={{
            800: {
              slidesPerView: 2,
            },

            1320: {
              slidesPerView: 3,
            },
          }}
          slidesPerView={1}
          spaceBetween={20}
          navigation={false}
          pagination={{ clickable: true, type: "bullets" }}
          modules={[Pagination]}
          className={cx("mb-4 py-3", styles.sectionShowcaseSwiper)}
        >
          {projects.map((project, i) => (
            <SwiperSlide key={i}>
              <ShowcaseCard {...project} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
