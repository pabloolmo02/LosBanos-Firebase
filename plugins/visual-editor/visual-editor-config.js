export const EDIT_MODE_STYLES = `
  [data-stack-edit-id]:not(style) {
    cursor: pointer;
    outline: 1px dashed #44aaff !important;
    outline-offset: -1px;
    transition: all 0.2s ease-in-out;
  }
  [data-stack-edit-id]:not(style):hover {
    outline: 1px solid #44aaff !important;
    background: #44aaff11;
    box-shadow: 0 0 0 1px #44aaff;
  }
`;

export const ALLOWED_PARENT_ORIGINS = [
  'http://localhost:5173',
  'https://react-inline.web.app',
  'https://react-inline-dev.web.app'
];
