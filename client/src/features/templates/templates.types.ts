export interface RepositoriesParams {
  ref: string;
  url: string;
  name: string;
}
export interface GetTemplatesParams {
  repositories: RepositoriesParams[];
}
