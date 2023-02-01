import { Visibilities } from "../visibility/Visibility";
import { EntityType } from "../../../features/kgSearch/KgSearch";
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
  id: string;
  creators: EntityCreator[];
  description: string;
  itemType: EntityType;
  labelCaption: string;
  mediaContent?: any;
  slug: string;
  tagList: string[];
  timeCaption: string;
  title: string;
  type?: ListDisplayType;
  url: string;
  visibility: Visibilities,
  imageUrl?: string;
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
