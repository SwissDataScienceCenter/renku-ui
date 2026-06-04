// Guards against React crashes when the DOM is manipulated by extensions like Google Translate
// ? Reference: https://github.com/facebook/react/issues/11538#issuecomment-417504600
declare global {
  interface Window {
    __renku_appliedDOMFix?: boolean;
  }
}

export function fixExternalDOMMutationsCrashes() {
  // Prevent invoking the code twice
  if (typeof window !== "object" || window.__renku_appliedDOMFix) return;

  if (typeof Node === "function" && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (console) {
          // eslint-disable-next-line no-console
          console.warn(
            "Cannot remove a child from a different parent",
            child,
            this,
          );
        }
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(
      newNode: T,
      referenceNode: Node | null,
    ): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (console) {
          // eslint-disable-next-line no-console
          console.warn(
            "Cannot insert before a reference node from a different parent",
            referenceNode,
            this,
          );
        }
        return newNode;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };
  }

  window.__renku_appliedDOMFix = true;
}
