# Coding Guidelines

New code files should adhere to the coding guidelines listed in this document.
Existing code may or may not conform to these guidelines and contributors are
encouraged to refactor code to follow the guidelines when it is relevant to do
so.

The purpose of the guidelines is to ensure code remains maintainable and easy to
read as the code base grows.

## Adding new rules

Add new rules at the bottom of the list, incrementing the rule number by 1. Do
not re-order rules so that they keep a stable number.

## Guidelines

Rules:

- [R001: Use utility functions to create CSS class names](#r001-use-utility-functions-to-create-css-class-names)
- [R002: Avoid `condition ? true : false`](#r002-avoid-condition--true--false)
- [R003: Avoid nested `if/else` blocks](#r003-avoid-nested-ifelse-blocks)
- [R004: Include a default export when appropriate](#r004-include-a-default-export-when-appropriate)
- [R005: File naming conventions](#r005-file-naming-conventions)
- [R006: Use existing Bootstrap classes or import from CSS modules](#r006-use-existing-bootstrap-classes-or-import-from-css-modules)

### R001: Use utility functions to create CSS class names

**✅ DO**

```ts
import cx from "classnames";

const className = cx(
  "rounded",
  disabled && "btn-disabled",
  color && `btn-${color}`
);
```

**❌ DON'T**

```ts
const className = "rounded" + (disabled ? " disabled" : "");
```

**💡 Rationale**

Constructing CSS class names by hand leads to frequent mistakes, e.g.
having `undefined` or `null` as one of the CSS classes of an HTML element.

**💭 Tip**

We agreed on using `cx` in every case, except when there is only
_one_ class name as a string.

```tsx
const padding = someCondition ? "p-2" : "p-3";

<MyComponent className="p-2" />
<MyComponent className={cx("p-2", "text-danger")} />
<MyComponent className={cx(padding)} />

```

### R002: Avoid `condition ? true : false`

**✅ DO**

```ts
const isActive = conditionA && x > y && conditionC;
```

**❌ DON'T**

```ts
const isActive = conditionA && x > y && conditionC ? true : false;
```

**💡 Rationale**

The `? true : false` construct is unnecessary and may surprise the reader,
leading to slower code reading.

**💭 Tip**

Use double boolean negation to ensure the variable is of type `boolean`.

```ts
const enabled = !!objMaybeUndefined?.field.length;
```

### R003: Avoid nested `if/else` blocks

**✅ DO**

```ts
function getStatus(input: Input) {
  if (condA && condB && condC) {
    return "success";
  }
  if (condA && condB) {
    return "fairly good";
  }
  if (condA) {
    return "warning";
  }
  if (condB && condC) {
    return "critical";
  }
  return "not quite there";
}
```

**❌ DON'T**

```ts
function getStatus(input: Input) {
  if (condA) {
    if (condB) {
      if (condC) {
        return "success";
      } else {
        return "fairly good";
      }
    } else {
      return "warning";
    }
  } else if (condB && condC) {
    return "critical";
  } else {
    return "not quite there";
  }
}
```

**💡 Rationale**

Nested `if/else` block are hard to read and follow, especially when
they span more than one screen vertically.

If possible, use early returns to flatten the case enumeration. This means in
some cases, separating this logic into a utility function is recommended.

When the logic is short, cascading ternary operators can be used, e.g.

```ts
const status =
  response === "hello"
    ? "greeting"
    : response === "bye"
    ? "leaving"
    : response.startsWith("says:")
    ? "talking"
    : "idle";
```

### R004: Include a default export when appropriate

Include a `default` export when a main component is defined in a source file
(this should be the usual case).

**✅ DO**

```tsx
export default function MyComponent() {
  return (
    <div>
      <h2>My Component</h2>
      <p>Hello, World!</p>
    </div>
  );
}
```

**💡 Rationale**

The main component being exported as a `default` export is a common convention
with `React` projects.

The `default` export also shows which component is a the top level and which
ones are sub-components.

### R005: File naming conventions

**React Components**

Use the component name as a file name. The file name as well as the component
name should use CamelCase.

Example: `MyComponent.tsx`

**Type Definitions**

Type definition file names start with a lowercase letter and end with
`.types.ts`.

Example: `workflows.types.ts`

**Hook Definitions**

Reusable hooks should be defined in their own file, be a default export,
use the hook name as a file name and have the extension `.hook.ts`.

Example: `useRenku.hook.ts`

**Utility Functions**

Utility file names start with a lowercase letter and end with `.utils.ts`.

Example: `sessions.utils.ts`

**API Definitions**

Files defining RTK Query endpoints start with a lowercase letter and end with
`.api.ts`.

Example: `projects.api.ts`

**Slice Definitions**

Files defining RTK slices start with a lowercase letter and end with
`.slice.ts`.

Example: `user.slice.ts`

**Test Definitions**

Test file names start with a lowercase letter and end with `.test.ts` for unit
tests or with `.spec.ts` for Cypress tests.

Example: `login.test.ts` or `datasets.spec.ts`

### R006: Use existing Bootstrap classes or import from CSS modules

**✅ DO**

```tsx
<Card className={cx("m-3", "py-2")} />
```

```tsx
import styles from "SpecialCard.module.scss";

<Card className={cx(styles.projectCard)} />;
```

**❌ DON'T**

```tsx
import "./SpecialCard.css";

<Card className="my-special-card-class" />;
```

**💡 Rationale**

We want to avoid an explosion of the number of CSS classes, as well as
classes polluting the global namespace.
Since everyone knows Bootstrap, it is a good idea to use it as much as
possible. Should the need arise for very specific styling, we can always
create a new class in a local (S)CSS module file and import it.

**💭 Tip**

We want to push for sticking to Bootstrap's utility classes as much as possible.
This means we should discuss for deviations from a reference design when that
only minimally impacts the interface.

E.G. If a Figma design reference file shows a distance between components
of 14.5px and `m-3` is 16px, we should use `m-3` instead.
