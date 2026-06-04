// Guards against React crashes when the DOM is manipulated by extensions like Google Translate
// ? Reference: https://github.com/facebook/react/issues/11538#issuecomment-417504600
export function fixExternalDOMMutationsCrashes() {
  if (typeof Node === "function" && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      // Translate moved it, detach from its real parent.
      if (child.parentNode !== this) {
        if (child.parentNode) {
          child.parentNode.removeChild(child);
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
        // Reference node was moved. Do not throw, append instead
        return originalInsertBefore.call(this, newNode, null) as T;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };
  }
}
