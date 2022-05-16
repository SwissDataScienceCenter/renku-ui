import * as React from "react";
import { Story } from "@storybook/react";
import { Visibilities } from "../visibility/Visibility";
import { EntityType, ListElementProps, ListDisplayType } from "./List.d";
import List from "./List";
const MemoryRouter = require("react-router-dom").MemoryRouter;

export default {
  title: "components/ListBar",
  component: List,
  argTypes: {},
};

const Template: Story<ListElementProps> = (args) => <MemoryRouter><List {...args} /></MemoryRouter>;
export const Default = Template.bind({});
Default.args = {
  type: ListDisplayType.Bar,
  title: "Temperature Chain 2",
  description: "Water temperature data from the temperature chain at the LéXPLORE floating platform.",
  itemType: EntityType.Project,
  url: "url-to-project",
  tagList: ["Water", "temperature", "LéXPLORE", "customTag"],
  timeCaption: "2022-01-01",
  labelCaption: "Created",
  creators: [{ name: "E2E User" }],
  slug: "e2e-user/my-project",
  visibility: Visibilities.Internal
};

export const ProjectWithImage = Template.bind({});
ProjectWithImage.args = {
  type: ListDisplayType.Bar,
  title: "Temperature Chain 2",
  description: "Water temperature data from the temperature chain at the LéXPLORE floating platform.",
  itemType: EntityType.Project,
  url: "url-to-project",
  tagList: ["Water", "temperature", "LéXPLORE", "customTag"],
  timeCaption: "2022-01-01",
  labelCaption: "Created",
  creators: [{ name: "E2E User" }],
  slug: "e2e-user/my-project",
  visibility: Visibilities.Private,
  mediaContent: "https://renkulab.io/gitlab/uploads/-/system/project/avatar/12754/Thetis-300x225.jpg"
};

const description = "Flight data from the US Department of Transportation, Bureau of Transportation Statistics. " +
    "Downloaded on 2019-07-04. https://www.transtats.bts.gov Data are here for use in software tutorials.";

export const Dataset = Template.bind({});
Dataset.args = {
  type: ListDisplayType.Bar,
  title: "2019-01 US Flights",
  description: description,
  itemType: EntityType.Dataset,
  url: "url-to-project",
  tagList: ["Computer and Information Science", "flight data", "software tutorial data"],
  timeCaption: "2022-01-01",
  labelCaption: "Created",
  creators: [{ name: "E2E User" }],
  visibility: Visibilities.Public
};

export const DatasetWithImage = Template.bind({});
DatasetWithImage.args = {
  type: ListDisplayType.Bar,
  title: "2019-01 US Flights",
  description: description,
  itemType: EntityType.Dataset,
  url: "url-to-dataset",
  tagList: ["Computer and Information Science", "flight data", "software tutorial data"],
  timeCaption: "2022-01-01",
  labelCaption: "Updated",
  creators: [{ name: "E2E User" }],
  visibility: Visibilities.Public,
  mediaContent: "https://renkulab.io/gitlab/uploads/-/system/project/avatar/12754/Thetis-300x225.jpg"
};
