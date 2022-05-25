import { Visibilities } from "../visibility/Visibility";
import { EntityType } from "../../../features/kgSearch/KgSearch";

export interface Creator {
  name: string;
}

// These are used by the TS compiler does not realize it.
/* eslint-disable no-unused-vars */
export enum ListDisplayType {
  Card, // eslint-disable-line
  Bar, // eslint-disable-line
}
/* eslint-enable no-unused-vars */

export interface ListElementProps {
  type?: ListDisplayType;
  url: string;
  title: string;
  description: string;
  tagList: string[];
  timeCaption: string;
  labelCaption: string;
  mediaContent?: any;
  creators: Creator[] | string;
  itemType?: EntityType;
  slug: string;
  visibility?: Visibilities,
  handler?: Function
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
