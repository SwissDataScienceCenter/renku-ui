declare module "bootstrap" {
  export class Dropdown {
    static getOrCreateInstance(
      element: Element,
      config?: Record<string, unknown>,
    ): Dropdown;
    static getInstance(element: Element): Dropdown | null;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
  }
}
