import { Meta, StoryObj } from "@storybook/react";
// import { ARG_REDUX_PATH, PARAM_REDUX_MERGE_STATE } from "addon-redux";

import { EntityType } from "../../features/kgSearch";
import { Visibilities } from "../visibility/Visibility";
import { ListDisplayType } from "./list.types";
import ListCard from "./ListCard";

const meta: Meta = {
  title: "components/ListCard",
  component: ListCard,
  argTypes: {
    notebooks: {
      control: { type: "text" },
      // [ARG_REDUX_PATH]: "stateModel.notebooks.notebooks.all",
      table: {
        disable: true,
      },
    },
    updatingTagList: {
      control: { type: "boolean" },
      // [ARG_REDUX_PATH]: "stateModel.project.metadata.tagList.updating",
      table: {
        disable: true,
      },
    },
    type: {
      table: {
        disable: true,
      },
    },
    itemType: {
      control: "radio",
      options: [EntityType.Project, EntityType.Dataset],
    },
    visibility: {
      control: "radio",
      options: [
        Visibilities.Public,
        Visibilities.Internal,
        Visibilities.Private,
      ],
    },
    timeCaption: { control: "date" },
  },
  parameters: {
    // [PARAM_REDUX_MERGE_STATE]: { stateModel: { user: { logged: false } } },
  },
};
export default meta;

type Story = StoryObj<typeof ListCard>;
const args = {
  type: ListDisplayType.Card,
  title: "Temperature Chain 2",
  description:
    "Water temperature data from the temperature chain at the LéXPLORE floating platform.",
  itemType: EntityType.Project,
  url: "url-to-project",
  tagList: ["Water", "temperature", "LéXPLORE", "customTag"],
  timeCaption: "2022-01-01",
  labelCaption: "Created",
  creators: [{ name: "E2E User" }],
  slug: "e2e-user/my-project",
  visibility: Visibilities.Internal,
  notebooks: "",
  updatingTagList: false,
};

export const ListCardProject: Story = {
  args,
};

export const ListCardProjectWithImage: Story = {
  args: {
    ...args,
    imageUrl: "../stockimages/Zurich.jpg",
  },
};

export const ListCardDataset: Story = {
  args: {
    ...args,
    itemType: EntityType.Dataset,
  },
};

export const ListCardDatasetWithImage: Story = {
  args: {
    ...args,
    itemType: EntityType.Dataset,
    imageUrl: "../stockimages/Zurich.jpg",
  },
};
