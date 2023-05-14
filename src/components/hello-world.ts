import stylesheet from "./style/hello-world.scss?stylesheet";
import html from "./html/hello-world.html?raw";

class HelloWorld extends HTMLElement {
  counter: number = 0;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.innerHTML = html;
    shadowRoot.adoptedStyleSheets = [stylesheet];

    const button = shadowRoot.querySelector('button')!;
    const countElement = button.querySelector('span')!;
    countElement.innerText = String(this.counter);
    button.addEventListener('click', () => {
      countElement.innerText = String(++this.counter);
    });
  }
}

customElements.define('hello-world', HelloWorld);
export {HelloWorld as default};
