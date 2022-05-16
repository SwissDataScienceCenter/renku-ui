import { Visibilities } from "../visibility/Visibility";

export enum EntityType {
  Project = "project",
  Dataset = "dataset",
}

interface Creator {
  name: string;
}

export enum ListDisplayType {
  Card,
  Bar,
}

export interface ListElementProps {
  type?: ListDisplayType;
  url: string;
  title: string;
  description: string;
  tagList: string[];
  timeCaption: string;
  labelCaption: string;
  mediaContent?: any;
  creators: Creator[];
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
