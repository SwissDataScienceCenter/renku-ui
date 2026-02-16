// Forces bootstrap javascript sources to be loaded on the client-side only.

import "bootstrap";

console.log("importing bootstrap");

(window as any).__bootstrap = "hello";

export {};
