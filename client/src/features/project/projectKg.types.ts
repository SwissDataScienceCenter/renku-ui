import { ProjectKgParams } from "./Project";

export interface JsonLdValue<T> {
  "@value": T;
}

export interface JsonLdDate {
  "@type": string;
  "@value": string;
}

export interface KgJsonLdResponse {
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
}

export type ProjectKgContent = "ld+json" | "json";

export interface ProjectKgWithIdParams extends ProjectKgParams {
  projectId?: number;
}

export interface ErrorDataMessage {
  data: {
    message: string;
  };
}
