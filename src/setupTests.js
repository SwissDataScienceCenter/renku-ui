if (global.document) {
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: "BODY",
      ownerDocument: document,
    },
    createContextualFragment: (html) => {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.children[0]; // so hokey it's not even funny
    }
  })
}
