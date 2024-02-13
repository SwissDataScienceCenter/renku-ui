import type { Role, Visibility } from "./api/projectV2.api";

export type ProjectVisibility = Visibility;
export type ProjectRole = Role;

export interface Project {
  access: {
    members: ProjectMember[];
    visibility: ProjectVisibility;
  };
  content: {
    repositories: Repository[];
  };
  metadata: {
    name: string;
    slug: string;
    description: string;
  };
}

export interface ProjectMember {
  providerId?: string;
  email: string;
  role: ProjectRole;
}

export interface Repository {
  url: string;
}
