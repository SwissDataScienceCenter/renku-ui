import { Meta } from "@storybook/react";

import { CommandCopy } from "../../components/commandCopy/CommandCopy.tsx";

import styles from "./ColorPalette.module.scss";

interface Color {
  name: string;
  hex: string;
}

interface ColorPaletteProps {
  colors: Color[];
}

const ColorPalette = ({ colors }: ColorPaletteProps) => (
  <div className={styles.colorPalette}>
    {colors.map((color) => (
      <div key={color.name} className={styles.colorItem}>
        <div className={styles.colorInfo}>
          <span className={styles.colorName}>{color.name}</span>
          <CommandCopy command={color.hex} />
        </div>
        <div
          className={styles.colorItem}
          style={{ backgroundColor: color.hex }}
        ></div>
      </div>
    ))}
  </div>
);

export default {
  title: "Bootstrap/GENERIC - Color Palette",
  component: ColorPalette,
  parameters: {
    docs: {
      description: {
        component: "Current bootstrap colors",
      },
    },
  },
} as Meta;

interface Color {
  name: string;
  hex: string;
}

const getComputedStyleValue = (property: string) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(property)
    .trim();
};

const colors: Color[] = [
  { name: "Primary", hex: getComputedStyleValue("--bs-primary") },
  { name: "Secondary", hex: getComputedStyleValue("--bs-secondary") },
  { name: "Success", hex: getComputedStyleValue("--bs-success") },
  { name: "Danger", hex: getComputedStyleValue("--bs-danger") },
  { name: "Warning", hex: getComputedStyleValue("--bs-warning") },
  { name: "Info", hex: getComputedStyleValue("--bs-info") },
  { name: "Light", hex: getComputedStyleValue("--bs-light") },
  { name: "Dark", hex: getComputedStyleValue("--bs-dark") },
  { name: "CUSTOM - Navy", hex: getComputedStyleValue("--bs-navy") },
];

const Template = () => <ColorPalette colors={colors} />;

export const Default = Template.bind({});
