export const googleScripts = {
  doc2html: {
    action: 'doc2html',
    payload: {},
    icon: 'path/to/doc2html-icon.svg',
    text: 'Convert DOC to HTML',
    title: 'DOC to HTML',
    tooltip: 'Convert your document from DOC format to HTML.'
  },
  htmlCopy: {
    action: 'copyToClipboard',
    payload: {},
    icon: 'path/to/copy-icon.svg',
    text: 'Copy to Clipboard',
    title: 'Copy HTML',
    tooltip: 'Copy the HTML content to your clipboard.'
  },
  deleteHtml: {
    action: 'deleteHTMLtags',
    payload: {},
    icon: 'path/to/delete-icon.svg',
    text: 'Delete HTML Tags',
    title: 'Delete Tags',
    tooltip: 'Remove HTML tags from your document.'
  },
  html2doc: {
    action: 'html2doc',
    payload: {},
    icon: 'path/to/html2doc-icon.svg',
    text: 'Convert HTML to DOC',
    title: 'HTML to Doc',
    tooltip: 'Convert your HTML content back to DOC format.'
  },
  aiReadDoc: {
    action: 'aiReadDoc',
    payload: {},
    icon: 'path/to/ai-icon.svg',
    text: 'AI Read Document',
    title: 'AI Reader',
    tooltip: 'Use AI to read and summarize your document.'
  },
  // Surprise addition: Dark mode toggle
  toggleDarkMode: {
    action: 'toggleDarkMode',
    payload: {mode: 'dark'},
    icon: 'path/to/dark-mode-icon.svg',
    text: 'Toggle Dark Mode',
    title: 'Dark Mode',
    tooltip: 'Switch between light and dark modes.'
  }
};
