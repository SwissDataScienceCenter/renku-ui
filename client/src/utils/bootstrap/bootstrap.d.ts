// Bootstrap's dist build ships no types. Declare only the Dropdown API this app uses.
declare module "bootstrap" {
  export class Dropdown {
    static getOrCreateInstance(element: Element): Dropdown;
    hide(): void;
    dispose(): void;
  }
}
