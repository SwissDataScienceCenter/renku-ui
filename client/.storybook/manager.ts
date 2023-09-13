import { addons } from "@storybook/addons";
import { create } from "@storybook/theming";

const renkuTheme = create({
  base: "light",
  colorSecondary: "#009568",
  brandTitle: "Renku Storybook",
  brandUrl: "/storybook/",
  brandImage: "/static/public/img/logo.svg",
  brandTarget: "_self",
});

addons.setConfig({
  theme: renkuTheme,
});
