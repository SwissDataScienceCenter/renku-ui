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
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type JsonLdValue<T> = {
  "@value": T;
};

type JsonLdDate = {
  "@type": string;
  "@value": string;
};

type KgJsonLdResponse = {
  "@id": string;
  "@type": string[];
  "https://swissdatasciencecenter.github.io/renku-ontology#projectPath": JsonLdValue<string>;
  "http://schema.org/description": JsonLdValue<string>;
  "http://schema.org/dateModified": JsonLdDate;
  "http://schema.org/identifier": JsonLdValue<number>;
  "http://schema.org/creator": {
    "@id": string;
    "@type": string[];
    "http://schema.org/email": JsonLdValue<string>;
    "http://schema.org/name": JsonLdValue<string>;
  };
  "http://schema.org/schemaVersion": JsonLdValue<string>;
  "https://swissdatasciencecenter.github.io/renku-ontology#projectVisibility": JsonLdValue<string>;
  "http://schema.org/name": JsonLdValue<string>;
  "http://schema.org/image": string[];
  "http://schema.org/keywords": string[];
};

type KgMetadataLink = {
  rel: string;
  href: string;
};

type KgDateString = string; // ISO 8601 UTC date string, e.g., "2021-03-10T14:38:20.368Z"

type KgMetadataResponse = {
  version: string;
  description: string;
  _links: KgMetadataLink[];
  identifier: number;
  path: string;
  name: string;
  visibility: "public" | "internal" | "private";
  created: {
    creator: {
      email: string;
      name: string;
    };
    dateCreated: KgDateString;
  };
  updatedAt: KgDateString;
  urls: {
    readme: string;
    ssh: string;
    http: string;
    web: string;
  };
  forking: {
    forksCount: number;
  };
  keywords: string[];
  starsCount: number;
  permissions: {
    projectAccess: {
      level: {
        name: string;
        value: number;
      };
    };
  };
  images: string[];
  statistics: {
    commitsCount: number;
    storageSize: number;
    repositorySize: number;
    lfsObjectsSize: number;
    jobArtifactsSize: number;
  };
};

type ProjectKgContent = "ld+json" | "json";

type ProjectKgParams = {
  projectPath?: string;
};

function kgProjectRequestHeaders(content: ProjectKgContent) {
  return {
    Accept: `application/${content}`,
  };
}

export const projectsKgApi = createApi({
  reducerPath: "projectKgApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/ui-server/api/kg" }),
  endpoints: (builder) => ({
    projectJsonLd: builder.query<KgJsonLdResponse, ProjectKgParams>({
      query: (params) => ({
        url: `projects/${params.projectPath}`,
        headers: kgProjectRequestHeaders("ld+json"),
      }),
    }),
    projectMetadata: builder.query<KgMetadataResponse, ProjectKgParams>({
      query: (params) => ({
        url: `projects/${params.projectPath}`,
        headers: kgProjectRequestHeaders("json"),
      }),
    }),
  }),
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const { useProjectJsonLdQuery, useProjectMetadataQuery } = projectsKgApi;
export type { ProjectKgContent };
