import {
  NamespaceKind as NamespaceKindOrig,
  NamespaceResponse as NamespaceResponseOrig,
} from "./namespace.api.ts";

export type NamespaceKind = NamespaceKindOrig | "project";
export interface NamespaceResponse
  extends Omit<NamespaceResponseOrig, "namespace_kind"> {
  namespace_kind: NamespaceKind;
}
export type NamespaceResponseList = NamespaceResponse[];
export type GetNamespacesApiResponse = NamespaceResponseList;
