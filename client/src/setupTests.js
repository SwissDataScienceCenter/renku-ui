// ? reference: https://www.npmjs.com/package/jest-localstorage-mock#in-create-react-app
import "jest-localstorage-mock";

if (global.document) {
  document.createRange = () => ({
    setStart: () => {
      // eslint-disable-line @typescript-eslint/no-empty-function
    },
    setEnd: () => {
      // eslint-disable-line @typescript-eslint/no-empty-function
    },
    commonAncestorContainer: {
      nodeName: "BODY",
      ownerDocument: document,
    },
    createContextualFragment: (html) => {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.children[0]; // so hokey it's not even funny
    }
  });
}
if (global.console) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
  };
}
global.IS_REACT_ACT_ENVIRONMENT = true;
