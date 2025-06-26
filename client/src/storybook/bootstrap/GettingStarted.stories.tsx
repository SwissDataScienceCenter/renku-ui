import { Meta } from "@storybook/react";
//eslint-disable-next-line
const markdown = `
## Getting Started

Welcome to the UI component library documentation.

This project uses the following technologies and libraries:

- **SASS** for writing modular and maintainable CSS.
- **Bootstrap Icons** for consistent and flexible icon usage across components.
- **Reactstrap** for Bootstrap-based React components.

### Design Guidelines

For designers, all design components and styles can be found in our Figma library:

👉 _Figma design library (pending final URL)_

### Developer Setup

We use Bootstrap’s SCSS architecture. Below is an example of how you can import Bootstrap SCSS files into your custom styles:

\`\`\`scss
@import "~bootstrap/scss/functions";
@import "~bootstrap/scss/variables";
@import "~bootstrap/scss/variables-dark";
@import "~bootstrap/scss/maps";
@import "~bootstrap/scss/mixins";

.navLink {
  color: var(--bs-rk-text);
}
\`\`\`

Make sure to install the required dependencies:

\`\`\`bash
npm install bootstrap bootstrap-icons reactstrap
\`\`\`

And import Bootstrap icons globally in your app entry point:

\`\`\`ts
import 'bootstrap-icons/font/bootstrap-icons.css';
\`\`\`

### Notes

- Always use the \`var(--bs-...)\` CSS variables for consistent theming.
- Use \`reactstrap\` components whenever possible to ensure visual and behavioral consistency.
- Follow the component folder structure and naming conventions as outlined in the project’s contributing guide (if available).
`;

export default {
  title: "Getting Started",
  parameters: {
    docs: {
      description: {
        story: markdown,
      },
    },
  },
} as Meta;

export const Introduction = () => <></>;
Introduction.storyName = "Getting Started Guide";
