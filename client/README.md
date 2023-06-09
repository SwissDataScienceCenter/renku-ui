# renku-ui/client

TEST PR

The React-based client for renku. The primary source of documentation for renku UI is in the [root of the repo](../). This readme is focused on some particular details about the client.

## package.json/overrides

The project is now using [rect-18](https://github.com/facebook/react/blob/main/CHANGELOG.md), but the current version of [storybook](https://github.com/storybookjs/storybook), 6.5.15, is not fully compatible it. As a result, some packages need to be overridden to prevent peer-dependency complaints. This should hopefully be fixed when [storybook 7](https://github.com/storybookjs/storybook/issues/13491) is released.

## RTK Query Code Generation

Please refer to the [README file in the .rtk folder](./.rtk/README.md) for more details.
