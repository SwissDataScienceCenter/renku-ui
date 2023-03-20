import { Visibilities } from "../visibility/Visibility";
import { EntityType } from "../../features/kgSearch/KgSearch";
import { EntityCreator } from "../entities/Creators";

export interface Creator {
  name: string;
}

// These are used by the TS compiler does not realize it.
/* eslint-disable no-unused-vars */
export enum ListDisplayType {
  Card,
  Bar,
}
/* eslint-enable no-unused-vars */

export interface ListElementProps {
  creators: EntityCreator[];
  description: string;
  gitUrl?: string;
  id?: string;
  imageUrl?: string;
  itemType: EntityType;
  labelCaption: string;
  mediaContent?: any;
  path?: string;
  slug: string;
  tagList: string[];
  timeCaption: string;
  title: string;
  type?: ListDisplayType;
  url: string;
  visibility: Visibilities,
}

export interface VisibilityIconProps {
  visibility?: Visibilities;
}

export interface EntityIconProps {
  entityType?: EntityType;
}

export interface EntityButtonProps {
  entityType?: EntityType;
  handler?: Function;
}
