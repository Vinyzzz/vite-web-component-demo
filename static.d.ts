declare module "*.scss?stylesheet" {
  const styleSheet: CSSStyleSheet;
  export default styleSheet;
}
declare module "*.html?raw" {
  const html: string;
  export default html;
}
