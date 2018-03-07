const EDIT = 'edit';
const PREVIEW = 'preview';

const patterns = {

  // Matches (!)[linkText](filePath) references.
  // linkText goes to first, filePath to second match group.
  fileRefFull: /!?\[(.*?)]\((.*?)\)/g,

  // Matches ![linkText](queryString references.
  // (!)[linkText] goes to first, query to second match group.
  fileRefTrigger: /(!?\[[^\])]+])\(([^)]*$)/
};


export { EDIT, PREVIEW, patterns };
